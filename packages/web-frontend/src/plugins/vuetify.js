import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        themes: {
            light: {
                primary: '#264653',
                info: '#264653',

                secondary: '#2a9d8f',
                success: '#2a9d8f',

                accent: '#e9c46a',
                warning: '#f4a261',
                error: '#e76f51',

                // primary: '#36C5F0',
                // secondary: '#2EB67D',
                // accent: '#ECB22E',
                // error: '#E01E5A',

            },
        },
    },
    icons: {
        iconfont: 'mdiSvg',
    },
})
