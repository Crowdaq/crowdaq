// initial state
// shape: [{ id, quantity }]
const state = () => ({
    project_file: []
});

// getters
const getters = {

};

// actions
const actions = {

};

// mutations
const mutations = {
    open_file (state, payload) {
        const {type, id} = payload;
        state.project_file.push({
            type, id
        })
    }
};


export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
