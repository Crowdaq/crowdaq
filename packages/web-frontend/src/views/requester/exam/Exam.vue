<template>
    <v-container>

        <v-row>
            <v-col>

                <v-btn :href="`/w/exam/${$route.params.owner}/${$route.params.exam_id}`" target="_blank" outlined color="info" class="mr-4" exact>
                    <v-icon>mdi-eye</v-icon>
                    Annotator View
                </v-btn>

<!--                <v-dialog v-model="dialog.publish_exam"-->
<!--                          max-width="640">-->
<!--                  <template v-slot:activator="{ on }">-->
<!--                    <v-btn outlined color="success" v-on="on" class="mr-4">-->
<!--                      <v-icon>mdi-publish</v-icon> Publish To Mturk-->
<!--                    </v-btn>-->
<!--                  </template>-->
<!--                    <MTurkPublisher-->
<!--                        :owner="$route.params.owner"-->
<!--                        :exam_id="$route.params.exam_id"-->
<!--                        :init_url="`/w/exam/${$route.params.owner}/${$route.params.exam_id}`"-->
<!--                        v-on:success="() => dialog.publish_exam = false"-->
<!--                    ></MTurkPublisher>-->
<!--                </v-dialog>-->

                <v-dialog v-model="dialog.update_exam_config"
                          max-width="640">
                    <template v-slot:activator="{ on }">
                        <v-btn outlined color="success" v-on="on" class="mr-4">
                            <v-icon>mdi-console</v-icon> Update Exam Configuration
                        </v-btn>
                    </template>
                    <ExamConfig
                        :owner="$route.params.owner"
                        :exam_id="$route.params.exam_id"
                        v-on:update="() => dialog.update_exam_config = false"
                    ></ExamConfig>
                </v-dialog>

                <v-dialog v-model="dialog.upload_question"
                          max-width="640">
                    <template v-slot:activator="{ on }">
                        <v-btn outlined color="success" v-on="on">
                            <v-icon>mdi-console</v-icon> Upload exam questions
                        </v-btn>
                    </template>
                    <v-card
                    >
                        <v-card-title>
                            Upload Exam questions
                        </v-card-title>
                        <v-card-text>
                            <v-file-input
                                v-model="fileupload.file"
                                accept=".json"
                                label="Upload your json exam definition (*.json)"
                            ></v-file-input>
                        </v-card-text>
                        <v-card-actions>
                            <v-btn
                                @click="handleUpload"
                            >Upload</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>

                <v-btn outlined color="success" @click="handleCreate">
                    <v-icon>mdi-plus</v-icon> Create Exam Question
                </v-btn>

            </v-col>
        </v-row>

        <v-row>
            <v-tabs grow>
                <v-tab link exact :to='`/requester/${$route.params.owner}/exam/${$route.params.exam_id}/report`'>Reports</v-tab>
                <v-tab link exact :to='`/requester/${$route.params.owner}/exam/${$route.params.exam_id}/questions`'>Questions</v-tab>
                <v-tab link exact :to='`/requester/${$route.params.owner}/exam/${$route.params.exam_id}/assignments`'>Assignments</v-tab>
            </v-tabs>
        </v-row>

        <v-row>
            <v-col cols="12">
                <router-view></router-view>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
    // @ is an alias to /src
    import ExamConfig from "../../../components/requester/configs/ExamConfig";
    import MTurkPublisher from "@/components/mturk/MturkPublisher";
    import _ from 'lodash';

    export default {
        name: 'RequesterExamView',
        components: {
            ExamConfig
        },
        data () {
            return {
                dialog: {
                    upload_question: false,
                    update_exam_config: false,
                    publish_exam: false,
                },
                fileupload: {
                    file: null,
                    file_is_valid: false,
                },

            }
        },
        methods: {
            upload_exam_question(){

            },
            handleUpload(){
                const {owner, exam_id} = this.$route.params;
                const reader = new FileReader();
                reader.onload = (event) => {
                    const content = event.target.result;
                    const json_content = JSON.parse(content);
                    json_content.exam_id = exam_id;
                    const validation_result = this.$schema_validator.validate_exam(json_content);
                    const {question_set} = json_content;
                    if (validation_result.valid){
                        this.$client.make_request("exam_question.update_batch", {
                            owner, exam_id, question_set
                        }).then(resp => {
                          this.dialog.upload_question = false;
                          this.$notify({
                                type: "success",
                                text: "Upload success."
                            })
                        })
                    }else{
                        this.$notify({
                            type: "error",
                            text: _.map(validation_result),
                        })
                    }
                };
                reader.readAsText(this.fileupload.file)
            },
            handleCreate(){
                const {owner, exam_id} = this.$route.params;
                 this.$router.push(`/requester/${owner}/exam/${exam_id}/question/${new Date().getTime()}?new=1`)
            },

        },
        mounted () {

        },
        watch: {
            fileupload: function(){
                const {owner, exam_id} = this.$route.params;

            }
        },
    }
</script>
