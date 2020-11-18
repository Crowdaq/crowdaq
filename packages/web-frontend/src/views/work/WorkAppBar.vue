<template>
        <v-app-bar
            color="accent lighten-1"
        >

            <v-chip outlined class="mr-4">
                <span v-if="page_info.is_preview === true">
                     PREVIEW MODE
                </span>
                <span v-else>
                    Annotator: <span style="text-decoration: underline">{{hit_data.worker_id}}</span> of {{hit_data.worker_platform}}
                </span>
            </v-chip>
            <div
                    class="mr-4"
            >
                <v-menu open-on-hover bottom offset-y  v-if="links.instructions.length > 1">
                    <template v-slot:activator="{ on }">
                        <v-btn
                                outlined
                                color="primary"
                                v-on="on"
                        >
                            Instruction
                        </v-btn>
                    </template>

                    <v-list>
                        <v-list-item
                                v-for="(lo, idx) in links.instructions"
                                :key="idx"
                                :to="lo.link"
                        >
                            <v-list-item-title>
                                {{lo.name}}
                            </v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>

                <v-btn v-else-if="links.instructions.length === 1"
                       outlined
                       color="primary"
                       :to="links.instructions[0].link"
                       target="_blank">
                    {{links.instructions[0].name}}
                    <v-icon>mdi-open-in-new</v-icon>
                </v-btn>
            </div>

            <div class="mr-4">
                <v-menu open-on-hover bottom offset-y v-if="links.tutorials.length > 1">
                    <template v-slot:activator="{ on }">
                        <v-btn
                                outlined
                                color="primary"
                                v-on="on"
                        >
                            Tutorial
                        </v-btn>
                    </template>

                    <v-list>
                        <v-list-item
                                v-for="(lo, idx) in links.tutorials"
                                :key="idx"
                                :to="lo.link"
                        >
                            <v-list-item-title>
                                {{lo.name}}
                            </v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>

                <v-btn
                        v-else-if="links.tutorials.length === 1"
                        :to="links.tutorials[0].link"
                        target="_blank"
                        outlined
                        color="primary"
                >
                    {{links.tutorials[0].name}}
                    <v-icon>mdi-open-in-new</v-icon>
                </v-btn>
            </div>




            <v-spacer></v-spacer>


            <v-dialog v-model="feedback_dialog" max-width="600px">
                <template v-slot:activator="{ on }">
                    <v-btn
                            outlined class="mr-2 info--text"
                            v-on="on"
                    >
                        Feedback
                    </v-btn>
                </template>

                <v-card>
                    <v-card-title>
                        <span class="headline">Feedback to requester</span>
                    </v-card-title>
                    <v-card-text>
                        <v-container>
                            <v-row>
                                <v-col cols="12">
                                    <v-text-field
                                            label="Email (Optional)"
                                            v-model="feedback.email"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="12">
                                    <v-textarea
                                            outlined
                                            name="input-7-4"
                                            label="Your Feedback"
                                            v-model="feedback.content"
                                    ></v-textarea>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="blue darken-1" text @click="feedback_dialog = false">Cancel</v-btn>
                        <v-btn
                                color="blue darken-1"
                                text
                                @click="submit_feedback"
                                :disabled="feedback.content === ''"
                        >Send</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>


            <v-dialog
                    v-if="page_info.page_type === 'task'"
                    v-model="download_dialog"
                    width="500"
            >
                <template v-slot:activator="{ on }">
                    <v-btn
                            outlined class="mr-2 info--text"
                            v-on="on"
                            @click="create_result_download"
                    >
                        Cannot submit?
                    </v-btn>
                </template>

                <v-card>
                    <v-card-title
                            primary-title
                    >
                        Download result your computer.
                    </v-card-title>

                    <v-card-text>
                        In case you cannot submit your work, you can download this response and contact the requester with it.
                    </v-card-text>

                    <v-divider></v-divider>

                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <a
                                color="primary"
                                :href="result_to_download"
                                :download="$route.params.task_id+'.json'"
                        >
                            Click to Download
                        </a>
                    </v-card-actions>
                </v-card>
            </v-dialog>

        </v-app-bar>

</template>

<script>
    import AnnotationSystemMixin from "../../mixins/annotation_system";

    export default {
        name: "WorkerAppBar",
        mixins:[
            AnnotationSystemMixin,
        ],
        props: {
        },
        data: () => ({
            result_to_download: null,
            feedback_dialog: false,
            download_dialog: false,

            feedback: {
                email: "",
                content: "",
                resource_type: "",
                resource_owner: "",
                resource_id: ""
            },

        }),
        computed:{
            hit_data(){
                return this.$store.getters['worker_app_store/get_hit_data'];
            },
            page_info(){
                return this.$store.getters['worker_app_store/get_page_info'];
            },
            links(){
                return this.$store.getters['worker_app_store/get_links'];
            }

        },
        mounted() {
            this.update_pageinfo();
        },
        watch: {
            "$route": function(){
                this.update_pageinfo();
            },
        },
        methods: {
            update_pageinfo(){
                this.$store.commit("worker_app_store/clear_links",{});
                const {query, params, meta} = this.$route;
                this.$store.commit("worker_app_store/update_page_info",
                    {query, params, meta});
            },

            create_result_download(){
                // this.result_to_download = JSON.stringify(this.get_all_annotation_result);
                this.result_to_download = window.URL.createObjectURL(
                    new Blob([JSON.stringify(this.get_all_annotation_result)], {type: 'text/json;charset=utf-8;'}))
            },

            submit_feedback(){
                const feedback = this.feedback.content;
                const full_url = window.location.href;
                const worker_email = this.feedback.email;

                const {
                    worker_id,
                    worker_platform
                } = this.resolve_worker_profile();

                const {
                    owner,
                    instruction_id,
                    tutorial_id,
                    exam_id,
                    annotation_taskset_id,
                    annotation_task_id,
                } = this.$route.params;


                return this
                    .$client
                    .make_request(
                        "feedback.submit", {
                            owner,
                            instruction_id,
                            tutorial_id,
                            exam_id,
                            annotation_taskset_id,
                            annotation_task_id,
                            feedback,
                            worker_email,
                            worker_id,
                            worker_platform,
                            full_url
                        }
                    ).then(resp => {
                        this.feedback_dialog=false;
                        // this.$notify("alerts/add_message", {
                        //     message: "Feedback saved, thanks.",
                        //     type: "primary",
                        // });
                }).catch(err => {
                    this.feedback_dialog=false;
                    this.handle_axios_error(err)
                })
            }
        },
    }
</script>