<template>
    <v-card
        outlined
        v-bind:class="{highlight: !is_answered}"
        class="pt-2"
    >
        <v-card tile class="pa-0 ma-4" v-if="question.question.context" style="border-color: #bbbbbb !important; border-style: solid; border-width: 2px">
            <v-container>
                <v-row>
                    <v-col
                            v-for="(ctx, idx) in question.question.context"
                            v-bind:key="idx"
                            :cols="(ctx.type === 'text' || ctx.type === 'html') ? 12 : undefined"
                    >
                        <ContextWrapper v-if="ctx" :ctx="ctx"></ContextWrapper>
                    </v-col>
                </v-row>
            </v-container>
        </v-card>


        <p class="pl-4 mt-3">{{question.question.question_text}}</p>

        <v-divider class="mx-1 pl-5"></v-divider>

        <div class="pl-3">
            <v-radio-group
                    v-model="selected"
                    v-on:change="onSelect"
            >
                <v-radio
                        v-for="(ans, idx) in question.question.options"
                        :key="idx"
                        :label="ans"
                        :value="idx"
                ></v-radio>
            </v-radio-group>
        </div>
    </v-card>
</template>

<script>
    import marked from "marked"
    import ContextWrapper from "./context/ContextWrapper";
    export default {
        name: 'MCQuestion',
        components: {
            ContextWrapper
        },
        props:{
            question: {
                type: Object,
            },
            is_answered: {
                type: Boolean,
                default: false,
            },
        },
        data: function(){
            return {
                selected: null,
            }
        },
        methods:{
            onSelect(idx){
                const task_id = this.question.question_id;
                const selected_choice_text = this.question.question.options[idx];
                const selected_index = idx;
                this.$emit('input', {
                    task_id,
                    selected_index,
                    selected_choice_text
                })
            }
        }

    }
</script>
<style scoped>
    .highlight{
        /*box-shadow: -5px 0px #FA8072;*/
        border-left-color: #FA8072 !important;
        border-left-width: 5px !important;

        border-right-color: #FA8072 !important;
        border-right-width: 5px !important;;

        border-top-color: #FA8072 !important;
        border-top-width: 1px !important;;
        border-bottom-color: #FA8072 !important;
        border-bottom-width: 1px !important;;
    }
</style>