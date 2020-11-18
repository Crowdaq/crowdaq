<template>
    <v-card class="pa-4" flat>
        <v-card-text flat>
            <MarkdownView :doc="definition"></MarkdownView>
        </v-card-text>
    </v-card>
</template>
<script>
    import MarkdownView from "../context/MarkdownView";

    export default {
        name: "InstructionWrapper",
        components: {
            MarkdownView
        },
        props: {
            definition: String,
        }
    }
</script>