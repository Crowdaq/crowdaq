import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store';

import vuetify from './plugins/vuetify';
import i18n from "./i18n";
import Client from "./client/client";
import {JsonValidator} from "@crowdaq/schema"

import Notifications from './notification'
import jsonwebtoken from "jsonwebtoken";

Vue.use(Notifications);

Vue.config.productionTip = false;
Vue.prototype.$client = Client;
Vue.prototype.$schema_validator = new JsonValidator();

Vue.mixin({
    methods: {

        get_current_crowdaq_user() {
            try {
                const auth_token = window.localStorage.getItem('auth_token');
                let current_requester = null;
                if (auth_token !== "" && auth_token !== null) {
                    const token = jsonwebtoken.decode(auth_token);
                    current_requester = (token && token.username) ? token.username : null;
                } else {
                    current_requester = null;
                }
                return current_requester;
            } catch (e) {
                return '';
            }

        },

        resolve_worker_profile() {
            const {assignmentId, hitId, turkSubmitTo, workerId} = this.$route.query;

            if (turkSubmitTo !== undefined && workerId !== undefined) {
                if (turkSubmitTo === "https://www.mturk.com/") {
                    return {
                        worker_id: workerId,
                        worker_platform: "mturk",
                        assignmentId, hitId
                    }
                } else if (turkSubmitTo === "https://workersandbox.mturk.com/") {
                    return {
                        worker_id: workerId,
                        worker_platform: "mturk-sandbox",
                        assignmentId, hitId
                    }
                }
            } else {
                const current_requester = this.get_current_crowdaq_user();
                return {
                    worker_id: current_requester,
                    worker_platform: 'crowdaq'
                }
            }


        },

        axios_error_with_status(error, status) {
            if (error.response) {
                if (error.response.status === status) {
                    return true;
                }
            }
            return false;
        },

        handle_axios_error(error) {
            {
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    if (error.response.status === 401) {
                        this.$notify({
                            text: "Access denied",
                            type: "error",
                        });
                        this.$router.push("/login");
                    }

                    if (error.response.data.message) {
                        this.$notify({
                            text: error.response.data.message,
                            type: "error",
                        });
                    } else {
                        this.$notify({
                            text: JSON.stringify(error.response.data),
                            type: "error",
                        });
                    }
                } else if (error.request) {
                    // The request was made but no response was received
                    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                    // http.ClientRequest in node.js
                    console.log(error.request);
                    this.$notify({
                        text: JSON.stringify(error.request),
                        type: "error",
                    });

                } else {
                    // Something happened in setting up the request that triggered an Error
                    this.$notify({
                        text: JSON.stringify(error.message),
                        type: "error",
                    });
                }
            }
        }
    }
});


const vueInstance = new Vue({
    router,
    store,
    vuetify,
    i18n,
    render: h => h(App)
}).$mount('#app');


// Change favicon based on location.
const change_favicon = () => {
    if (window.location.href.startsWith("https://dev.crowdaq.com")) {
        const favicon = document.getElementById("favicon-link");
        favicon.href = "/favicon-dev.ico";
    }

    if (window.location.href.startsWith("http://127.0.0.1") || window.location.href.startsWith("http://localhost")) {
        const favicon = document.getElementById("favicon-link");
        favicon.href = "/favicon-local.ico";
    }

};

change_favicon();

export default vueInstance;