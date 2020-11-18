import _ from "lodash";

export default {
    methods: {
        /**
         * Results
         */
        get_annotation_group_result_list(annotation_group_id){
            return this.$store.getters['annotations/get_annotation_group_result_list'](annotation_group_id);
        },

        get_annotation_group_result(annotation_group_id, repeated_group_result_id=undefined){
            return this.$store.getters['annotations/get_annotation_group_result'](annotation_group_id, repeated_group_result_id);
        },


        get_annotation_result(annotation_group_id,
                              annotation_id,
                              repeated_group_result_id=undefined){
            return this.$store.getters['annotations/get_annotation_result'](annotation_group_id,
                annotation_id,
                repeated_group_result_id);
        },

        update_annotation_result(result,
                                 annotation_group_id,
                                 annotation_id,
                                 repeated_group_result_id=undefined){
            this.$store.commit("annotations/update_annotation_result",
                {
                    result,
                    annotation_group_id,
                    annotation_id,
                    repeated_group_result_id
            });
        },

        add_empty_repeated_response(annotation_group_id){
            this.$store.commit("annotations/add_empty_repeated_response",
                {
                    annotation_group_id,
                });
        },

        delete_repeated_group_response(annotation_group_id, repeated_group_result_id){
            this.$store.commit("annotations/delete_repeated_group_response",
                {
                    annotation_group_id, repeated_group_result_id
                });
        },

        /**
         * Definitions:
         */

        get_annotation_group_definition(ag_id){
            const ret = this.$store.getters['annotations/get_annotation_group_definition'](ag_id);
            if (ret === undefined){
                return {}
            }else{
                return ret;
            }
        },

        get_annotation_definition(ag_id, annotation_id){
            return this.$store.getters['annotations/get_annotation_definition'](ag_id, annotation_id);
        },


        /***
         * Context
         */

        get_context_from_id(ctx_id){
            const ret= this.$store.getters['annotations/get_context'](ctx_id);
            return ret === undefined ? {} : ret;
        },

        /**
         * Conditions
         */

        get_all_conditions(){
            const ret= this.$store.getters['annotations/get_all_conditions'];
            return ret;
        },

        display_condition_matched(annotation_group_id, annotation_id, repeated_group_result_id){
            // const annotation = this.get_annotation_definition(ag_id, annotation_id);
            // if (annotation.conditions === undefined) {
            //     return true;
            // }else{
            //     for (let i in annotation.conditions){
            //         const cond = annotation.conditions[i];
            //         const current_value = this.get_annotation_result(ag_id, cond.id, repeated_group_result_id)
            //         if (current_value !== cond.value){
            //             return false;
            //         }
            //     }
            //     return true;
            // }
            const ret = this.$store.getters['annotations/get_annotation_display_condition'](annotation_group_id, annotation_id, repeated_group_result_id);
            return ret.display;

        },

        /**
         * Status
         */

        get_annotation_status(ag_id, annotation_id, repeated_group_result_id=undefined){
            const ret= this.$store.getters['annotations/get_annotation_status'](ag_id, annotation_id, repeated_group_result_id);
            return ret;
        },

        get_annotation_group_status(ag_id){
            let ret = this.$store.getters['annotations/get_annotation_group_status'](ag_id);
            return ret;
        },

        get_annotation_group_counting_status(ag_id){
            let ret = this.$store.getters['annotations/get_annotation_group_counting_status'](ag_id);
            if (ret === undefined){
                return {
                    pass: false,
                    messages: []
                }
            }
            if (ret.messages === undefined){
                ret.messages = []
            }
            return ret;
        },

        get_annotation_group_can_add_new_response(ag_id){
            let ret = this.$store.getters['annotations/get_annotation_group_can_add_new_response'](ag_id);
            return ret;
        }
    },

    computed: {
        all_registered_annotation_groups(){
            return this.$store.getters["annotations/list_registered_annotation_groups"];
        },

        all_annotation_group_is_finished(){
            return this.$store.getters['annotations/all_annotation_group_is_finished'];
        },

        get_all_annotation_result(){
            const result =  this.$store.getters['annotations/get_all_results'];
            const condition =  this.$store.getters['annotations/get_all_conditions'];
            const filteredResult = {}

            _.each(result, (agr, agid) => {
                if (agr instanceof Array){
                    filteredResult[agid] =  _.map(agr, (gr, rgidx) => {
                        const far = {};
                        _.each(gr, (ar, aid) => {
                            try{
                                if (condition[agid][rgidx][aid].display){
                                    far[aid] = ar;
                                }    
                            }catch (e) {
                                console.log(e);
                            }
                            
                        });
                        return far;
                    })
                }else{
                    const far = {};
                    _.each(agr, (ar, aid) => {
                        if (condition[agid][aid].display){
                            far[aid] = ar;
                        }
                    });
                    filteredResult[agid] = far;
                }
            });
            // for (let ag_id of result){
            //     const ag_result = result[ag_id];
            //     filteredResult[ag_id] = {}
            //     for(let aid of ag_result){
            //         if (condition[ag_id][aid]){
            //             filteredResult[ag_id][aid] = ag_result[aid];
            //         }
            //     }
            // }

            return {
                filteredResult, result, condition
            }
        },

        get_all_annotation_status(){
            return this.$store.getters['annotations/get_all_status'];
        },

        ready_to_submit(){
            const ags = this.all_registered_annotation_groups;
            for (let key in ags){
                let ag = ags[key];
                if (this.get_annotation_group_status(ag.id) !== true){
                    return false;
                }
            }
            return true;
        }


    },

    data: () => ({

    })
}