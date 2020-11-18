<template>
    <div>

        <v-alert
                text
                color="info"
                v-if="display_exam_result">
            <v-row align="center">
                <v-col class="shrink">
                    <v-btn
                            color="success"
                            v-on:click="submit_external_question">
                        Submit Now
                    </v-btn>
                </v-col>
                <v-col class="grow">
                    <p>This job will auto-submit and auto-reload in {{submission_countdown}} seconds, or you can submit
                        now by clicking the Submit Now button.

                    <p>Results: Your grade is {{exam_result_message.correct_count}} / {{exam.total_questions}} =
                        {{Math.round(exam_result_message.correct_count * 100 / exam.total_questions)}} %,
                        and the passing grade is {{Math.round(exam_result_message.passingGrade * 100)}} %</p>
                </v-col>
            </v-row>
        </v-alert>


        <v-container fluid>
            <form
                    name='mturk_form'
                    method='post'
                    id='mturk-external-submit-form'
                    v-bind:action="hit_data.submit_to_url"
                    hidden
            >
                <input type='hidden' name='assignmentId' id='assignmentId' v-bind:value="hit_data.assignment_id"/>
                <input name="mturk_submit_payload" type="hidden" v-model="mturk.mturk_submit_payload">
            </form>


            <v-row>
                <v-col cols="3">

                    <v-card outlined v-if="cannotAttemptMsg !== ''">
                        {{cannotAttemptMsg}}
                    </v-card>

                    <v-card outlined>
                        <v-card-title>Status (Remain attempts: {{exam.remain_attempts}})</v-card-title>
                        <v-divider class="mx-4"></v-divider>
                        <v-card-text
                                class="text-center"
                        >
                            <v-progress-linear
                                    color="secondary"
                                    height="25"
                                    v-bind:value="exam.progress * 100 / Math.max(exam.total_questions, 1)"
                            >
                                <strong>{{ exam.progress }} / {{exam.total_questions}}</strong>
                            </v-progress-linear>
                        </v-card-text>

                        <v-card-actions>
                            <v-btn
                                    tile
                                    color="secondary"
                                    :disabled="should_disable_submit_button"
                                    v-on:click="submit_response"
                            >
                                Submit
                            </v-btn>
                        </v-card-actions>


                    </v-card>
                </v-col>
                <v-col style="overflow-y: scroll; height: 960px">
                    <div v-for="(question, idx) in exam.questions" v-bind:key="idx">
                        <MCQuestion
                                v-if="question.type === 'multiple-choice'"
                                v-bind:question="question"
                                v-bind:is_answered="is_answered(question.question_id)"
                                v-on:input="handle_exam_response"
                        ></MCQuestion>
                        <v-divider class="mx-4"></v-divider>

                    </div>
                </v-col>
            </v-row>
        </v-container>
    </div>

</template>

<script>

    import MCQuestion from "../../components/MCQuestion";
    import ExternalQuestion from "../../mixins/external_question"
    import Vue from "vue";

    export default {
        name: 'ExamAnnotationInterface',
        mixins: [
            ExternalQuestion
        ],
        components: {
            MCQuestion
        },
        data: function () {
            return {
                cannotAttemptMsg: "",
                display_exam_result: false,
                submission_countdown: 5 * 60,
                disable_pre_submit_button: false,
                exam_result_message: {
                    correct_count: 0,
                    passingGrade: 0.7,
                },
                exam: {
                    instruction_id: "",
                    tutorial_id: "",
                    remain_attempts: 0,
                    questions: [],
                    progress: 0,
                    total_questions: 0,
                    user_response: {},
                    assignment_id: "",
                }

            }
        },
        computed: {
            hit_data() {
                return this.$store.getters['worker_app_store/get_hit_data'];
            },

            should_disable_submit_button() {
                return this.exam.total_questions === 0 || this.exam.progress < this.exam.total_questions || this.disable_pre_submit_button;
            },
            instruction_url() {
                return '/w/instruction/' + this.$route.params.owner + '/' + this.exam.instruction_id;
            },
            tutorial_url() {
                return '/w/tutorial/' + this.$route.params.owner + '/' + this.exam.tutorial_id;
            },
        },
        methods: {
            submit_response() {
                const user_response = this.exam.user_response;
                const hit_data = this.hit_data;

                const {
                    worker_id,
                    worker_platform,
                } = this.hit_data;
                const {owner, exam_id} = this.$route.params;
                const exam_assignment_id = this.exam.exam_assignment_id;

                const response_object = {user_response, hit_data};
                this.$client.make_request("requester.exam.submit_assignment",
                    {
                        owner, exam_id, exam_assignment_id,
                        worker_id, worker_platform,
                        user_response
                    }).then(resp => {

                    if (resp.data.success) {
                        this.disable_pre_submit_button = true;
                        this.display_exam_result = true;
                        this.exam_result_message.correct_count = Math.round(resp.data.grade * this.exam.total_questions);
                        this.exam_result_message.passingGrade = resp.data.passingGrade;

                        const grade_p = Math.round(resp.data.grade * 100);
                        const passingGrade_p = Math.round(resp.data.passingGrade * 100);

                        // this.exam_result_message = "Please don't close this page now, this job will auto-submit and auto-reload in " + this.countdown + " seconds. \n" +
                        //     `Results: Your grade is ${correct_count}/${this.exam.total_questions}=${grade_p},` +
                        //     `and the passing grade is ${passingGrade_p}`;

                        setInterval(() => {
                            this.submission_countdown = this.submission_countdown - 1;
                        }, 1000);

                        setTimeout(() => {
                            this.submit_external_question();
                        }, this.submission_countdown * 1000);
                    }
                }).catch(err => {
                    //TODO: display warning.
                    // if (this.axios_error_with_status(err, 400)) {

                    //     this.$store.commit("alerts/add_message", {
                    //         message: err.response.data.message,
                    //         type: "error",
                    //     });
                    //     return;
                    // }

                    // this.handle_axios_error(err)
                });
            },

            fetchData() {

                const {owner, exam_id} = this.$route.params;
                console.log('Updating Worker Details')
                this.$store.commit('worker_app_store/update_page_info', this.$route);
                console.log('Worker Details Updated')

                const {
                    worker_id,
                    worker_platform,
                } = this.hit_data;

              console.log('Fetching Requests')

                this.$client.make_request("requester.exam.new_assignment",
                    {
                        owner, exam_id,
                        worker_id,
                        worker_platform
                    },
                    {notificationDuration: -10})
                    .then(resp => {
                        const data = resp.data;
                        this.exam.questions = data.questions;
                        this.exam.total_questions = this.exam.questions.length;
                        this.exam.exam_assignment_id = data._id;
                        this.exam.remain_attempts = data.remain_attempts;

                        this.$store.commit("worker_app_store/add_instruction", {
                            owner,
                            name: "Instruction",
                            instruction_id: data.instruction_id,
                            params: this.$route.query
                        });

                        this.$store.commit("worker_app_store/add_tutorial", {
                            owner,
                            name: "Tutorial",
                            tutorial_id: data.tutorial_id,
                            params: this.$route.query
                        });


                    })
                    .catch(error => {
                      console.log(error);
                      this.$notify({
                        text:'error'
                      })
                    })
            },

            is_answered(task_id) {
                return this.exam.user_response[task_id] !== undefined;
            },

            handle_exam_response(resp) {
                const {task_id} = resp;
                this.exam.user_response[task_id] = resp.selected_index;
                this.exam.progress = Object.keys(this.exam.user_response).length;
            },

            update_progress() {
                this.exam.progress = Object.keys(this.exam.user_response).length;
            },

        },
        created() {
            // fetch the data when the view is created and the data is
            // already being observed
            this.fetchData()
        },
        watch: {
            // call again the method if the route changes
            '$route': 'fetchData',
            'exam.user_response': "update_progress"
        },
    }
</script>
