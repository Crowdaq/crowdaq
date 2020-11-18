<template>
    <div>
        <v-card
                class="mb-4 pa-5"
                v-for="annotation in annotation_items" :key="annotation.id">
            Collector definition:
            <CodeHighlight
                    class="mb-5"
                    lang="JSON" v-bind:code="JSON.stringify(annotation, null, 4)"></CodeHighlight>

            It will displayed as:

            <v-card>
                <AnnotationCollectorWrapper
                        class="pa-4"
                        :annotation="annotation"
                        :context="resolve_context(annotation.from_context)"
                        v-on:input="value => save_annotation(annotation.id, value)"></AnnotationCollectorWrapper>
            </v-card>

            You will receive results as:

            <CodeHighlight
                    class="mb-5"
                    lang="JSON" v-bind:code="JSON.stringify(get_result(annotation.id), null, 4)"></CodeHighlight>

        </v-card>
    </div>
</template>

<script>
    import AnnotationCollectorWrapper from "../../components/annotation/AnnotationCollectorWrapper";
    import CodeHighlight from "../../components/misc/CodeHighlight";

    export default {
        name: "AnnotationCollectorReadme",
        data: () => ({
            results: {

            },
            context: [
                {
                    "type": "html",
                    "id": "my_html",
                    "label": "A HTML Document",
                    "html": "<p style='color: red'>Wikipedia</p> is a <br>free online encyclopedia, \ncreated and edited by volunteers around the world and hosted by the Wikimedia Foundation.",
                },{
                    "type": "text",
                    "id": "my_doc",
                    "label": "A Nice Document",
                    "text": "A Wikipedia is a \nfree online encyclopedia, \ncreated and edited by volunteers around the world and hosted by the Wikimedia Foundation.",                },
                {
                    "type": "video",
                    "id": "my_video",
                    "src": "https://upload.wikimedia.org/wikipedia/commons/4/43/Espresso_video.ogv",
                    "label": "A nice image"
                },
                {
                    "type": "image",
                    "id": "my_image",
                    "label": "A Nice Document",
                    "src": "https://i.picsum.photos/id/1025/4951/3301.jpg"
                },
                {
                    "type": "audio",
                    "id": "my_audio",
                    "label": "A Nice Document",
                    "src": "https://upload.wikimedia.org/wikipedia/commons/4/41/Joy_to_the_World.ogg"
                }
            ],
            annotation_items: [
                {
                    "type": "span-from-text",
                    "prompt": "Please select one event:",
                    "id": "select_a_token",
                    "from_context": "my_doc"
                },
                {
                    "type": "span-from-text",
                    "prompt": "Please select multiple events:",
                    "id": "select_some_token",
                    "from_context": "my_doc",
                    "repeated": true
                },
                {
                    "type": "text",
                    "prompt": "Please enter your questions.",
                    "id": "one_text_input",
                },
                {
                    "type": "text",
                    "prompt": "Please enter your question.",
                    "id": "multiple_text_input",
                    "repeated": true
                },
                {
                    "type": "multiple-choice",
                    "prompt": "Do you use wikipedia?",
                    "id": "use_wikipedia",
                    "options": {
                        "A": "Yes",
                        "B": "No",
                    }
                },
                {
                    "type": "multiple-choice",
                    "prompt": "Select sentiment for this review:",
                    "id": "sentiment",
                    "options": {
                        "A": "Positive",
                        "B": "Neutral",
                        "C": "Negative",
                    }
                },
            ]
        }),
        components:{AnnotationCollectorWrapper, CodeHighlight},
        methods: {
            resolve_context(ctx_id){
                if (ctx_id === undefined) return;
                for (let i = 0; i < this.context.length; i++){
                    const context = this.context[i];
                    if (context.id === ctx_id){
                        return context;
                    }
                }
                return null;
            },
            save_annotation(aid, value){
                this.$set(this.results, aid, value);
            },
            get_result(aid){
                const ret = this.results[aid];
                if (ret === undefined){
                    return {}
                }else{
                    return ret;
                }
            }
        }
    }
</script>