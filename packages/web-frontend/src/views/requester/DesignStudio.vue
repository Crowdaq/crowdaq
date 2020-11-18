<template>
    <div>
        <RequesterSideMenu></RequesterSideMenu>
        <v-container fluid>
            <v-row align="start" dense>
                <v-col class="d-flex flex-row">
                    <v-btn text>
                        <v-icon>mdi-upload</v-icon> Upload resource
                    </v-btn>

                    <v-menu offset-y>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn
                                    color="info"
                                    text
                                    v-bind="attrs"
                                    v-on="on"
                            >
                                <v-icon>mdi-open-in-new</v-icon> Create Resource
                            </v-btn>
                        </template>
                        <v-list>
                            <v-list-item v-on:click="open_new_item('instruction')">
                                <v-list-item-title>Instruction</v-list-item-title>
                            </v-list-item>
                            <v-list-item v-on:click="open_new_item('tutorial')">
                                <v-list-item-title>Tutorial</v-list-item-title>
                            </v-list-item>
                            <v-list-item v-on:click="open_new_item('exam')">
                                <v-list-item-title>Exam</v-list-item-title>
                            </v-list-item>
                            <v-list-item v-on:click="open_new_item('exam_question')">
                                <v-list-item-title>ExamQuestion</v-list-item-title>
                            </v-list-item>
                            <v-list-item v-on:click="open_new_item('annotation_task')">
                                <v-list-item-title>Annotation Set</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>

                    <v-menu offset-y>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn
                                    color="info"
                                    text
                                    v-bind="attrs"
                                    v-on="on"
                            >
                                <v-icon>mdi-open-in-new</v-icon> Open Existing Resource
                            </v-btn>
                        </template>
                        <v-list>
                            <v-list-item v-on:click="$emit">
                                <v-list-item-title>Instruction</v-list-item-title>
                            </v-list-item>
                            <v-list-item v-on:click="$emit">
                                <v-list-item-title>Tutorial</v-list-item-title>
                            </v-list-item>
                            <v-list-item v-on:click="$emit">
                                <v-list-item-title>Exam</v-list-item-title>
                            </v-list-item>
                            <v-list-item v-on:click="$emit">
                                <v-list-item-title>ExamQuestion</v-list-item-title>
                            </v-list-item>
                            <v-list-item v-on:click="$emit">
                                <v-list-item-title>Instruction</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </v-col>
            </v-row>

<!--            <v-row align="start" dense>-->
<!--                <v-col class="d-flex flex-row">-->
<!--                    <v-btn text>-->
<!--                        Save-->
<!--                    </v-btn>-->

<!--                    <v-btn text>-->
<!--                        Save As-->
<!--                    </v-btn>-->

<!--                </v-col>-->
<!--            </v-row>-->


            <v-row height="90%">
                <v-col cols="2" md="2" lg="2">
                    <v-card tile>
                        <v-card>
                            <v-btn text class="mt-3">
                                <v-icon>mdi-eye</v-icon>
                            </v-btn>
                            <v-list>
                                <v-subheader>
                                    Recent Items:
                                </v-subheader>
                                <v-list-item v-for="item in recent_items" :key="item">
                                    <v-list-item-content>
                                        {{item.type}}
                                        {{item.name}}
                                    </v-list-item-content>
                                </v-list-item>

                            </v-list>
                        </v-card>
                    </v-card>
                </v-col>

                <v-col cols="10" md="10" lg="10">

                    <v-card v-if="item_type_name !== ''" flat height="6em">
                        <v-card-text class="d-flex flex-row">
<!--                            {{item_type_name}}:-->
                            <v-btn
                                text
                                class="mt-4 success--text"
                                :disabled="editing_item.name ==='' || !editing_item.changed"
                                @click="save_item"
                            >save</v-btn>
                            <v-text-field
                                    outlined
                                    :label="item_type_name"
                                    :error="!editing_item.name_valid"
                                    :error-messages="editing_item.name_valid ? '' : 'ID must only contains a-zA-Z0-9 and underscore (_)'"
                                v-model="editing_item.name"></v-text-field>
                        </v-card-text>
                    </v-card>

                    <v-card height="100%" tile flat>
                        <v-tabs
                            @change="sync_editor"
                            @input="sync_editor"
                        >
                            <v-tab @click="opening_tab = 0"> Definition </v-tab>
                            <v-tab @click="opening_tab = 1"
                                   :disabled="this.editing_item.valid !== true"> Preview </v-tab>
                        </v-tabs>

                        <v-card v-if="opening_tab === 0">
                            <v-subheader
                                    style="font-size: small"
                            >Use Ctrl/Meta + E for auto complete.</v-subheader>
                            <div v-for="(msg, idx) in editing_item.error_messages"
                                 :key="idx">
                                <v-subheader
                                    class="error--text"
                                    v-if="show_all_error || idx === 0"
                                >
                                    <span
                                        class="mr-2 text-decoration-underline"
                                        v-if="!show_all_error && idx === 0 && editing_item.error_messages.length > 1"
                                        @click="show_all_error = true"> (see {{editing_item.error_messages.length-1}} more {{ editing_item.error_messages.length-1 === 1 ? 'error' : 'errors'}})</span>
                                    <span v-else-if="show_all_error && idx === 0"
                                        class="mr-2"
                                        @click="show_all_error = false"> <v-icon small color="error">mdi-close</v-icon></span>
                                    <span>{{msg}}</span>
                                </v-subheader>
                            </div>

                            <CodeEditor
                                    :language="editing_item.file_type"
                                    :value="editing_item.content"
                                    @input="update_cache"
                                    width="100%"
                                    height="50em"
                            >
                            </CodeEditor>
                        </v-card>

                        <v-card v-if="opening_tab === 1" flat>
                            <!--Preview tab-->
                            <CrowdaqObjectDisplayWrapper
                                :type="editing_item.type"
                                :definition="current_definition"
                            ></CrowdaqObjectDisplayWrapper>
                        </v-card>

                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script>
    import CodeEditor from "../../components/misc/CodeEditor";
    import RequesterSideMenu from "./RequesterSideMenu";
    import CrowdaqResourceTemplate from "@crowdaq/schema/crowdaq/templates"
    import CrowdaqObjectDisplayWrapper from "../../components/CrowdaqObjectDisplayWrapper";
    import _ from "lodash"

    export default {
        name: "DesignStudio",
        components: {
            CodeEditor, RequesterSideMenu, CrowdaqObjectDisplayWrapper
        },
        data: () => ({
            opening_tab: 0,
            editing_item: {
                name: "",
                name_valid: false,
                type: "",
                content: "",
                content_cache: "",
                changed: true,
                error_messages: [],
                file_type: "json"
            },
            existing_items: [],
            item_types:[
                "instruction",
                "tutorial",
                "exam_question",
                "tutorial",
            ],
            show_all_error: false
        }),
        computed:{
            item_type_name(){
                if(this.editing_item.type === 'instruction'){
                    return "Instruction"
                }

                if(this.editing_item.type === 'tutorial'){
                    return "Tutorial"
                }
                return ""
            },

            item_suggestion(){
                return []
            },

            recent_items(){
                return [];
            },

            current_definition(){
                if (this.editing_item.type === 'instruction'){
                    return this.editing_item.content;
                }
                return JSON.parse(this.editing_item.content)
            }
        },
        methods:{


            sync_editor(){
                this.editing_item.content = this.editing_item.content_cache;
            },

            update_cache(value){
                this.editing_item.content_cache = value;
            },


            validate_content: _.debounce(function(){
                let  validation_result = undefined;


                if (this.editing_item.type === 'instruction'){
                    validation_result = {
                        valid: true,
                        errors: [],
                    };
                }else{
                    let new_definition;

                    try{
                        new_definition = JSON.parse(this.editing_item.content_cache);
                    }catch (e) {
                        console.log("JSON not valid.");
                        return;

                    }


                    if (this.editing_item.type === 'tutorial'){
                        validation_result = this.$schema_validator.validate_tutorial(new_definition);
                    }

                    if (this.editing_item.type === 'exam'){
                        validation_result = this.$schema_validator.validate_exam(new_definition);
                    }

                    if (this.editing_item.type === 'annotation_task'){
                        validation_result = this.$schema_validator.validate_annotation_task(new_definition);
                    }

                }


                if (validation_result !== undefined){
                    this.editing_item.error_messages = _.map(validation_result.errors, err => `${err.property} ${err.message}`);
                    this.editing_item.valid = validation_result.valid;
                }else{
                    this.editing_item.valid = false;
                }



            }),

            auto_complete(query){

            },

            load_from_storage(){

            },

            open_new_item(type){

                if (type === 'instruction'){
                    this.editing_item.type = type;
                    this.editing_item.file_type = "markdown";
                    this.editing_item.content = CrowdaqResourceTemplate.instruction;
                    this.editing_item.content_cache = CrowdaqResourceTemplate.instruction;
                    this.editing_item.changed = true;
                }

                if (type === 'tutorial'){
                    this.editing_item.type = type;
                    this.editing_item.file_type = "json";
                    this.editing_item.content = JSON.stringify(CrowdaqResourceTemplate.tutorial, null, 4);
                    this.editing_item.content_cache = JSON.stringify(CrowdaqResourceTemplate.tutorial, null, 4);
                    this.editing_item.changed = true;
                }

                if (type === 'exam'){
                    this.editing_item.type = type;
                    this.editing_item.file_type = "json";
                    this.editing_item.content = JSON.stringify(CrowdaqResourceTemplate.exam, null, 4);
                    this.editing_item.content_cache = JSON.stringify(CrowdaqResourceTemplate.exam, null, 4);
                    this.editing_item.changed = true;
                }

                if (type === 'exam_question'){
                    this.editing_item.type = type;
                    this.editing_item.file_type = "json";
                    this.editing_item.content = JSON.stringify(CrowdaqResourceTemplate.exam_question, null, 4);
                    this.editing_item.content_cache = JSON.stringify(CrowdaqResourceTemplate.exam_question, null, 4);
                    this.editing_item.changed = true;
                }

                if (type === 'annotation_task'){
                    this.editing_item.type = type;
                    this.editing_item.file_type = "json";
                    this.editing_item.content = JSON.stringify(CrowdaqResourceTemplate.annotation_task, null, 4);
                    this.editing_item.content_cache = JSON.stringify(CrowdaqResourceTemplate.annotation_task, null, 4);
                    this.editing_item.changed = true;
                }

                this.validate_content();

            },

            save_item(){
                let promise;

                if (this.editing_item.type === 'instruction'){
                    promise = this.$client.make_request("instruction.update", {
                        owner: this.$client.get_current_user(),
                        instruction_id: this.editing_item.name,
                        definition: this.editing_item.content_cache,
                    })
                }

                if (this.editing_item.type === 'tutorial'){
                    promise = this.$client.make_request("tutorial.update", {
                        owner: this.$client.get_current_user(),
                        tutorial_id: this.editing_item.name,
                        definition: JSON.parse(this.editing_item.content_cache),
                    })
                }

                if (this.editing_item.type === 'exam_question'){
                    promise = this.$client.make_request("exam_question.update", {
                        owner: this.$client.get_current_user(),
                        instruction_id: this.editing_item.name,
                        definition: JSON.parse(this.editing_item.content_cache),
                    })
                }

                if (this.editing_item.type === 'annotation_task'){
                    promise = this.$client.make_request("annotation_task.update", {
                        owner: this.$client.get_current_user(),
                        instruction_id: this.editing_item.name,
                        definition: JSON.parse(this.editing_item.content_cache),
                    })
                }
            },

            load_existing_items(op, args){
                let promise = this.$client.make_request(op, args);
                promise.then(resp => {
                    if (op === 'instruction.get'){
                        this.editing_item.type = 'instruction';
                        this.editing_item.file_type = "markdown";
                        this.editing_item.content = CrowdaqResourceTemplate.instruction;
                        this.editing_item.content_cache = CrowdaqResourceTemplate.instruction;
                    }

                    if (op === 'tutorial.get'){
                        this.editing_item.type = 'tutorial';
                        this.editing_item.file_type = "json";
                        this.editing_item.content = JSON.stringify(CrowdaqResourceTemplate.tutorial, null, 4);
                        this.editing_item.content_cache = JSON.stringify(CrowdaqResourceTemplate.tutorial, null, 4);
                    }

                    if (op === 'exam.get'){
                        this.editing_item.type = 'tutorial';
                        this.editing_item.file_type = "json";
                        this.editing_item.content = JSON.stringify(CrowdaqResourceTemplate.exam, null, 4);
                        this.editing_item.content_cache = JSON.stringify(CrowdaqResourceTemplate.exam, null, 4);
                    }

                    if (op === 'exam_question.get'){
                        this.editing_item.type = 'exam_question';
                        this.editing_item.file_type = "json";
                        this.editing_item.content = JSON.stringify(CrowdaqResourceTemplate.exam_question, null, 4);
                        this.editing_item.content_cache = JSON.stringify(CrowdaqResourceTemplate.exam_question, null, 4);
                    }

                    if (op === 'annotation_task.get'){
                        this.editing_item.type = 'annotation_task';
                        this.editing_item.file_type = "json";
                        this.editing_item.content = JSON.stringify(CrowdaqResourceTemplate.annotation_task, null, 4);
                        this.editing_item.content_cache = JSON.stringify(CrowdaqResourceTemplate.annotation_task, null, 4);
                    }
                }).catch(err => {

                })
            },
        },
        mounted() {
            const {mode, type, name} = this.$route.query;
            if (mode === 'edit'){
                this.editing_item.type = type;
                this.editing_item.name = name;
            }else if (mode === 'new'){
                this.editing_item.type = type;
                this.editing_item.name = name;
            }
            this.load_existing_items();
        },
        watch: {
            "editing_item.content_cache": function(newVal, oldVal){
                this.validate_content();
            },
            "editing_item.name": function(){
                const regex = RegExp(/^[a-zA-Z0-9_]+$/);
                this.editing_item.name_valid = regex.test(this.editing_item.name);
            }
        }
    }
</script>