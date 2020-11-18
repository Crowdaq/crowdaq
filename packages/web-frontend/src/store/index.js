import Vue from 'vue'
import Vuex from 'vuex'

import createLogger from 'vuex/dist/logger'

import annotations from './modules/annotations'
import alerts from './modules/alerts'
import worker_app_store from './modules/worker_app_store'

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
    modules: {
        annotations,
        alerts,
        worker_app_store
    },
    strict: debug,
    plugins: debug ? [createLogger()] : []
})
