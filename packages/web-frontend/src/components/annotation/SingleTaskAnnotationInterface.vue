<template>
    <div>

        <v-card class="d-flex flex-row">

            <div>
                <TaskPanel
                    v-model="ag_selected"
                    v-on:submit="submit_response"
                ></TaskPanel>
            </div>

            <v-container fluid>
                <v-row>
                    <v-col>
                        <ContextDisplay
                                style="border-color: #735c0f !important; border-style: double !important;"
                                :contexts="contexts"
                                v-if="contexts !== undefined"
                        ></ContextDisplay>
                    </v-col>
                </v-row>

                <DividerWithText title="Annotation tasks begin"></DividerWithText>

                <v-row>
                    <v-col>
                        <div
                            class="mb-1 pa-4"
                            v-for="ag in annotation_groups" :key="ag.id"
                            v-show="ag_selected === ag.id"
                        >
                            <div v-if="ag.repeated === true">

                                <v-row>
                                    <v-col class="d-flex flex-row-reverse">
                                        <v-btn
                                                class=""
                                                v-if="should_show_next_task"
                                                color="info"
                                                outlined
                                                @click="next_task">Next Task <v-icon>mdi-arrow-right</v-icon></v-btn>
                                    </v-col>
                                </v-row>

                                <RepeatedCollectorGroup
                                        :annotation_group_id="ag.id"
                                ></RepeatedCollectorGroup>
                            </div>

                            <div v-else>
                                <CollectorGroup
                                        :annotation_group_id="ag.id"
                                ></CollectorGroup>

                                <v-row>
                                    <v-col class="d-flex flex-row-reverse">
                                        <v-btn
                                                class=""
                                                v-if="should_show_next_task"
                                                color="info"
                                                outlined
                                                @click="next_task">Next Task<v-icon>mdi-arrow-right</v-icon></v-btn>
                                    </v-col>
                                </v-row>
                            </div>
                        </div>
                    </v-col>
                </v-row>

            </v-container>
        </v-card>

    </div>
</template>

<script>
    import ContextDisplay from "../context/ContextDisplay";
    import DividerWithText from "../misc/DividerWithText";
    import TaskPanel from "./TaskPanel";
    import RepeatedCollectorGroup from "./collector_group/RepeatedCollectorGroup";
    import CollectorGroup from "./collector_group/CollectorGroup";
    import AnnotationSystemMixin from '../../mixins/annotation_system'

    export default {
        name: "SingleTaskAnnotationInterface",
        components: {
            ContextDisplay, DividerWithText, TaskPanel, RepeatedCollectorGroup, CollectorGroup
        },
        mixins: [
            AnnotationSystemMixin
        ],
        props: {
            annotation_groups: Array,
            contexts: Array,
            notify_on_change: {
                type: Boolean,
                default: true,
            },
        },
        data: () => ({
            ag_selected: ""
        }),
        mounted() {
            this.clear_annotation_system_state();
            this.register_annotation_groups(this.annotation_groups);
            this.register_contexts(this.contexts);

            this.create_results();
        },
        watch:{
            annotation_groups: function(){
                this.clear_annotation_system_state();
                this.register_annotation_groups(this.annotation_groups);

                if (this.contexts !== undefined){
                    this.register_contexts(this.contexts);
                }


                this.create_results();
            }
        },
        computed: {
            should_show_next_task(){
                if (this.ag_selected === ''){
                    return false;
                }

                if (this.ag_selected === this.annotation_groups[this.annotation_groups.length - 1].id){
                    return false;
                }

                let ag = this.annotation_groups.find(x => (x.id === this.ag_selected));

                if(!(this.get_annotation_group_status(ag.id)
                    && this.get_annotation_group_counting_status(ag.id).pass)){
                    return false;
                }

                return true;
            }
        },
        methods: {
            next_task() {
                let found = false;
                for(let k in this.annotation_groups){
                    let ag = this.annotation_groups[k];
                    if (found) {
                        this.ag_selected = ag.id;
                        break;
                    }
                    if (ag.id === this.ag_selected){
                        found = true;
                    }
                }
            },

            clear_annotation_system_state(){
                this.$store.commit("annotations/clear_annotation_system");
            },

            register_contexts(contexts){
                this.$store.commit("annotations/register_contexts", {contexts});
            },

            register_annotation_groups(annotation_groups){
                this.$store.commit("annotations/register_annotation_groups", {annotation_groups});
            },


            submit_response(){
                this.$emit("submit", this.get_all_annotation_result)
            },

            get_response_list(ag){
                return this.results[ag.id];
            },

            create_results(){
                if (this.annotation_groups.length > 0){
                    this.ag_selected = this.annotation_groups[0].id;
                }
                //
                // for(let i = 0; i < this.annotation_groups.length; i++){
                //     const ag = this.annotation_groups[i];
                //     let black_response;
                //     if (ag.repeated === true){
                //         black_response = []
                //     }else {
                //         black_response = this.create_default_annotation_for_ag(ag);
                //     }
                //     this.$set(this.results, ag.id, black_response);
                // }
            },

        }
    }
</script>