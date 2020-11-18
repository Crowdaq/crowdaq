<template>
    <div>

        <v-card class="pa-1">
            <div
                v-for="annotation in get_annotation_group_definition(annotation_group_id).annotations"
                :key="annotation.id"
            >
                <v-card
                        class="ma-2"
                        style="border-radius: 15px; border-style: solid; border-color: #bbbbbb"
                        outlined
                    v-show="display_condition_matched(annotation_group_id, annotation.id, repeated_group_result_id)"
                    v-bind:class="{
                    'not-ready': !get_annotation_status(annotation_group_id, annotation.id, repeated_group_result_id).pass
                }"
                >
<!--                    <v-card-subtitle class="ma-0 pa-0">-->
<!--                        <MinimizeIconButton-->
<!--                            :value="minimized[annotation.id] === true"-->
<!--                            v-on:input="value => $set(minimized, annotation.id, value)"-->
<!--                            :key="annotation_idx"-->
<!--                        ></MinimizeIconButton>-->
<!--                        <span-->
<!--                                style="cursor: pointer"-->
<!--                            v-on:click="$set(minimized, annotation.id, !(minimized[annotation.id] === true))"-->
<!--                        >-->
<!--                            Annotation {{annotation_idx + 1}}: {{annotation.title}}-->
<!--                        </span>-->
<!--                    </v-card-subtitle>-->

                    <AnnotationCollectorWrapper
                            v-show="minimized[annotation.id] !== true"
                            class="pa-4"
                            :annotation="annotation"
                            :annotation_group_id="annotation_group_id"
                            :annotation_id="annotation.id"
                            :repeated_group_result_id="repeated_group_result_id"
                    ></AnnotationCollectorWrapper>

                    <p class="warning--text"
                        v-if="!display_condition_matched(annotation_group_id, annotation.id, repeated_group_result_id) && minimized[annotation.id] !== true"
                    >You don't need to answer this question based on you other responses.</p>

                </v-card>
            </div>
        </v-card>
    </div>
</template>

<script>
    import AnnotationCollectorWrapper from "../AnnotationCollectorWrapper";
    import MinimizeIconButton from "../../misc/MinimizeIconButton";
    import AnnotationSystemMixin from "../../../mixins/annotation_system";

    export default {
        name: "CollectorGroup",
        mixins:[AnnotationSystemMixin],
        props: {
            annotation_group_id: String,
            repeated_group_result_id: String,
        },
        components:{
            AnnotationCollectorWrapper, //MinimizeIconButton
        },
        data: () => ({
            results: {
                id: ''
            },
            minimized: {},
        }),
        watch:{
        },
        computed: {
        },
        mounted() {
        },
        methods: {

        }
    }
</script>

<style scoped>
    .not-ready{
        border-left-color: #FA8072 !important;
        border-left-width: 4px !important;

        border-right-color: #FA8072 !important;
        border-right-width: 4px !important;;

        border-top-color: #FA8072 !important;
        border-top-width: 1px !important;;
        border-bottom-color: #FA8072 !important;
        border-bottom-width: 1px !important;;

    }
</style>