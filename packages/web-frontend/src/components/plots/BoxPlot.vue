<template>
    <div ref="plot">

    </div>
</template>

<script>
    import Plotly from 'plotly.js-cartesian-dist'

    export default {
        name: "Histogram",
        props: {
            value: Array
        },
        mounted() {
            this.update_value();
        },
        methods: {
            update_value(){
                const trace = {
                    x: this.value,
                    type: 'box',
                };
                const data = [trace];
                Plotly.newPlot(this.$refs.plot, data, {}, {displaylogo: false});
            }
        },
        watch: {
            value: function(){
                this.update_value()
            }
        }


    }
</script>