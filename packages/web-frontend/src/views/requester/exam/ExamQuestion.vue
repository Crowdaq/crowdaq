<template>
    <div>
        <v-container>
            <v-row>
                <v-col cols="3">
                    <v-text-field
                            label="Exam Question ID"
                            v-model="question_id"
                    ></v-text-field>
                </v-col>
                <v-col cols="3">
                    <v-btn
                            :disabled="question_id === '' || !valid"
                            outlined color="success"
                            v-on:click="saveExamQuestion"
                    >
                        <v-icon>mdi-floppy</v-icon>
                        Save </v-btn>
                </v-col>
            </v-row>


            <v-tabs v-model="selected_tab">
                <v-tab>Definition</v-tab>
                <v-tab v-on:click="json_def=cached_json_def" :disabled="!valid">Preview</v-tab>
            </v-tabs>

            <v-row>
                <v-col>
                    <v-subheader
                            style="font-size: small"
                    >Use Ctrl/Meta + E for auto complete.</v-subheader>
                    <ExpandableEditorErrorMessages
                            v-bind:error_messages="error_messages"
                    ></ExpandableEditorErrorMessages>
                    <CodeEditor
                            height="800px"
                            v-show="selected_tab===0"
                            :value="json_def"
                            v-on:input="(v) => cached_json_def = v"
                            :filename="`exam-question-${new Date().getTime()}.json`"
                    ></CodeEditor>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12">
                    <MCQuestion :question="definition" :is_answered="true"></MCQuestion>
                </v-col>
            </v-row>
        </v-container>

    </div>
</template>

<script>
    import CodeEditor from "../../../components/misc/CodeEditor";
    import ExpandableEditorErrorMessages from "../../../components/requester/editor/ExpandableEditorErrorMessages";
    import CrowdaqResourceTemplate from "@crowdaq/schema/crowdaq/templates";
    import MCQuestion from "../../../components/MCQuestion";
    import _ from "lodash";

    export default {
        name: "ExamQuestion",
        components: {
            CodeEditor, ExpandableEditorErrorMessages, MCQuestion
        },
        data () {
            return {
                selected_tab: 0,
                question_id: "",
                json_def: "{}",
                cached_json_def: "{}",
                definition: {
                    question: {
                        question_text: "",
                        context: [],
                        options: [],
                    }
                },
                error_messages: [],
                valid: true,
                show_all_error: false
            }
        },
        computed: {
            question_set(){
                const v = JSON.parse(this.json_def);
                return v.question_set === undefined ? [] : v.question_set;
            }
        },
        methods: {
            fetch_data(){
                const {owner, question_id} = this.$route.params;

                if (this.$route.query.new==='1'){
                    this.question_id = question_id;
                    const template = CrowdaqResourceTemplate.exam_question;
                    template.question_id = question_id;
                    this.json_def = JSON.stringify(template, null ,4);
                    this.cached_json_def = JSON.stringify(template, null ,4);
                    return;
                }


                this.$client.make_request(
                    "exam_question.get" ,
                    {owner, question_id}
                )
                    .then((resp => {
                        this.question_id = question_id;
                        this.json_def = JSON.stringify(resp.data.definition, null, 4);
                    })).catch(err => {
                    this.handle_axios_error(err);
                })
            },
            saveExamQuestion(){
                const {owner, exam_id} = this.$route.params;
                const definition = JSON.parse(this.cached_json_def);
                definition.question_id = this.question_id;
                this.$client.make_request("exam_question.update", {
                    owner,
                    exam_id,
                    question_id: this.question_id,
                    definition: definition
                }).then((resp => {
                    this.$store.commit("alerts/add_message", {
                        message: `Question saved to ${owner}/${this.question_id} .`,
                        type: "success",
                    });
                })).catch(err => {
                    this.handle_axios_error(err);
                })

            }
        },
        created () {
            this.fetch_data()
        },
        watch: {
            '$route': 'fetch_data',
            cached_json_def : _.debounce(function () {
                try{
                    const temp_def = JSON.parse(this.cached_json_def);
                    const validation_result = this.$schema_validator.validate_exam_question(temp_def);

                    this.error_messages = _.map(validation_result.errors, err => `${err.property} ${err.message}`);
                    this.valid = validation_result.valid;

                    if (validation_result.valid){
                        this.definition = temp_def;
                        this.question_id = temp_def.question_id;
                    }

                }catch (e) {
                    return;
                }
            })
        },
    }
</script>