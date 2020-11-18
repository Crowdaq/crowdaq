<template>
        <v-card class="mb-1" style="background-color: #eeeeee">
            <v-card-title>
                <MinimizeIconButton
                        class="pb-1"
                        v-model="minimized"
                ></MinimizeIconButton>
                Job Context</v-card-title>
            <v-card-text
                v-if="!minimized"
            >You are given the following context. Scroll down to find your annotation tasks.</v-card-text>
            <v-row v-if="!minimized">
                <v-col>
                    <div
                            class="mb-2 pa-1"
                            v-for="context in contexts" :key="context.id">
                        <ContextWrapper
                                v-if="context.hidden !== true"
                                class="pa-4" :ctx="context"></ContextWrapper>
                    </div>
                </v-col>
            </v-row>
        </v-card>

</template>

<script>
    import ContextWrapper from "./ContextWrapper";
    import MinimizeIconButton from "../misc/MinimizeIconButton";
    export default {
        name: "ContextDisplay",
        components: {
            ContextWrapper, MinimizeIconButton
        },
        props: {
            contexts: {
                type: Array,
                default: () => ([])
            }
        },
        data: () => ({
            minimized: false
        }),
    }
</script>