<template>
    <div>
        <v-row>
            <v-col cols="3">
                <v-card outlined>
                    <v-card-title>Your Progress</v-card-title>
                    <v-divider class="mx-4"></v-divider>
                    <v-card-text
                            class="text-center"
                    >
                        <v-progress-linear
                                color="primary"
                                height="25"
                                v-bind:value="progress_tracker.current_progress * 100 / Math.max(progress_tracker.total_progress, 1)"
                        >
                            <strong>{{ progress_tracker.current_progress }} / {{progress_tracker.total_progress}}</strong>
                        </v-progress-linear>
                    </v-card-text>


                </v-card>
            </v-col>
            <v-col style="overflow-y: scroll; height: 960px">
                <div v-for="(question, idx) in definition.question_set" v-bind:key="idx">
                    <MCQuestion
                            v-if="question.type === 'multiple-choice'"
                            v-bind:question="question"
                            v-bind:is_answered="is_answered(question.question_id)"
                            v-on:input="handle_response"
                    ></MCQuestion>

                    <p
                            v-if="response_is_correct(question)"
                            class="success--text pa-3"
                            style="border-color: #42b983 !important; border-style: solid !important;"
                    >
                        <v-icon color="success">mdi-check</v-icon>
                        {{question.explanation[user_response[question.question_id].selected_index]}}
                    </p>

                    <p
                            v-if="response_is_wrong(question)"
                            class="warning--text pa-3"
                            style="border-color: #d73a49 !important; border-style: solid !important;"
                    >
                        <v-icon color="warning">mdi-close</v-icon>
                        {{question.explanation[user_response[question.question_id].selected_index]}}
                    </p>

                    <v-divider class="mx-4 mb-1" ></v-divider>
                    <v-divider class="mx-4 mb-4" ></v-divider>

                </div>
            </v-col>
        </v-row>
    </div>
</template>
<script>
    import ProgressTracker from "../../mixins/progress_tracker";
    import MCQuestion from "../MCQuestion";

    export default {
        name: 'TutorialWrapper',
        mixins:
            [
                ProgressTracker,
            ],
        components: {
            MCQuestion
        },
        props: {
            definition: Object,
            // question_set: Array,
            // owner: String,
            // tutorial_id: String,
        },
        data: function(){
            return {
                user_response: {},
            }
        },
        computed: {},
        methods: {

            response_is_correct(question){
                const {question_id} = question;
                const resp = this.user_response[question_id];
                const ret = resp !== undefined && resp.selected_index === question.answer;
                return ret;
            },

            response_is_wrong(question){
                const {question_id} = question;
                const resp = this.user_response[question_id];
                const ret = resp !== undefined && resp.selected_index !== question.answer;
                return ret;
            },

            is_answered(task_id){
                return this.user_response[task_id] !== undefined
            },

            handle_response(resp){
                const {task_id} = resp;
                this.$set(this.user_response, task_id, resp);
                // this.user_response[task_id] = resp;
                this.set_progress(Object.keys(this.user_response).length);
            },
            update_progress(){
                this.set_progress(Object.keys(this.user_response).length);
            },

        },
        mounted() {
            this.progress_tracker.total_progress = this.definition.question_set.length;
        },
        watch: {
            // call again the method if the route changes
            'user_response': "update_progress",
            'definition': function(){
                this.progress_tracker.total_progress = this.definition.question_set.length;
                this.user_response = {};
            }
        },
    }
</script>