// initial state
// shape: [{ id, quantity }]

import jsonwebtoken from "jsonwebtoken"

const state = () => ({
    links: {
        instructions: [],
        tutorials: [],
    },
    hit_data: {
        assignment_id: "",
        hit_id: "",

        submit_to: "",
        submit_to_url: "",

        worker_id: "",
        worker_platform: "",

        is_preview: true
    },
    page_info: {
        page_url: null,
        page_type: null,
        page_owner: null,
        page_id: null,
        current_requester: null,
        is_preview: true,
    },
});

// getters
const getters = {
    get_page_info(state){
        return state.page_info;
    },
    get_hit_data(state){
        return state.hit_data;
    },
    get_links(state){
        return state.links;
    },
};

// actions
const actions = {

};


function is_in_iframe() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}


// mutations
const mutations = {
    clear_links(state, payload){
        state.links.instructions = [];
        state.links.tutorials = [];
    },

    add_tutorial(state, payload){
        const {owner, tutorial_id, params, name} = payload;
        if (tutorial_id === undefined){
            return;
        }
        const link = `/w/tutorial/${owner}/${tutorial_id}?${new URLSearchParams(
            params
        ).toString()}`;
        state.links.tutorials.push({
            name, link
        });
    },

    add_instruction(state, payload){
        const {owner, instruction_id, params, name} = payload;
        if (instruction_id === undefined){
            return;
        }
        const link = `/w/instruction/${owner}/${instruction_id}?${new URLSearchParams(
            params
        ).toString()}`;
        state.links.instructions.push({
            name, link
        });
    },


    update_page_info (state, payload) {
        // Page status are resolved in this order:
        //     1. If we are in External Site Preview Mode.
        //          1. We will ignore id info in cookie.
        //     2. If a requester are logged in. We will use login info. This will override status.
        //     3. Otherwise we will take
        // Also we need to correctly config the the page type for feedback plugin.
        const {query, params, meta} = payload;
        state.page_info.page_url = window.location.href;
        state.page_info.page_type = meta.type;
        state.page_info.page_owner = params.owner;
        if (meta.type === "instruction"){
            state.page_info.page_id = params.instruction_id;
        }else if (meta.type === "tutorial") {
            state.page_info.page_id = params.tutorial_id;
        }else if (meta.type === "exam") {
            state.page_info.page_id = params.exam_id;
        }else if (meta.type === "task") {
            state.page_info.page_id = `${params.annotation_taskset_id}-${params.task_id}`;
        }

        const {assignmentId, hitId, turkSubmitTo, workerId} = query;
        state.hit_data.assignment_id = assignmentId? assignmentId: "";
        state.hit_data.hit_id = hitId? hitId: "";
        state.hit_data.submit_to = turkSubmitTo? turkSubmitTo: "";
        state.hit_data.worker_id = workerId? workerId: "";
        state.hit_data.submit_to_url = state.hit_data.submit_to ? state.hit_data.submit_to + "/mturk/externalSubmit" : "";

        if(is_in_iframe()){
            // We are in external site mode.
            console.log('IFrame Detected.')
            if (state.hit_data.assignment_id === 'ASSIGNMENT_ID_NOT_AVAILABLE') {
                state.page_info.is_preview = true;
            }else{
                state.page_info.is_preview = false;
            }

            if (turkSubmitTo === "https://www.mturk.com"){
                state.hit_data.worker_platform= "mturk"
            }else if (turkSubmitTo === "https://workersandbox.mturk.com"){
                state.hit_data.worker_platform="mturk-sandbox"
            }else{
                state.hit_data.worker_platform = "crowdaq";
            }
            console.log(JSON.stringify(state.hit_data))

        }else{
            // This is a direct visit.
            state.hit_data.worker_platform = "crowdaq";
            const auth_token = window.localStorage.getItem('auth_token');
            let current_requester = null;
            if (auth_token !== "" && auth_token !== null){
                const token = jsonwebtoken.decode(auth_token);
                current_requester = (token && token.username) ? token.username : undefined;
            }else{
                current_requester = undefined;
            }

            if (current_requester !== undefined){
                state.page_info.is_preview = false;
            }else{
                state.page_info.is_preview = true;
            }

            state.page_info.current_requester = current_requester;

            if (state.hit_data.worker_id === ""){
                state.hit_data.worker_id = current_requester;
            }else{
                state.hit_data.worker_id = `${current_requester || 'Anonymous user'} as ${state.hit_data.worker_id}`;
            }

            state.hit_data.is_preview = current_requester === undefined;
        }

    },
};


export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
