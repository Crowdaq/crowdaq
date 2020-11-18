<template>
    <div>
            <v-navigation-drawer
                permanent
                :mini-variant="minimized"
                style="height: 1000px; background-color: #eeeeee"
            >

                <v-list>
                    <v-list-item three-line v-on:click="minimized=!minimized">
                        <v-list-item-icon>
                            <v-icon color="success" v-if="minimized">mdi-chevron-right</v-icon>
                            <v-icon color="error" v-else>mdi-chevron-left</v-icon>
                        </v-list-item-icon>

                        <v-list-item-content>

                            <v-list-item-title>
                                <span>Tasks</span>
                            </v-list-item-title>
                            <v-list-item-subtitle>
                                Click to hide
                            </v-list-item-subtitle>
                        </v-list-item-content>

                    </v-list-item>

                </v-list>

                <v-divider></v-divider>

                <v-btn block tile class="mb-4 mt-4" color="success"
                       v-on:click="$emit('submit')"
                       :disabled="!ready_to_submit">
                    <v-icon dark>mdi-thumb-up-outline</v-icon>
                    <span v-show="!minimized">Submit</span>
                </v-btn>

                <v-divider></v-divider>

                <v-card
                        v-for="(ag, idx) in all_registered_annotation_groups" :key="ag.id"
                        class="pb-1 mb-3"
                        :outlined="!minimized && value === ag.id"
                        :elevation="value === ag.id ? 10 : 5"
                        v-bind:class="{
                            'open-task' : value === ag.id,
                            'unfinished-task': !(get_annotation_group_status(ag.id)
                            && get_annotation_group_counting_status(ag.id).pass)}"
                        tile
                >
                    <div v-if="minimized">
                        <v-card-title v-on:click="on_selected(ag)" style="cursor: pointer; word-break: break-word">
                            <span class="success--text" v-if="value === ag.id">{{idx+1}}</span>
                            <span v-else>{{idx+1}}</span>
                        </v-card-title>
                    </div>

                    <div v-else>
                        <v-card-title style="word-break: break-word">
                            <v-icon color="error" v-if="value !== ag.id && opened[ag.id] !== true">mdi-new-box</v-icon>
                            <span>
                                <span class="mr-0" style="font-size: small; color: grey;">Task {{idx+1}}: </span>
                                <span>{{ag.title}}</span>
                            </span>
                        </v-card-title>

                        <v-card-subtitle style="font-size: small;">
                            <span>
                                <span v-if="get_annotation_group_status(ag.id) !== true" class="error--text">NOT FINISHED</span>
                                {{get_requirement_text(ag)}}
                            </span>
                        </v-card-subtitle>

                        <v-card-actions>
                            <v-btn outlined small color="primary" v-if="value !== ag.id" v-on:click="on_selected(ag)">
                                <v-icon small>mdi-pencil</v-icon> Edit
                            </v-btn>
                            <p v-else style="color: #6a737d">You are working on this now</p>
                        </v-card-actions>
                    </div>
                </v-card>

            </v-navigation-drawer>


    </div>
</template>

<script>
    import AnnotationSystemMixin from '../../mixins/annotation_system'
    export default {
        name: "TaskPanel",
        mixins: [
            AnnotationSystemMixin
        ],
        props: {
            value: {
                type: String
            }
        },
        data: () => ({
            // selected: this.value
            opened: {},
            minimized: false
        }),
        mounted() {
            // if (this.annotations_groups.length > 0){
            //     this.selected = this.annotations_groups[0].id;
            // }
            this.$set(this.opened, this.value, true);
        },
        watch: {
            value: function(){
                this.$set(this.opened, this.value, true);
            }
        },
        methods: {
            get_requirement_text(ag){
                if (ag.optional === true){
                    return "Optional"
                }

                if (ag.repeated === true){
                    if (ag.min !== undefined && ag.max !== undefined){
                        return `Require ${ag.min}-${ag.max} responses.`
                    }

                    if (ag.min === undefined && ag.max !== undefined){
                        return `Require no more than ${ag.max} responses.`
                    }

                    if (ag.min !== undefined && ag.max === undefined){
                        return `Require at least ${ag.min}.`
                    }
                }

                return "Required";
            },
            on_selected(ag){
                // this.selected=ag.id;opened
                this.$set(this.opened, ag.id, true);
                this.$emit("input", ag.id)
            }
        },

    }
</script>

<style scoped>
    .open-task{
        border-color: #42b983 !important;
        border-style: double !important;
        border-width: 2px !important;
    }
    .unfinished-task{
        margin-left: 3px;
        border-left-color: #b31d28 !important;
        border-left-width: 10px !important;
        border-left-style: solid !important;
    }
</style>