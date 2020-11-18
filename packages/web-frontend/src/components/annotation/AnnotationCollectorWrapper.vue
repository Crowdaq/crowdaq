<template>
    <div>
<!--        <v-switch style="display: inline" v-model="show" :label="show? 'Hide':annotation.prompt"></v-switch>-->

        <RepeatedCollector
                v-if="annotation.repeated === true"
                :annotation="annotation"
                v-model="value"
                :status_messages="status_messages"
        >
        </RepeatedCollector>


        <div v-else>
            <div v-if="annotation.type === 'multiple-choice'">
                <MultipleChoiceCollector
                        :annotation="annotation"
                        v-model="value"
                        :status_messages="status_messages"
                ></MultipleChoiceCollector>
            </div>

            <div v-if="annotation.type === 'text'">
                <TextCollector
                        :annotation="annotation"
                        v-model="value"
                        :status_messages="status_messages"
                ></TextCollector>
            </div>

            <div v-if="annotation.type === 'span-from-text'">
                <SpanFromTextCollector
                        :annotation="annotation"
                        v-model="value"
                        :status_messages="status_messages"
                ></SpanFromTextCollector>
            </div>

            <div v-if="annotation.type === 'datetime'">
                <DatetimeCollector
                        :annotation="annotation"
                        v-model="value"
                        :status_messages="status_messages"
                ></DatetimeCollector>
            </div>

            <div v-if="annotation.type === 'multi-label'">
                <MultiLabelCollector
                        :annotation="annotation"
                        v-model="value"
                        :status_messages="status_messages"
                ></MultiLabelCollector>
            </div>
        </div>

    </div>
</template>

<script>
    /*
    * For a component to be a valid Annotation collector, it should:
    * 1. Has the following props:
    *    1. annotation: The annotation spec.
    *    2. context: in case context is required for this collector.
    *    3. value: the result of annotation process.
    * 2. It should emit the following events:
    *    1. input: when user has changed it annotation.
    *    2. validation: validation status changed.
    *
    * */

    import MultipleChoiceCollector from "./collectors/MultipleChoiceCollector";
    import TextCollector from "./collectors/TextCollector";
    import SpanFromTextCollector from "./collectors/ClickBaseSpanFromTextCollector";
    // import SpanFromTextCollector from "./collectors/SpanFromTextCollector";
    import DatetimeCollector from "./collectors/DateCollector";

    import RepeatedCollector from "./collectors/RepeatedCollector";

    import AnnotationSystemMixin from '../../mixins/annotation_system';

    import MultiLabelCollector from "./collectors/MultiLabelCollector";


    export default {
        name: "AnnotationCollectorWrapper",
        components: {
            MultiLabelCollector, MultipleChoiceCollector, SpanFromTextCollector, TextCollector, DatetimeCollector,
            RepeatedCollector
        },
        mixins: [
            AnnotationSystemMixin
        ],
        props: {
            annotation_group_id: String,
            annotation_id: String,
            repeated_group_result_id: String,
        },
        data: () => ({

        }),
        computed: {
            status_messages(){
                return this.get_annotation_status(this.annotation_group_id,
                    this.annotation_id,
                    this.repeated_group_result_id)
            },
            value:{
              get(){
                return this.get_annotation_result(this.annotation_group_id,
                                                    this.annotation_id,
                                                    this.repeated_group_result_id)
              },
              set(nv){
                  this.update_annotation_result(nv,
                      this.annotation_group_id,
                      this.annotation_id,
                      this.repeated_group_result_id
                  )
              }
            },
            annotation() {
                return this.get_annotation_definition(this.annotation_group_id, this.annotation_id);
            }
        },
        methods: {
        }
    }
</script>