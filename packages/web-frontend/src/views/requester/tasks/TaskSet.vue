<template>
    <div>

        <v-container>
            <v-row>
                <v-col>
                    Taskset:<b>{{$route.params.annotation_taskset_id}}</b>
                </v-col>
            </v-row>

            <v-row>
                <v-col>
                    <v-tabs grow>
                        <v-tabs grow>
                            <v-tab link :to='`/requester/${$route.params.owner}/taskset/${$route.params.annotation_taskset_id}/tasks`'>Tasks</v-tab>
                            <v-tab link :to='`/requester/${$route.params.owner}/taskset/${$route.params.annotation_taskset_id}/assignments`'>Assignments</v-tab>
                            <v-tab link :to='`/requester/${$route.params.owner}/taskset/${$route.params.annotation_taskset_id}/report`'>Reports</v-tab>
                            <v-tab link :to='`/requester/${$route.params.owner}/taskset/${$route.params.annotation_taskset_id}/agreement`'>Agreement</v-tab>
                        </v-tabs>
                    </v-tabs>
                </v-col>
            </v-row>

            <v-row>
                <v-col>
                    <router-view></router-view>
                </v-col>
            </v-row>
        </v-container>

    </div>
</template>

<script>
    // @ is an alias to /src
    import CodeHighlight from "../../../components/misc/CodeHighlight";
    import CodeEditor from "../../../components/misc/CodeEditor";
    import TasksetRow from "./TasksetRow";
    import humanizeDuration from 'humanize-duration'
    import moment from 'moment'
    import _ from 'lodash'
    import TaskConfig from "../../../components/requester/configs/TaskConfig";
    export default {
        name: 'RequesterTaskSetView',
        components: {
            // CodeHighlight, CodeEditor, TasksetRow, TaskConfig
        },
        data () {
            return {
                config_dialog: false,
                tab_idx: 0,
                new_id: "new_taskitem",
                dialog: false,
                fileupload_dialog: false,

                tasks: {
                    page: 1,
                    total_page: 1,
                    loading: false,
                    task_ids: [],
                    selected_task: "",
                    upload_file: null,
                },

                assignments: {
                    report: {
                        total: 0,
                        finished: 0,
                    },
                    opened: {},
                    exp_time: 1800,
                    assignment_per_task: 1,
                    dialog:false,
                    page: 1,
                    total_page: 1,
                    assignment_ids: [],
                    selected_task: "",
                    has_more: true
                },

                tickets: {
                    remain_ticket_count: 0,
                    total_ticket_count: 0,
                    tickets: 0,
                    publish_config: {
                        sandbox: true,
                        price: 0.05,
                        title: "Your Task Name",
                        description: "Your Description Name",
                        keywords: "keyword1, keyword2",
                        lifetime_min: "",
                        require_master: false,
                        require_US: false,
                    }
                },
                assignment_count_group_by_task: [],
                assignment_count_group_by_task_total: 0,
           }
        },
        computed:{
            publish_command(){
                return "./get_main_task_urls.sh " + this.$route.params.annotation_taskset_id;
            },
        },
        methods: {
            handle_file_upload(){
                let formData = new FormData();
                formData.append("file", this.tasks.upload_file);
                const {owner, annotation_taskset_id} = this.$route.params;

                this.tasks.loading = true;

                this.$client.upload_taskset(owner, annotation_taskset_id, formData).then(resp => {
                    this.fileupload_dialog = false;
                    this.tasks.loading = true;
                    this.$store.commit("alerts/add_message", {
                        message: resp.data.message,
                        type: "success"
                    });

                    this.fetch_data();

                }).catch(err => {
                    this.fileupload_dialog = false;
                    this.tasks.loading = true;
                });
            },
        },
        watch: {
            // '$route': 'fetch_data',
            // 'tasks.page': 'fetch_tasks',
            // 'assignments.page': 'fetch_assignments',
            // 'assignments.report': function(){
            //
            //     this.assignment_count_group_by_task = _.sortBy(
            //         _.map(
            //             _.groupBy(this.assignments.report.assignment_count, x => x.count),
            //             (cols, count) => ({
            //                 assignment_count: count,
            //                 task_count: cols.length
            //             })
            //         ),
            //         x => x.task_count
            //     );
            //
            //     this.assignment_count_group_by_task_total = _.sumBy(this.assignment_count_group_by_task, x => x.task_count)
            //     // for (const task_count of this.assignments.report.assignment_count){
            //     //     const {task_id, count} = task_count;
            //     // }
            // },
        },
    }
</script>
