<template>
    <div>
        <v-container fluid>
            <v-row>
                <v-col cols="3">
                    <v-text-field
                            label="TaskId"
                            v-model="task_id"
                            :disabled="!isNewTask"
                    ></v-text-field>
                </v-col>
                <v-col cols="3">
                    <v-btn
                        :disabled="task_id === ''"
                        color="success"
                        v-on:click="updateTask"
                    > Save </v-btn>
                </v-col>

                <v-col cols="3">
                    <v-btn :href="`/w/task/${$route.params.owner}/${$route.params.annotation_taskset_id}/${$route.params.annotation_task_id}`" target="_blank" outlined color="info">
                        <v-icon>mdi-eye</v-icon>
                        Annotator View
                    </v-btn>
                </v-col>

            </v-row>

            <TaskEditor
                v-bind:initDefinitionString="fetchedDefinitionStr"
                @change="handleEditorChange"
            ></TaskEditor>

        </v-container>
    </div>
</template>

<script>
    // @ is an alias to /src
    import TaskEditor from "../../../components/requester/editor/TaskEditor";

    export default {
        name: 'RequesterTaskView',
        components: {
            TaskEditor
        },

        data () {
            return {
                selected_tab: 0,
                task_id: "",
                isNewTask: false,

                task_definition: {},
                fetchedDefinitionStr: "{}",
                updatedDefinitionObject: {},
            }
        },
        computed: {
            annotation_groups(){
                try{
                    const v = JSON.parse(this.json_config)
                    return v.annotation_groups === undefined ? [] : v.annotation_groups;
                }catch (e) {
                    return []
                }
            },
            json_result() {
                return JSON.stringify(this.get_all_annotation_result, null , 4);
            },

            contexts(){
                try{
                    const v = JSON.parse(this.json_config);
                    return v.contexts === undefined ? [] : v.contexts;
                }catch (e) {
                    return [];
                }
            }
        },
        methods: {
            updateTask(){
                const {owner, annotation_taskset_id, annotation_task_id} = this.$route.params;
                const definition = this.updatedDefinitionObject;
                this.$client.make_request("annotation_task.update" , {
                    owner,
                    annotation_taskset_id,
                    annotation_task_id,
                    definition
                }).then((resp => {
                    this.$notify({
                        text: `Task saved to ${annotation_taskset_id}/${this.task_id} .`,
                        type: "success"
                    });
                })).catch(err => {
                    this.handle_axios_error(err);
                })

            },
            handleEditorChange(value){
                this.updatedDefinitionObject = value;
            },
            fetch_data(){
                const {owner, annotation_taskset_id, annotation_task_id} = this.$route.params;
                this.task_id = annotation_task_id;
                if (this.$route.query.new === '1'){
                    this.isNewTask = true;
                    return;
                }else{
                    this.isNewTask = false;
                }

                this.$client.make_request("annotation_task.get" , {
                    owner,
                    annotation_taskset_id,
                    annotation_task_id
                }).then((resp => {
                    this.updatedDefinitionObject = resp.data.definition;
                    this.fetchedDefinitionStr = JSON.stringify(resp.data.definition, null, 4);
                })).catch(err => {
                    console.log(err);
                })
            },
        },
        created () {
            this.fetch_data()
        },
        watch: {
            '$route': 'fetch_data'
        },
    }
</script>
