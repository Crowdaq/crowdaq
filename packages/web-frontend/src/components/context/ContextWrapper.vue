<template>
    <v-card class="pa-1">

        <p  v-if="ctx.label">
            <span class="pr-3 pl-3" style="border-style: solid;
            border-radius: 15px;
            border-width: thin;
            border-color: #005cc5;
            font-weight: bold;
        ">{{ctx.label}}</span>
        </p>

        <div v-if="ctx.type === 'html'" v-html="ctx.html">
        </div>


        <div v-else-if="ctx.type === 'text'">
            <TextContext :ctx="ctx"></TextContext>
        </div>

        <div v-else-if="ctx.type === 'audio'">
            <audio
                    controls
                    v-if="ctx && ctx.type === 'audio'">
                <source :src="ctx.src">
                Your browser does not support the audio element.
            </audio>
        </div>

        <div v-else-if="ctx.type === 'image'">
            <v-img
                    v-if="ctx && ctx.type === 'image'"
                    :src="ctx.src"
                    :height="ctx.height"
                    :width="ctx.width"
            ></v-img>
        </div>

        <div v-else-if="ctx.type === 'video'">
            <video
                    v-if="ctx && ctx.type === 'video'"
                    :height="ctx.height"
                    :width="ctx.width"
                    controls>
                <source :src="ctx.src">
                Your browser does not support HTML5 video.
            </video>
        </div>
    </v-card>
</template>

<script>

    import TextContext from "./TextContext";

    export default {
        name: "ContextWrapper",
        components: {
            TextContext
        },
        props: {
            ctx: {
                type: Object
            }
        },
        data: () => ({}),
    }
</script>

<style scoped>
    pre{
        white-space: normal;
        word-wrap: break-word;
    }
</style>