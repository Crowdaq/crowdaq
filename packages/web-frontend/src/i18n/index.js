import Vue from 'vue'
import VueI18n from 'vue-i18n'
import router from "../router";
import messages from "./messages";

Vue.use(VueI18n);

// Create VueI18n instance with options
const i18n = new VueI18n({
    locale: 'en', // set locale
    messages, // set locale messages
});

export default i18n