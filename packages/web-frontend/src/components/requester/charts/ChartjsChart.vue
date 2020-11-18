<template>
    <canvas ref="chart" >

    </canvas>
</template>

<script>
    import Chart from "chart.js"

    export default {
        name: "ChartjsChart",
        props: {
            type: String,
            data: {
                validate: function () {
                    return true;
                }
            },
            options: Object,
        },
        data: () => ({
            chartObject: null
        }),
        mounted() {
            const ctx = this.$refs.chart.getContext('2d');
            const {
                type, data, options
            } = this;
            this.chartObject = new Chart(ctx, {
                type,
                data,
                options
            })
        },
        watch: {
            data: function(){
                this.chartObject.destroy();

                const ctx = this.$refs.chart.getContext('2d');
                const {
                    type, data, options
                } = this;
                this.chartObject = new Chart(ctx, {
                    type,
                    data,
                    options
                })
            }
        }
    }
</script>