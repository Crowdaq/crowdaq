<template>
    <div>

        <p :class="{
            'success--text': get_annotation_group_counting_status(annotation_group_id).pass,
            'error--text': !get_annotation_group_counting_status(annotation_group_id).pass,
        }" v-for="(msg, idx) in get_annotation_group_counting_status(annotation_group_id).messages" :key="idx">
            {{msg}}
        </p>

        <v-sheet class="pa-2">

            <v-tooltip top>
                <template v-slot:activator="{ on }">
                    <span v-on="on">
                        <v-btn
                            class="ma-2" color="success"
                            :disabled="!can_add_new_response()"

                            v-on:click="add_empty_repeated_response(annotation_group_id)">
                        <v-icon>mdi-plus</v-icon>  Add a new response
                        </v-btn>
                    </span>
                </template>
                <span>You need to finish all current annotation to add a new one.</span>
            </v-tooltip>

            <v-card
                    class="mb-2 mt-4"
                    raised
                    elevation="20"
                    v-for="resp in get_response_list()" :key="resp.id">
                <v-row>
                    <v-col cols="1">
                        <MinimizeIconButton
                                class="ml-1"
                                :value="minimized[resp.id]"
                                v-on:input="value => $set(minimized, resp.id, value)"
                        ></MinimizeIconButton>


                    </v-col>

                    <v-col cols="9">

                    </v-col>

                    <v-col class="justify-end flex-row">
                        <v-tooltip top>
                            <template v-slot:activator="{ on }">
                                <v-btn
                                        small
                                        dark
                                        outlined
                                        class="ml-4"
                                        color="error"
                                        v-on="on"
                                        v-on:click="delete_repeated_group_response(annotation_group_id, resp.id)">
                                    <v-icon small color="error">mdi-delete</v-icon> Delete
                                </v-btn>
                            </template>
                            <span>Delete this response</span>
                        </v-tooltip>
                        <!--                        <v-tooltip top>-->
<!--                            <template v-slot:activator="{ on }">-->
<!--                                <v-btn-->
<!--                                        icon-->
<!--                                        fab-->
<!--                                        x-small-->
<!--                                        class="ml-5"-->
<!--                                        color="info"-->
<!--                                        v-on="on"-->
<!--                                >-->
<!--                                    <v-icon>mdi-lock-open</v-icon>-->
<!--                                </v-btn>-->
<!--                            </template>-->
<!--                            <span>Lock this response</span>-->
<!--                        </v-tooltip>-->
                    </v-col>



                </v-row>
                <v-divider></v-divider>
                <CollectorGroup v-show="!minimized[resp.id]"
                        :annotation_group_id="annotation_group_id"
                        :repeated_group_result_id="resp.id"
                ></CollectorGroup>

            </v-card>


        </v-sheet>
    </div>
</template>

<script>
    import AnnotationCollectorWrapper from "../AnnotationCollectorWrapper";
    import CollectorGroup from "./CollectorGroup";
    import _ from 'lodash'
    import AnnotationSystemMixin from "../../../mixins/annotation_system";
    import MinimizeIconButton from "../../misc/MinimizeIconButton";

    export default {
        name: "RepeatedCollectorGroup",
        props: {
            annotation_group_id: String,
            repeated_group_result_id: String,
        },
        mixins: [
            AnnotationSystemMixin
        ],
        components:{
            CollectorGroup, MinimizeIconButton
        },
        data: () => ({
            validation_status: {},
            minimized: {}
        }),
        computed: {

        },
        methods: {
            get_response_list(){
                return _.reverse(_.sortBy(
                    this.get_annotation_group_result_list(this.annotation_group_id)
                    , x => x.id));
            },

            can_add_new_response(){
                let ret = this.get_annotation_group_can_add_new_response(this.annotation_group_id);
                return ret;
            }

        }
    }
</script>