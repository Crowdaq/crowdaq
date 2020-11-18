<template>
    <v-card>
        <v-tabs vertical>
            <v-tab>
                Context
            </v-tab>
            <v-tab>
                Annotation Group
            </v-tab>
            <v-tab>
                Annotation
            </v-tab>

            <v-tab-item>
                <Context></Context>
            </v-tab-item>

            <v-tab-item>

            </v-tab-item>

            <v-tab-item>
                <AnnotationCollector></AnnotationCollector>
            </v-tab-item>

        </v-tabs>
    </v-card>
</template>

<script>
    import Context from "./Context.vue";
    import AnnotationCollector from "./AnnotationCollector";
    export default {
        name: "Readme",
        data: () => ({

        }),
        components:{
            Context, AnnotationCollector
        }
    }
</script>