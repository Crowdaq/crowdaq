<template>
    <v-container>
        <v-layout>
            <v-flex style="overflow:auto">
                <v-data-table
                    :headers="headers"
                    :items="items"
                >
                </v-data-table>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    import _ from 'lodash';

    export default {
        name: "TaskAgreements",
        data: function(){
            return {
                collectorAgreements: [],
                meanRow: {}
            };
        },
        computed: {
            headers(){

                const taskIdColumn = {
                    text: 'Task Id',
                    align: 'start',
                    sortable: false,
                    value: 'annotation_task_id',
                }

                const rest = _.chain(this.meanRow).map((v,k) => k).filter(x => x !== 'annotation_task_id').map(x => {
                    return {
                        text: x,
                        align: 'start',
                        sortable: true,
                        value: x,
                    }
                }).value();

                return [taskIdColumn, ...rest];
            },
            items(){
                return [this.meanRow , ...this.collectorAgreements];
            }
        },
        methods: {
            fetchData(){
                const {owner, annotation_taskset_id} = this.$route.params;

                this.$client.make_request("annotation_taskset.agreement", {
                    owner, annotation_taskset_id
                }).then(resp => {
                    this.collectorAgreements = resp.data.collectorAgreements;
                    const meanRow = {
                        annotation_task_id: "AVERAGE"
                    };
                    for(let row of this.collectorAgreements){
                        _.each(row, (v,k) => {
                            if (k === 'annotation_task_id'){
                                return;
                            }

                            let cur = meanRow[k] === undefined ? 0 : meanRow[k];
                            meanRow[k] = cur + v;
                        })
                    }

                    for(let k in meanRow){
                        if (k === 'annotation_task_id'){
                            continue;
                        }

                        meanRow[k] = meanRow[k] / this.collectorAgreements.length;
                    }



                    this.meanRow = meanRow;
                })
            }
        },
        mounted() {
            this.fetchData()
        }
    }
</script>