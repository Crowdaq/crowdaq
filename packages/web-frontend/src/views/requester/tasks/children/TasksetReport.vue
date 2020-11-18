<template>
    <div>
        <v-card>
            <v-card-title>
                Annotator Summary
            </v-card-title>

            <v-card-text>
                Gini Index of this Dataset:  {{report.giniScore}}
                <v-card>
                    <PlotlyPlot
                            :data="giniIndexPlot"
                            :layout="{
                                title:`Gini Index = ${report.giniScore}`
                            }"
                    >
                    </PlotlyPlot>
                </v-card>


                <v-card>
                    <PlotlyPlot
                            :data="workerTimeSpentHistogram"
                            :layout="{
                                title:`Average Annotation Task Complete Time by Worker`
                            }"
                    >
                    </PlotlyPlot>
                </v-card>

                <v-card>
                    <v-data-table
                            :headers="tableHeaders.workerTable"
                            :items="report.timeSpentByWorker"
                            item-key="worker"
                            class="elevation-1"
                    >
                        <template v-slot:item.timeSpent="{ item }">
                            {{ humanizeSeconds(item.timeSpent) }}
                        </template>
                    </v-data-table>
                </v-card>
            </v-card-text>
        </v-card>

        <v-card>
            <v-card-title>
                Task Status
            </v-card-title>

            <v-card-text>

                <v-card>
                    <PlotlyPlot
                            :data="finishStatusPie"
                            :layout="{
                                title:`How many tasks are finished?`
                            }"
                    >
                    </PlotlyPlot>
                </v-card>

                <v-card>
                    <PlotlyPlot
                            :data="finishTimeHistogram"
                            :layout="{
                            title:'Annotation Time Distribution'
                        }"
                    >
                    </PlotlyPlot>
                </v-card>

                <v-card>
                    <v-data-table
                            :headers="tableHeaders.taskStatusTable"
                            :items="report.timeSpentByTask"
                            item-key="worker"
                            class="elevation-1"
                    >
                        <template v-slot:item.timeSpent="{ item }">
                            {{ humanizeSeconds(item.timeSpent) }}
                        </template>
                    </v-data-table>
                </v-card>

            </v-card-text>
        </v-card>



    </div>
</template>

<script>
    import PaginatedTable from "../../../../components/requester/PaginatedTable";
    import _ from "lodash";
    import moment from "moment";
    import humanizeDuration from "humanize-duration";
    import PlotlyPlot from "../../../../components/plots/PlotlyPlot";

    export default {
        name: "TasksetReport",
        components: {
            PlotlyPlot
        },
        props: {
        },
        data: () => ({
            refresh_signal: 0,
            display_content: false,
            enabled: true,
            report: {
                assignmentTimeSpentDistribution: [],
                workerFinishedDistribution: [],
                timeSpentByWorker: [],
                giniScore: 0
            },
            tableHeaders: {
                workerTable: [
                    {
                        text: 'Worker',
                        align: 'start',
                        sortable: true,
                        value: 'worker',
                    },
                    {
                        text: "Finished Task", value: 'count',
                        sortable: true,
                    },
                    {
                        text: 'Average Time Spent', value: 'timeSpent',
                        sortable: true,
                    },
                ],
                taskStatusTable: [
                    {
                        text: 'Task Id',
                        align: 'start',
                        sortable: true,
                        filterable: true,
                        value: 'annotation_task_id',
                    },
                    {
                        text: "Finished Task", value: 'count',
                        sortable: true,
                    },
                    {
                        text: 'Average Time Spent', value: 'timeSpent',
                        sortable: true,
                    },
                ],
            }
        }),

        mounted() {
            this.fetchData();
        },

        computed: {
            workerTimeSpentHistogram(){
                const trace = {
                    x: _.map(this.report.timeSpentByWorker, x => x.timeSpent),
                    type: 'histogram',
                };
                return [trace];
            },

            finishTimeHistogram(){
                const trace = {
                    x: _.map(this.report.assignmentTimeSpentDistribution, x => x.timeSpent),
                    type: 'histogram',
                };
                return [trace];

            },
            giniIndexPlot(){
                const baseLine = [];

                for (let i = 0; i <= this.report.timeSpentByWorker.length; i++) {
                    baseLine.push(this.report.meanAssignmentsFinished * i)
                }

                const baselineTrace = {
                    y: baseLine,
                    type: 'line',
                    name: "Line of Equality",
                    line: {
                        color: 'rgb(158, 158, 158)',
                        // width: lineSize[i]
                    },
                    fill: 'tonexty',
                };

                const actual = _.chain(this.report.timeSpentByWorker)
                    .map(x => x.count)
                    .sortBy(x => x)
                    .reduce( (acc, n) => {
                        acc.push( (acc.length > 0 ? acc[acc.length-1] : 0) + n);
                        return acc
                    }, [0])
                    .value();

                const actualTrace = {
                    y: actual,
                    type: 'line',
                    name: "Lorenz Curve",
                    fill: 'tozeroy',
                    line: {
                        dash: 'dash',
                        color: '#80B3FF',
                        // width: lineSize[i]
                    },
                };
                return [baselineTrace, actualTrace];
            },

            finishStatusPie(){
                const values = [];
                const labels = [];

                const counts = _.chain(this.report.timeSpentByTask)
                    .groupBy(x=>x.count)
                    .map((vs, count) => ({vs, count}))
                    .sortBy(({vs, count})=>count)
                    .each(({vs, count}) => {
                        console.log({vs, count})
                        const label = count === 1 ? "Have 1 assignment" : `Have ${count} assignments`
                        labels.push(label);
                        values.push(vs.length)
                    }).value();
                return [
                    {
                        values,
                        labels,
                        type: 'pie'
                    }
                ];
            },
        },

        methods:{
            humanizeMilli(ms){
                return humanizeDuration(Math.round(ms))
            },

            humanizeSeconds(seconds){
                return humanizeDuration(Math.round(seconds) * 1000)
            },

            fetchData(){
                const {
                    owner,
                    annotation_taskset_id
                } = this.$route.params;

                this.$client.make_request("annotation_taskset.report.get", {
                    owner,
                    annotation_taskset_id
                }).then(resp => {
                    const data = resp.data;
                    data.assignmentTimeSpentDistribution = _.map(data.assignmentTimeSpentDistribution, x=>{
                        x.worker = `(${x.worker_platform}) ${x.worker_id}`;
                        return x;
                    });

                    data.workerFinishedDistribution = _.map(data.workerFinishedDistribution, x=>{
                        x.worker = `(${x.worker_platform}) ${x.worker_id}`;
                        return x;
                    });

                    data.timeSpentByWorker = _.map(data.timeSpentByWorker, x=>{
                        x.worker = `(${x.worker_platform}) ${x.worker_id}`;
                        console.log(x);
                        return x;
                    });

                    this.report = resp.data;
                }).catch(err => {

                })
            }
        }
    }
</script>