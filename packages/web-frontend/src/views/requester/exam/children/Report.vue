<template>
    <div>
        <PlotlyPlot
                :data="gradeBoxPlot"
                :layout="{
                    title: 'Grade Boxplot',
                    xaxis: {
                        range: [ 0, 100 ]
                    },

                }"
        ></PlotlyPlot>
    </div>
</template>

<script>
    import PlotlyPlot from "../../../../components/plots/PlotlyPlot";
    import _ from "lodash"

    export default {
        name: "ExamReport",
        components: {
            PlotlyPlot
        },
        props: {

        },
        data: () => ({
            display_content: false,
            enabled: true,
            grades: []
        }),
        computed: {
            gradeBoxPlot(){
                return [{
                    x: this.grades,
                    type: 'box',
                    name: 'Grades'
                }];
            }
        },

        mounted() {
            this.fetchData();
        },

        watch: {
            "$route": function(){
                this.fetchData();
            }
        },

        methods:{
            fetchData(){
                const {owner, exam_id} = this.$route.params;
                this.$client.make_request("exam.report.get", {
                    owner, exam_id
                }).then(resp => {
                    this.grades = _.map(resp.data.grades, x => x * 100);
                })
            }
        }
    }
</script>