import Vue from "vue";
import Task from "../../lib/tasks"


const state = () => ({
    annotation_groups: [],

    // This two items are for indexing.
    annotation_groups_indices: {},
    annotation_groups_annotation_indices: {},

    contexts: [],
    // For indexing.
    context_indices: {},

    results: {},

    // This status is the most detailed annotations for everything in the current system.
    // Type: ag_id => (repeated_group_id | optional) => annotation_id =>
    // { pass: Bool, messages: List[String]}
    // Optional information is already handled in this
    annotation_status: {},

    // This stores if a repeated annotation matches optional/min-max constraints.
    // Type: ag_id => (annotation_id) =>
    // { pass: Bool, messages: List[String]}
    annotation_group_counting_status: {},

    // This is the cached results for conditional annotations.
    // If the value is true, than this annotation should be displayed.
    // Type: ag_id => (repeated_group_id | optional) => annotation_id => Condition Graph Node
    annotation_display_condition: {},

    // This is combined group status cache.
    // If worker can submit the current response depend on this.
    // Type: ag_id => { pass: Bool, messages: List[String]}
    annotation_group_combined_status_cache: {},
    // This field decided if an annotation group can add new response.
    // Type: ag_id => Bool
    annotation_group_can_add_new_response: {},
});

// getters
const getters = {
    list_registered_annotation_groups(state) {
        return Object.values(state.annotation_groups);
    },


    get_annotation_group_definition: (state) => (ag_id) => {
        return state.annotation_groups.find(x => (x.id === ag_id));
    },

    get_annotation_definition: (state) => (ag_id, aid) => {
        const ag_def = state.annotation_groups.find(ag => {
            return ag.id === ag_id
        });

        if (ag_def === undefined) {
            return undefined;
        }
        return ag_def.annotations.find(ann => (aid===ann.id));
    },

    get_context: (state) => (ctx_id) => {
        return state.contexts.find(x => (x.id === ctx_id));
    },

    get_all_results(state) {
        return state.results;
    },

    get_all_status(state) {
        return state.annotation_status;
    },

    get_all_conditions(state){
        return state.annotation_display_condition;
    },

    get_annotation_group_result: (state) => (annotation_group_id, repeated_group_result_id) => {
        if (repeated_group_result_id === undefined || repeated_group_result_id === null){
            return state.results[annotation_group_id];
        }else{
            return state.results[annotation_group_id].find(x => (x.id === repeated_group_result_id));
        }
    },

    get_annotation_group_result_list: (state) => (annotation_group_id) => {
        return state.results[annotation_group_id];
    },

    get_annotation_result: (state) => (annotation_group_id, annotation_id, repeated_group_result_id) => {
        if (repeated_group_result_id === undefined){
            return state.results[annotation_group_id][annotation_id]
        }else{
            return state.results[annotation_group_id].find(x => (x.id === repeated_group_result_id))[annotation_id]
        }
    },

    get_annotation_display_condition_graph: (state) => (annotation_group_id, repeated_group_result_id) => {
        if (repeated_group_result_id === undefined){
            return state.annotation_display_condition[annotation_group_id]
        }else{
            return state.annotation_display_condition[annotation_group_id][repeated_group_result_id]
        }
    },

    get_annotation_display_condition: (state) => (annotation_group_id, annotation_id, repeated_group_result_id) => {
        if (repeated_group_result_id === undefined){
            return state.annotation_display_condition[annotation_group_id][annotation_id]
        }else{
            return state.annotation_display_condition[annotation_group_id][repeated_group_result_id][annotation_id]
        }
    },

    /**
     * For repeated groups.
     */
    get_annotation_group_status: (state) => (ag_id) => {
        return state.annotation_group_combined_status_cache[ag_id];
    },

    get_annotation_group_counting_status: (state) => (ag_id) => {
        return state.annotation_group_counting_status[ag_id]
    },


    get_annotation_status: (state) => (ag_id, annotation_id, repeated_group_result_id) => {
        const ag = state.annotation_status[ag_id];
        if (ag === undefined){
            return {
                pass: false
            }
        }else{
            if (repeated_group_result_id === undefined){
                return ag[annotation_id];
            }else{
                return ag.find(x => (x.id === repeated_group_result_id))[annotation_id];
            }
        }
    },

    get_annotation_group_can_add_new_response: (state) => (ag_id) => {
        return state.annotation_group_can_add_new_response[ag_id];
    },


    all_annotation_group_is_finished(state){
        for (let k in state.annotation_group_counting_status){
            const status = state.annotation_group_counting_status[k];
            if (status.pass !== true){
                return false;
            }
        }
        return true;
    },

};

// actions
const actions = {
    worker_updated_annotation(
        { state, getters, commit },
        {
            annotation_group_id,
            annotation_id,
            repeated_group_result_id,
            result
        }
        ){

    },
};


class MutationHelpers{
    static re_eval_annotation_group_status(state, ag, annotation_group_id){
        let new_group_status = true;
        let ag_status = state.annotation_status[annotation_group_id];
        if (ag.repeated === true){
            for (let group_status of ag_status){
                for (let aid in group_status){
                    if (aid === 'id') {
                        continue
                    }
                    let status = group_status[aid];
                    if (status.pass !== true && state.annotation_display_condition[annotation_group_id][group_status.id][aid].display){
                        new_group_status = false;
                        break;
                    }
                }

                if (new_group_status === false){
                    break;
                }
            }
        }else{
            for (let aid in ag_status){
                let status = ag_status[aid];
                if (status.pass !== true && state.annotation_display_condition[annotation_group_id][aid].display){
                    new_group_status = false;
                    break;
                }
            }
        }

        if (ag.repeated === true) {
            // Now we know new_group_status is the current group status. If we can add a new response depends on this.
            Vue.set(state.annotation_group_can_add_new_response, ag.id, new_group_status);
            // Then we also need to check if the optional/min-max constraints is satisfied.
            const new_counting_constraints_status =
                Task.eval_repeated_constraints(state.results[annotation_group_id], ag);

            Vue.set(
                state.annotation_group_counting_status,
                annotation_group_id,
                new_counting_constraints_status
            );
            // Now we reset the combined status.
            Vue.set(state.annotation_group_combined_status_cache, annotation_group_id,
                new_group_status &&
                new_counting_constraints_status.pass);
        }else{
            Vue.set(state.annotation_group_combined_status_cache, annotation_group_id, new_group_status);
        }
    }
}


// mutations
const mutations = {
    clear_annotation_system(state) {
        state.annotation_groups = [];
        state.annotation_groups_indices = {};
        state.annotation_groups_annotation_indices = {};

        state.contexts = [];
        state.context_indices = {};

        state.results = {};

        state.annotation_status = {};
        state.annotation_group_counting_status = {};

        state.annotation_display_condition = {};
        state.annotation_group_combined_status_cache = {};
        state.annotation_group_can_add_new_response = {};
    },

    register_annotation_groups(state, {annotation_groups}) {
        for (let i = 0; i < annotation_groups.length; i++) {
            const ag = annotation_groups[i];
            state.annotation_groups.push(ag);

            Vue.set(state.annotation_group_combined_status_cache, ag.id, false);

            if (ag.repeated === true){
                Vue.set(state.results, ag.id, []);
                Vue.set(state.annotation_status, ag.id, []);

                const counting_status_passed = false;

                Vue.set(state.annotation_group_counting_status, ag.id, {
                    pass: counting_status_passed,
                    messages:[]
                });

                Vue.set(state.annotation_group_combined_status_cache, ag.id, counting_status_passed);

                // Map from task_id to graph.
                Vue.set(state.annotation_display_condition, ag.id, {});
                Vue.set(state.annotation_group_can_add_new_response, ag.id, true);

            }else{
                const init_resp = Task.make_default_response(ag);
                Vue.set(state.results, ag.id, init_resp);
                Vue.set(state.annotation_status, ag.id, Task.make_default_status(ag));

                for (let aid in init_resp){
                    const value = init_resp[aid];
                    const annotation = ag.annotations.find(x => (x.id === aid));

                    Vue.set(
                        state.annotation_status[ag.id],
                        aid,
                        annotation.repeated === true ?
                            Task.eval_repeated_constraints(value, annotation) :
                            Task.eval_constraints(value, annotation, annotation.constraints)
                    )
                }


                // Non repeated annotation group do not require counting status.
                Vue.set(
                    state.annotation_group_counting_status,
                    ag.id,
                    Task.PASS()
                );
                Vue.set(state.annotation_display_condition, ag.id, Task.ConditionResolver.make_condition_graph(ag));

                Vue.set(state.annotation_group_combined_status_cache, ag.id, false);
            }

            MutationHelpers.re_eval_annotation_group_status(state, ag, ag.id);
        }
    },

    register_contexts(state, {contexts}) {
        for (let i = 0; i < contexts.length; i++) {
            const ctx = contexts[i];
            state.contexts.push(ctx)
        }
    },

    /**
     * Annotation status
     */

    // update_annotation_status(state, {status, annotation_group_id, annotation_id}){
    //     console.log(`Setting ${annotation_group_id}/${annotation_id} to ${status}`)
    //     if (state.annotation_status[annotation_group_id] === undefined) return;
    //     Vue.set(state.annotation_status[annotation_group_id], annotation_id, status);
    // },
    //
    // update_annotation_status_for_repeated_group(state, {status, annotation_group_id, annotation_id, repeated_group_status_id}){
    //     console.log(`Setting ${annotation_group_id}/${repeated_group_status_id}/${annotation_id} to ${status}`)
    //
    //     Vue.set(state.annotation_status[annotation_group_id][repeated_group_status_id], annotation_id, status);
    // },

    /**
     * Annotation results
     */
    add_empty_repeated_response(state, {annotation_group_id}){
        let ag = getters.get_annotation_group_definition(state)(annotation_group_id);
            // state.annotation_groups.find((ag) => (ag.id===annotation_group_id));

        // Make empty response.
        let new_response = Task.make_default_response(ag);
        new_response.id = Task.generate_id();
        state.results[annotation_group_id].push(new_response);

        // Make default status.
        let new_status = Task.make_default_status(ag);
        new_status.id = new_response.id;

        for (let aid in new_response){
            if (aid === 'id') {
                continue;
            }

            const value = new_response[aid];
            const annotation = ag.annotations.find(x => (x.id === aid));
            new_status[aid] = annotation.repeated === true ?
                Task.eval_repeated_constraints(value, annotation) :
                Task.eval_constraints(value, annotation, annotation.constraints);

        }


        state.annotation_status[annotation_group_id].push(new_status);

        // Initialize conditional annotations.
        let new_condition_graph = Task.ConditionResolver.make_condition_graph(ag);
        Vue.set(state.annotation_display_condition[annotation_group_id], new_response.id, new_condition_graph);

        // Update:
        //   * annotation_group_can_add_new_response
        //   * annotation_group_counting_status
        //   * annotation_group_combined_status_cache
        MutationHelpers.re_eval_annotation_group_status(state, ag, annotation_group_id);
        // After adding a new response we still need to check

    },

    delete_repeated_group_response(state, {annotation_group_id, repeated_group_result_id}){

        // First we need to remove results and status.
        let idx = state.results[annotation_group_id].findIndex((x) => (x.id === repeated_group_result_id));
        state.results[annotation_group_id].splice(idx, 1);

        idx = state.annotation_status[annotation_group_id].findIndex((x) => (x.id === repeated_group_result_id));
        state.annotation_status[annotation_group_id].splice(idx, 1);

        const ag = getters.get_annotation_group_definition(state)(annotation_group_id);

        // Update:
        //   * annotation_group_can_add_new_response
        //   * annotation_group_counting_status
        //   * annotation_group_combined_status_cache
        MutationHelpers.re_eval_annotation_group_status(state, ag, annotation_group_id);
    },

    update_annotation_result(state, {result, annotation_group_id, annotation_id, repeated_group_result_id}){
        /**
         * This mutation update single annotation field.
         */
        const ag = getters.get_annotation_group_definition(state)(annotation_group_id);
        const annotation = ag.annotations.find(x => (x.id === annotation_id));

        const check_status = annotation.repeated === true ?
            Task.eval_repeated_constraints(result, annotation) :
            Task.eval_constraints(result, annotation, annotation.constraints);

        if (repeated_group_result_id === undefined){
            // This is not a repeated group. we just need to set
            Vue.set(state.results[annotation_group_id], annotation_id, result);
            Vue.set(state.annotation_status[annotation_group_id], annotation_id, check_status);
            // Vue.set(state.annotation_group_counting_status, annotation_group_id, Task.PASS());
        }else{
            Vue.set(state.results[annotation_group_id].find(x => (x.id === repeated_group_result_id)), annotation_id, result);
            Vue.set(state.annotation_status[annotation_group_id].find(x => (x.id === repeated_group_result_id)), annotation_id, check_status);

            const new_counting_constraints_status =
                Task.eval_repeated_constraints(state.results[annotation_group_id], ag);

            Vue.set(
                state.annotation_group_counting_status,
                annotation_group_id,
                new_counting_constraints_status);
        }

        if (check_status.pass === true){
            /**
             * We only update status for valid input.
             */
            const group_annotation_results = getters.get_annotation_group_result(state)(annotation_group_id, repeated_group_result_id);
            const group_condition_graph = getters.get_annotation_display_condition_graph(state)(annotation_group_id, repeated_group_result_id);

            const new_group_condition_graph = Task.ConditionResolver.generate_new_display_status(
                group_condition_graph,
                group_annotation_results,
                annotation_id
            );

            if(repeated_group_result_id === undefined){
                Vue.set(state.annotation_display_condition, annotation_group_id, new_group_condition_graph)
            }else{
                Vue.set(state.annotation_display_condition[annotation_group_id], repeated_group_result_id, new_group_condition_graph)
            }
        }
        /**
         * Update group status.
         */
        MutationHelpers.re_eval_annotation_group_status(state, ag, annotation_group_id);
    },

    set_annotation_status(ag_id, annotation_id, status) {

    },
};


export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
