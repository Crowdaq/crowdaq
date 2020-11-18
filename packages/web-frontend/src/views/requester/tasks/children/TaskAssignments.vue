<template>
    <div>

        <v-card>
            <v-card-title>Assignment Filter</v-card-title>
            <v-card-text>
                <v-row>
                    <v-col>
                        <v-btn dense outlined @click="clearFilter">
                            Clear Filter
                        </v-btn>
                    </v-col>

                    <v-col>
                        <v-text-field dense outlined label="Task Id" v-model="inputFilter.annotation_task_id"/>
                    </v-col>

                    <v-col>
                        <v-text-field dense outlined label="Worker Platform" v-model="inputFilter.worker_platform"/>

                    </v-col>

                    <v-col>
                        <v-text-field dense outlined label="Worker Id" v-model="inputFilter.worker_id"/>
                    </v-col>
                    <v-col>
                        <v-btn dense  outlined @click="applyFilter">
                            Apply Filter
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>


        <PaginatedTable
                :refresh_signal="refresh_signal"
                op="annotation_task_assignments.list"
                :filter_arg="assignmentFilter"
        >
            <template v-slot:header>
                <v-row class="font-weight-bold">
                    <v-col class="text-left">Task Id</v-col>
                    <v-col class="text-left">Worker (Platform and ID)</v-col>
                    <v-col class="text-left">Finish Time</v-col>
                    <v-col class="text-left">Duration</v-col>
                    <v-col class="text-left">Content</v-col>
                    <v-col class="text-left">Delete</v-col>
                </v-row>

            </template>

            <template v-slot:item="{item}">
                <TaskAssignmentRow :item="item" @delete="delete_assignment"></TaskAssignmentRow>
            </template>
        </PaginatedTable>

    </div>
</template>

<script>
    import PaginatedTable from "../../../../components/requester/PaginatedTable";
    import moment from "moment";
    import humanizeDuration from "humanize-duration";
    import TaskAssignmentRow from "./TaskAssignmentRow";

    export default {
        name: "ExamAssignments",
        components: {
            PaginatedTable, TaskAssignmentRow
        },
        props: {
        },

        data() {
            const {
                annotation_task_id, worker_platform, worker_id
            } = this.$route.query;

            const {
                owner, annotation_taskset_id
            } = this.$route.params;

            return {
                refresh_signal: 0,
                display_content: false,
                enabled: true,
                inputFilter: {
                    annotation_task_id, worker_platform, worker_id
                },
                assignmentFilter: {
                    owner, annotation_taskset_id,
                    annotation_task_id, worker_platform, worker_id
                }
            }
        },
        watch: {
            "$route": function(){
                const {
                    owner, annotation_taskset_id
                } = this.$route.params;

                let {
                    annotation_task_id, worker_platform, worker_id
                } = this.$route.query;

                annotation_task_id = annotation_task_id === "" ? undefined : annotation_task_id;
                worker_platform = worker_platform === "" ? undefined : worker_platform;
                worker_id = worker_id === "" ? undefined : worker_id;

                this.inputFilter = {
                    annotation_task_id, worker_platform, worker_id
                };

                this.assignmentFilter = {
                    owner,
                    annotation_taskset_id,
                    annotation_task_id, worker_platform, worker_id
                };

                this.refresh_signal += 1;
            }
        },

        computed: {

        },

        methods:{

            applyFilter(){
                const {
                    annotation_task_id, worker_platform, worker_id
                }  = this.inputFilter;
                console.log({
                    annotation_task_id, worker_platform, worker_id
                });
                this.$router.push({
                    path: this.$route.path,
                    query: {
                        annotation_task_id, worker_platform, worker_id
                    }
                })
            },
            clearFilter(){
                this.$router.push(this.$route.path)
            },

            apply_query() {
                const {
                    owner, annotation_taskset_id
                } = this.$route.params;

                const {
                    annotation_task_id, worker_platform, worker_id
                } = this.$route.query;

                this.assignmentFilter = {
                    owner,
                    annotation_taskset_id,
                    annotation_task_id, worker_platform, worker_id
                }
            },

            delete_assignment(assignment){

                const {owner, annotation_taskset_id} = this.$route.params;

                this.$client.make_request("annotation_task_assignments.delete", {
                    owner, annotation_taskset_id, assignment_id: assignment._id
                })
                    .then(resp => {
                        this.$notify({
                            text: `Deleted ${assignment._id}`,
                            type: 'info'
                        })
                        this.refresh_signal += 1;
                    })
                    .catch(err => {})
            },
            get_time_diff(start, end){
                const s = moment(start);
                const e = moment(end);
                console.log(e-s);
                return this.humanize_seconds((e-s) / 1000);
            },
        }
    }
</script>