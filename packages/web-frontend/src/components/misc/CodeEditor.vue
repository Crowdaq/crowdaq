<template>
    <div v-bind:style="{
            height: height
        }"
         v-on:keyup.ctrl.83="echo"
         v-on:keyup.meta.83="echo"
         v-on:keyup.ctrl.32="echo"
         v-on:keyup.ctrl.69="help"
         v-on:keyup.meta.69="help"
    >
<!--        <v-btn @click="help">Hint</v-btn>-->
        <div ref="editor"
             style="height: inherit"
        ></div>
    </div>
</template>
<script>
    import * as monaco from 'monaco-editor';
    import {
        tutorial_schame,
        exam_schema,
        annotation_task_schema,
        exam_question_schema,
        collector_schema,
        condition_schema,
        context_schema,
        constraint_schema,
        annotation_group_schema,
        id_field_schema
    } from "@crowdaq/schema"

    export default {
        name: "CodeEditor",
        props: {
            height: {
                type: String,
                default: "400px"
            },
            value: {
                type: String,
                default: ""
            },
            language: {
                type: String,
                default: "json"
            },
            readOnly: {
                type: Boolean,
                default: false
            },
            filename: {
                type: String,
                default: ''
            }
        },
        data: () => ({
        }),

        watch:{
            value: function(val){
                if (this.editor){
                    if (val !== this.editor.getValue()){
                        this.editor.setValue(val);
                    }
                }
            },
            language: function(val){
                if (this.editor){
                    const model = this.editor.getModel();
                    if (model){
                        monaco.editor.setModelLanguage(model, val);
                    }
                }

            }
        },
        methods: {
            help(){
                this.editor.trigger('', 'editor.action.triggerSuggest', {});
            },
            init_editor(){

                // Enable schema request API.
                monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                    validate: true,
                    allowComments: false,
                    schemas: [{
                            schema: annotation_group_schema,
                            uri: annotation_group_schema.$id
                        },
                        {
                            schema: annotation_task_schema,
                            uri: annotation_task_schema.$id,
                            fileMatch: [
                                "annotation-task-*.json"
                            ]
                        },
                        {
                            schema: collector_schema,
                            uri: collector_schema.$id
                        },
                        {
                            schema: condition_schema,
                            uri: condition_schema.$id
                        },
                        {
                            schema: constraint_schema,
                            uri: constraint_schema.$id
                        },
                        {
                            schema: context_schema,
                            uri: context_schema.$id
                        },
                        {
                            schema: exam_question_schema,
                            uri: exam_question_schema.$id,
                            fileMatch: [
                                "exam-question-*.json"
                            ],
                        },
                        {
                            schema: exam_schema,
                            uri: exam_schema.$id,
                            fileMatch: [
                                "exam-*.json"
                            ],
                        },
                        {
                            schema: id_field_schema,
                            uri: id_field_schema.$id
                        },
                        {
                            schema: tutorial_schame,
                            uri: tutorial_schame.$id,
                            fileMatch: [
                                "tutorial-*.json"
                            ],
                        },

                    ],
                    enableSchemaRequest: true});

                document.addEventListener("keydown", function(e) {
                    if (e.defaultPrevented) {
                        return; // Should do nothing if the default action has been cancelled
                    }

                    if (e.key === 's' && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
                        e.preventDefault();
                    }
                }, false);



                this.editor = monaco.editor.create(this.$refs.editor, {
                    language: this.language,
                    theme: 'vs-dark',
                    value: this.value,
                    readOnly: this.readOnly,
                    wordWrap: 'on',
                    automaticLayout: true,
                    quickSuggestions: {
                        other: true,
                        comments: true,
                        strings: true
                    },
                    suggestOnTriggerCharacters: true,
                    model: this.filename !== "" ?
                        monaco.editor.createModel(this.value,
                            this.language,
                            `inmemory://inmemory/${this.filename}`) : undefined
                });

                this.editor.onDidChangeModelContent(this.sync_result);
                // this.editor.layout();
            },
            sync_result(event){
                const v = this.editor.getValue();
                this.$emit("input", v);
            },
            echo(e){
                e.preventDefault();
                return false;
            }
        },
        mounted() {
            this.init_editor();
        },
        beforeDestroy() {
            this.editor && this.editor.dispose();
        }

    }
</script>