import axios from 'axios'
import jsonwebtoken from "jsonwebtoken";
import router from "../router"
import Vue from "vue"

function getItemFromLocalStorage(key) {
    try {
        return window.localStorage.getItem('auth_token')
    } catch (e) {
        console.log(e);
        return undefined;
    }

}

export default class BackendClient {
    constructor(endpoint = "/apiV2") {
        this.endpoint = endpoint;
        this.axios = axios.create({
            headers: {
                "content-type": "application/json"
            },
            withCredentials: true
        });
    }

    async make_request(fn, args, option = {}) {

        const {
            handleError = true,
            notificationDuration = 10000
        } = option;

        const token = getItemFromLocalStorage('auth_token');
        const headers = {
            "content-type": "application/json"
        }

        if (token) {
            headers['authorization'] = `Bearer ${token}`
        }

        try {
            const ret = await this.axios.post(this.endpoint, {
                    fn, args
                }, {
                    headers
                }
            );
            return ret;
        } catch (error) {
            if (!handleError) {
                throw error;
            }
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                if (error.response.status === 401) {

                    Vue.notify({
                        text: "Access denied",
                        type: "error",
                        duration: notificationDuration
                    });

                    if (router.currentRoute.path !== "/login") {
                        router.push("/login");
                    }
                } else {
                    if (error.response.data.message) {
                        Vue.notify({
                            text: error.response.data.message,
                            type: "error",
                            duration: notificationDuration
                        });
                    } else {
                        Vue.notify({
                            text: JSON.stringify(error.response.data),
                            type: "error",
                            duration: notificationDuration
                        });
                    }
                }
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                Vue.notify({
                    text: "Cannot not connect to server",
                    type: "error",
                    duration: notificationDuration
                });

            } else {
                // Something happened in setting up the request that triggered an Error
                Vue.notify({
                    text: JSON.stringify(error.message),
                    type: "error",
                    duration: notificationDuration
                });
            }
        }
    }

    async makeMultipartRequest(fn, args, formData) {
        const token = window.localStorage.getItem('auth_token');
        formData.append("fn", JSON.stringify({
            fn, args
        }));

        return this.axios.post(this.endpoint, formData, {
                headers: {
                    "authorization": `Bearer ${token}`,
                    "content-type": "multipart/form-data"
                }
            }
        )
    }

    async login(username, password) {
        return this.make_request(
            `login`,
            {
                username, password
            }
        )
    }

    async logout(username, password) {
        return this.make_request(
            `logout`,
            {})
    }

    get Instruction() {
        return {
            list: (owner, page, page_size) => {
                return this.make_request(
                    "instruction.list",
                    {
                        owner,
                        page_option: {
                            page,
                            page_size
                        }
                    }
                )
            },
            get: (owner, instruction_id) => {
                return this.make_request(
                    "instruction.get",
                    {
                        owner, instruction_id
                    }
                )
            },
            update: (owner, instruction_id, definition) => {
                return this.make_request(
                    "instruction.update",
                    {
                        owner, instruction_id, definition
                    }
                )
            },
            delete: (owner, instruction_id) => {
                return this.make_request(
                    "instruction.delete",
                    {
                        owner, instruction_id
                    }
                )
            }
        };
    }


    get_current_user() {
        const auth_token = window.localStorage.getItem('auth_token');
        // const auth_token = Cookies.get('auth_token');
        let current_requester = undefined;
        if (auth_token !== "") {
            const token = jsonwebtoken.decode(auth_token);
            current_requester = (token && token.username) ? token.username : null;
        }
        return current_requester;
    }
}