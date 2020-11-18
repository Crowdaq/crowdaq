<template>
    <div style="width: 100%">
        <pre><code :class="'language-'+lang" ref="code_block"></code></pre>
    </div>
</template>

<script>
    import hljs from "highlight.js"
    import 'highlight.js/styles/github.css';

    export default {
        name: "CodeHighlight",
        props: {
            code: String,
            lang: {
                type: String,
                default: "json"
            }
        },
        mounted() {
            this.do_highlight();
        },
        methods:{
            do_highlight(){
                this.$refs.code_block.innerHTML=this.code;
                hljs.highlightBlock(this.$refs.code_block);
            }
        },
        watch:{
            "code": "do_highlight",
            "lang": "do_highlight",
        }
    }
</script>