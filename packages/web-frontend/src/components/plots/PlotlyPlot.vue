<template>
    <div ref="plot">

    </div>
</template>

<script>
    import Plotly from 'plotly.js-cartesian-dist'

    export default {
        name: "PlotlyPlot",
        props: {
            data: Array,
            layout: {
                type: Object,
                default: () => ({

                })
            },
            config: {
                type: Object,
                default : () => ({
                    displaylogo: false
                })
            }
        },
        data: () => ({
            hasValue: false
        }),
        mounted() {
            this.update_value();
        },
        methods: {
            update_value(){
                if (this.hasValue){
                    Plotly.purge(this.$refs.plot);
                }
                Plotly.newPlot(this.$refs.plot, this.data, this.layout, this.config);
                this.hasValue = true;
            }
        },
        watch: {
            data: function(){
                this.update_value()
            }
        }


    }
</script>