<template>
    <div>
        <v-container>
            <v-row>
                <v-col cols="3">
                    <v-text-field
                            label="Tutorial ID"
                            v-model="tutorial_id"
                    ></v-text-field>
                </v-col>
                <v-col cols="3">
                    <v-btn
                            :disabled="tutorial_id === '' || !valid"
                            outlined color="success"
                            v-on:click="save_tutorial"
                    >
                        <v-icon>mdi-floppy</v-icon>
                        Save </v-btn>
                </v-col>

                <v-col cols="3">
                    <v-btn :href="`/w/tutorial/${$route.params.owner}/${$route.params.tutorial_id}`" target="_blank" outlined color="info" class="mr-4" exact>
                        <v-icon>mdi-eye</v-icon>
                        Annotator View
                    </v-btn>
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
                            :filename="`tutorial-${new Date().getTime()}.json`"
                    ></CodeEditor>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12">

                    <TutorialWrapper
                            v-show="selected_tab===1"
                            :owner="$route.params.owner"
                            :tutorial_id="$route.params.tutorial_id"
                            :definition="definition"
                    ></TutorialWrapper>
                </v-col>
            </v-row>
        </v-container>

    </div>
</template>

<script>
    // @ is an alias to /src

    import TutorialWrapper from "../../../components/tutorial/TutorialWrapper";
    import CodeEditor from "../../../components/misc/CodeEditor";
    import _ from "lodash"
    import CrowdaqResourceTemplate from "@crowdaq/schema/crowdaq/templates"
    import ExpandableEditorErrorMessages from "../../../components/requester/editor/ExpandableEditorErrorMessages";
    export default {
        name: 'RequesterTutorialView',
        components: {
            TutorialWrapper, CodeEditor, ExpandableEditorErrorMessages
        },
        data () {
            return {
                selected_tab: 0,
                tutorial_id: "",
                json_def: "{}",
                cached_json_def: "{}",
                definition: {
                    question_set: []
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
                const {owner, tutorial_id} = this.$route.params;

                if (this.$route.query.new==='1'){
                    this.tutorial_id = tutorial_id;
                    this.json_def = JSON.stringify(CrowdaqResourceTemplate.tutorial, null ,4);
                    this.cached_json_def = JSON.stringify(CrowdaqResourceTemplate.tutorial, null ,4);
                    return;
                }


                this.$client.make_request(
                    "tutorial.get" ,
                    {owner, tutorial_id}
                    )
                .then((resp => {
                    this.tutorial_id = tutorial_id;
                    resp.data.definition.$schema = "https://schema.crowdaq.com/tutorial.json#";
                    this.json_def = JSON.stringify(resp.data.definition, null, 4);
                })).catch(err => {
                    this.handle_axios_error(err);
                })
            },
            save_tutorial(){
                const {owner} = this.$route.params;
                const definition = JSON.parse(this.cached_json_def);
                definition.tutorial_id = this.tutorial_id;
                this.$client.make_request("tutorial.update", {
                    owner,
                    tutorial_id: this.tutorial_id,
                    definition: definition
                }).then((resp => {
                    this.$store.commit("alerts/add_message", {
                        message: `Task saved to ${owner}/${this.tutorial_id} .`,
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
                    const validation_result = this.$schema_validator.validate_tutorial(temp_def);

                    this.error_messages = _.map(validation_result.errors, err => `${err.property} ${err.message}`);
                    this.valid = validation_result.valid;

                    if (validation_result.valid){
                        this.definition = temp_def;
                    }

                }catch (e) {
                    return;
                }
            })
        },
    }
</script>
