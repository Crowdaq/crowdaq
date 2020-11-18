// initial state
// shape: [{ id, quantity }]
const state = () => ({
    alert_messages: [],
    display_alert_message: false,
});

// getters
const getters = {
    has_alert_messages(state){
        return state.alert_messages.length > 0;
    },
    get_alert_messages(state){
        return state.alert_messages;
    },
    display_alert_messages(state){
        return state.display_alert_message;
    },
};

// actions
const actions = {

};

// mutations
const mutations = {
    add_message (state, payload) {
        const {message, type} = payload;
        state.alert_messages.push({
            message, type
        })
    },
    clear_messages (state) {
        state.alert_messages = [];
    },
    display_message (state) {
        state.display_alert_message = true;
    },
    hide_message (state) {
        state.display_alert_message = true;
    },
    remove_message (state, {idx}) {
        state.alert_messages.splice(idx, 1);
    },
};


export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
