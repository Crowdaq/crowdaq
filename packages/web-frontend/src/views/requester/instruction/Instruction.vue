<template>
    <div>
        <v-container>
            <v-row>
                <v-col cols="3">
                    <v-text-field
                            label="Instruction Id"
                            v-model="instruction_id"
                    ></v-text-field>
                </v-col>
                <v-col cols="3">
                    <v-btn
                            :disabled="instruction_id === ''"
                            outlined color="success"
                            v-on:click="save_instruction"
                    >
                    <v-icon>mdi-floppy</v-icon>    Save
                    </v-btn>
                </v-col>

                <v-col cols="3">
                    <v-btn :href="`/w/instruction/${$route.params.owner}/${$route.params.instruction_id}`" target="_blank" outlined color="info">
                        <v-icon>mdi-eye</v-icon>
                        Annotator View
                    </v-btn>
                </v-col>

            </v-row>


            <v-tabs v-model="selected_tab">
                <v-tab>Definition</v-tab>
                <v-tab v-on:click="markdown_def=cached_def">Preview</v-tab>
            </v-tabs>

            <v-row>
                <v-col>
                    <CodeEditor
                            language="markdown"
                            height="800px"
                            v-show="selected_tab===0"
                            :value="markdown_def"
                            v-on:input="(v) => cached_def = v"
                    ></CodeEditor>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12">
                    <MarkdownView
                            v-show="selected_tab===1"
                            :doc="cached_def"
                    ></MarkdownView>
                </v-col>
            </v-row>
        </v-container>

    </div>
</template>

<script>
    // @ is an alias to /src

    import MarkdownView from "../../../components/context/MarkdownView";
    import CodeEditor from "../../../components/misc/CodeEditor";

    export default {
        name: 'RequesterInstructionView',
        components: {
            MarkdownView, CodeEditor
        },
        data () {
            return {
                selected_tab: 0,
                instruction_id: "",
                markdown_def: "# Instruction Title",
                cached_def: "# Instruction Title"
            }
        },
        methods: {
            fetch_data () {
                const {owner, instruction_id} = this.$route.params;
                // const project_id = this.$route.params.project_id;

                if (this.$route.query.new==='1'){
                    this.instruction_id = instruction_id;
                    return;
                }

                this.$client.make_request("instruction.get", {
                    owner, instruction_id
                })
                    .then(resp => {
                        const data = resp.data;
                        this.markdown_def = data.definition;
                        this.instruction_id = instruction_id;
                    })
                    .catch(error => {
                        this.handle_axios_error(error)
                    })
            },
            save_instruction(){
                this.markdown_def = this.cached_def;
                const {owner} = this.$route.params;
                this.$client.Instruction.update(owner, this.instruction_id, this.cached_def).then((resp => {
                    this.$store.commit("alerts/add_message", {
                        message: `Task saved to ${owner}/${this.instruction_id} .`,
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
            '$route': 'fetch_data'
        },
    }
</script>
