<template>
    <div>
        <v-card
                class="mb-4 pa-5"
                v-for="context in context_examples" :key="context.id">
                Context Definition:
                <CodeHighlight
                        class="mb-5"
                        lang="JSON" v-bind:code="JSON.stringify(context, null, 4)"></CodeHighlight>
                It will be displayed as:

            <v-card>
                <ContextWrapper class="pa-4" :ctx="context"></ContextWrapper>
            </v-card>


        </v-card>
    </div>
</template>

<script>
    import ContextWrapper from "../../components/context/ContextWrapper";
    import CodeHighlight from "../../components/misc/CodeHighlight";

    export default {
        name: "README",
        data: () => ({
            context_examples: [
                {
                    "type": "html",
                    "id": "my_html",
                    "label": "A HTML Document",
                    "html": "<p style='color: red'>Wikipedia</p> is a <br>free online encyclopedia, \ncreated and edited by volunteers around the world and hosted by the Wikimedia Foundation.",
                },{
                    "type": "text",
                    "id": "my_doc",
                    "label": "A Nice Document",
                    "text": "Wikipedia is a \nfree online encyclopedia, \ncreated and edited by volunteers around the world and hosted by the Wikimedia Foundation.",
                },
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
                    "label": "A Nice audio clip",
                    "src": "https://upload.wikimedia.org/wikipedia/commons/4/41/Joy_to_the_World.ogg"
                }
            ],
        }),
        components:{ContextWrapper, CodeHighlight}
    }
</script>