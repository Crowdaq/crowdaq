<template>
    <div >

        <v-dialog v-model="dialog.upload_tasks"
                  max-width="640">
            <template v-slot:activator="{ on }">
                <v-btn outlined color="success" v-on="on" class="mr-4">
                    <v-icon>mdi-upload</v-icon> Upload Tasks
                </v-btn>
            </template>
            <v-card>
                <v-card-title>Upload Tasks</v-card-title>
                <v-card-text>
                    <v-file-input
                        accept=".zip"
                        v-model="upload_file"
                        label="Select file (*.zip)"
                    ></v-file-input>
                </v-card-text>
                <v-card-actions>
                    <v-btn @click="handleUpload">Upload</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-btn outlined color="success" class="mr-4" @click="handleCreate">
            <v-icon>mdi-upload</v-icon> Create New Task
        </v-btn>

        <PaginatedTable
                :refresh_signal="refresh_signal"
                op="annotation_task.list"
                :filter_arg="{
                        owner: this.$route.params.owner,
                        annotation_taskset_id: this.$route.params.annotation_taskset_id,
                        // annotation_task_id: this.$route.params.annotation_task_id
                    }"
        >
            <template v-slot:header>
                <v-row class="font-weight-bold">
                    <v-col class="text-left">Name</v-col>
                    <v-col class="text-left">Preview Link</v-col>
                    <v-col class="text-left">Edit</v-col>
                </v-row>
            </template>

            <template v-slot:item="{item}">
                <v-row>
                    <v-col>{{ item.annotation_task_id }}</v-col>
                    <v-col>
                        <a :href="`/w/task/${$route.params.owner}/${$route.params.annotation_taskset_id}/${item.annotation_task_id}`" target="_blank"> Annotate </a>
                    </v-col>
                    <v-col>
                        <v-btn icon color="info"
                               :to="`task/${item.annotation_task_id}`"
                        >
                            <v-icon>mdi-pencil</v-icon>
                        </v-btn>

                        <v-btn icon color="error" @click="delete_task(item)">
                            <v-icon>mdi-delete</v-icon>
                        </v-btn>
                    </v-col>
                </v-row>
            </template>
        </PaginatedTable>

    </div>
</template>

<script>
    import PaginatedTable from "../../../../components/requester/PaginatedTable";

    export default {
        name: "ExamAssignments",
        components: {
            PaginatedTable
        },
        props: {
        },
        data: () => ({
            refresh_signal: 0,
            dialog: {
                upload_tasks: false,
                create_new_tasks: false,
            },
            display_content: false,
            enabled: true,

            upload_file: null,
            new_task_id: "",
        }),

        methods:{
            delete_task(item){
                const {owner, annotation_taskset_id} = this.$route.params;
                let annotation_task_id = item.annotation_task_id;
                this.$client.make_request("annotation_task.delete", {
                    owner, annotation_taskset_id, annotation_task_id
                }).then(resp => {
                    this.refresh_signal += 1;
                }).catch(err => {
                    console.log(err);
                })
            },
            handleUpload(){
                const {owner, annotation_taskset_id} = this.$route.params;
                const formData = new FormData();
                formData.append('taskset_file', this.upload_file);
                this.$client.makeMultipartRequest("annotation_taskset.upload_file", {owner, annotation_taskset_id}, formData).then(resp => {
                    this.$notify({
                        text: resp.data.message,
                        type: "success"
                    });
                    this.dialog.upload_tasks = false;
                })
            },
            handleCreate(){
                const {owner, annotation_taskset_id} = this.$route.params;

                if (this.new_task_id !== ""){
                    this.$router.push(`/requester/${owner}/taskset/${annotation_taskset_id}/task/${this.new_task_id}?new=1`)
                }else{

                    this.$router.push(`/requester/${owner}/taskset/${annotation_taskset_id}/task/${new Date().getTime()}?new=1`)
                }
            },
        }
    }
</script>