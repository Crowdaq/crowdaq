<template>
    <div>
        <pre style="white-space:normal;"><span v-for="(span, i) in spans"
                   :key="i"
                   :style="{
                        color: span.color,
                        backgroundColor: span.background_color
                   }"
        >{{span.text}}</span></pre>
    </div>
</template>

<script>
    import _ from "lodash"
    export default {
        name: "TextContext",
        props: {
            ctx: Object
        },
        data: () => ({
            spans: []
        }),
        methods:{
            split_text_to_colored_spans(){
                this.spans = [];
                if (this.ctx.highlight !== undefined){
                    const sorted_spans = _.sortBy(this.ctx.highlight, (s) => (s.start));
                    let cur = 0;
                    for (let span of sorted_spans){
                        let start = cur;
                        let end = span.start;
                        if (start < end){
                            this.spans.push({
                                text: this.ctx.text.substring(start, end)
                            })
                        }
                        this.spans.push({
                            text: this.ctx.text.substring(span.start, span.end),
                            color: span.color,
                            background_color: span.background_color,
                        });
                        cur = span.end;
                    }

                    if (cur !== this.ctx.text.length){
                        this.spans.push({
                            text: this.ctx.text.substring(cur, this.ctx.text.length)
                        })
                    }


                }else{
                    this.spans.push({
                        text: this.ctx.text
                    })
                }
            }
        },
        mounted() {
            this.split_text_to_colored_spans();
        },
        watch:{
            ctx: function(){
                this.split_text_to_colored_spans();
            }
        }
    }

</script>