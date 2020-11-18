<template>
    <v-card>
        <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
                <v-btn
                        text
                        class="primary--text"
                        v-bind="attrs"
                        v-on="on"
                >
                    Load Example
                </v-btn>
            </template>
            <v-list>
                <v-list-item
                        v-for="(item, index) in examples"
                        :key="index"
                        @click="loadExample(item)"
                >
                    <v-list-item-content>
                        {{ item.name }}
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-menu>


        <v-tabs v-model="selected_tab" grow>
            <v-tab>Definition</v-tab>
            <v-tab
                :disabled="!no_error"
                v-on:click="newDefinitionString=cacheNewDefinitionStr">
                <v-icon color="success" class="mr-2" v-if="newDefinitionString !== cacheNewDefinitionStr && no_error"
                >mdi-update</v-icon>
                Preview
            </v-tab>
        </v-tabs>

        <v-row>
            <v-col>
                <v-subheader
                        style="font-size: small"
                >Use Ctrl/Meta + E for auto complete.</v-subheader>

                <ExpandableEditorErrorMessages
                        v-if="!no_error"
                        v-bind:error_messages="error_messages"
                ></ExpandableEditorErrorMessages>

                <CodeEditor
                        v-if="selected_tab===0"
                        :value="newDefinitionString"
                        v-on:input="(v) => cacheNewDefinitionStr = v"
                        :filename="`annotation-task-${new Date().getTime()}.json`"
                        language="json"
                ></CodeEditor>
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <SingleTaskAnnotationInterface
                        v-show="selected_tab===1"
                        :annotation_groups="taskDefinitionObject.annotation_groups"
                        :contexts="taskDefinitionObject.contexts"
                ></SingleTaskAnnotationInterface>
            </v-col>
        </v-row>



        <v-row>
            <v-col cols="12">
                <h2>The response you‘ll receive is:</h2>
            </v-col>
            <v-col>
                <CodeEditor
                        v-bind:value="json_result" read-only></CodeEditor>
            </v-col>
        </v-row>
    </v-card>
</template>

<script>
    // @ is an alias to /src

    import CodeEditor from "../../../components/misc/CodeEditor";
    import SingleTaskAnnotationInterface from "../../../components/annotation/SingleTaskAnnotationInterface";
    import AnnotationSystemMixin from "../../../mixins/annotation_system";
    import ExpandableEditorErrorMessages from "../../../components/requester/editor/ExpandableEditorErrorMessages";
    import _ from "lodash";
    import CrowdaqExample from "@crowdaq/schema/crowdaq/examples"

    export default {
        name: 'TaskEditor',
        components: {
            CodeEditor, SingleTaskAnnotationInterface, ExpandableEditorErrorMessages
        },
        mixins:[AnnotationSystemMixin],
        props: {
            initDefinitionString: {
                type: String,
                default: "{}"
            }
        },
        data () {
            return {
                selected_tab: 0,
                task_id: "",
                taskDefinitionObject: {
                    annotation_groups: [],
                    contexts: [],
                },
                newDefinitionString: "{}",
                cacheNewDefinitionStr: "{}",
                error_messages: [],
                examples: _.map(CrowdaqExample.TaskExamples, (v,k) => ({
                    name: k,
                    definition: v
                })),
                no_error: false
            }
        },
        computed: {
            json_result() {
                return JSON.stringify(this.get_all_annotation_result, null , 4);
            },

        },
        methods: {
            onInitEditor(){

            },
            onChange: _.debounce(function(value){
                let newDefinition = null;
                try{
                    newDefinition = JSON.parse(value);
                }catch (e) {
                    this.no_error = false;
                    return;
                }

                const validationResult = this.$schema_validator.validate_annotation_task(newDefinition);
                if (validationResult.valid){
                    this.$emit("change", newDefinition);
                    this.error_messages = [];
                    this.newDefinitionString = this.cacheNewDefinitionStr;
                    this.taskDefinitionObject = newDefinition;
                    this.no_error = true;
                }else{
                    this.error_messages = _.map(validationResult.errors, err => `${err.property} ${err.message}`);
                    this.no_error = false;
                }

            }),
            loadExample(example){
                this.cacheNewDefinitionStr = JSON.stringify(example.definition, null, 4)
            }
        },
        mounted () {
            this.onInitEditor();
            this.onChange(this.initDefinitionString);
        },
        watch: {
            cacheNewDefinitionStr: function(newValue){
                this.onChange(newValue);
            },
            initDefinitionString: function(newValue){
                this.newDefinitionString = newValue;
                this.cacheNewDefinitionStr = newValue;
            }
        },
    }
</script>
