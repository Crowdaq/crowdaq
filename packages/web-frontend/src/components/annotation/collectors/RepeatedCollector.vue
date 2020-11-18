<template>
    <div>
        <p :class="{
            'success--text': status_messages.pass,
            'error--text': !status_messages.pass,
        }" v-for="(msg, msg_idx) in status_messages.messages" :key="'msg'+msg_idx">
            {{msg}}
        </p>

        <div v-if="annotation.type === 'text'">
            <TextCollector
                    quiet
                    :annotation="annotation"
                    v-model="value_to_add"
                    :status_messages="value_to_add_status_message"
            ></TextCollector>
        </div>

        <div v-if="annotation.type === 'span-from-text'">
            <SpanFromTextCollector
                    quiet
                    :annotation="annotation"
                    v-model="value_to_add"
                    :status_messages="value_to_add_status_message"
            ></SpanFromTextCollector>
        </div>

        <div v-if="annotation.type === 'datetime'">
            <DatetimeCollector
                    quiet
                    :annotation="annotation"
                    v-model="value_to_add"
                    :status_messages="value_to_add_status_message"
            ></DatetimeCollector>
        </div>

        <div v-for="(v, idx) in value" :key="idx">
            <v-btn x-small fab icon v-on:click="remove_result(idx)" ><v-icon>mdi-delete</v-icon></v-btn>
            <SingleResultWrapper
                    :annotation="annotation"
                    :value="v"
            ></SingleResultWrapper>
        </div>

        <div class="d-flex flex-row">

            <div>
                <v-btn
                        :disabled="!value_to_add_status_message.pass"
                        color="info" rounded class="mt-2" v-on:click="add_result">
                    Add to result
                </v-btn>
            </div>

            <div>
                <v-btn
                        v-if="!confirmed_zero_results && can_have_zero_result && value !== undefined && value.length === 0"
                        color="warning"
                        text
                        class="mt-2"
                        v-on:click="confirm_zero_results">
                    No Answers
                </v-btn>
            </div>

        </div>

    </div>
</template>

<script>

    import TextCollector from "../collectors/TextCollector";
    import SpanFromTextCollector from "../collectors/ClickBaseSpanFromTextCollector";
    // import SpanFromTextCollector from "./collectors/SpanFromTextCollector";

    import DatetimeCollector from "./DateCollector";
    import SingleResultWrapper from "../results/SingleResultWrapper";
    import Task from "../../../lib/tasks";


    export default {
        name: "RepeatedCollector",
        components: {
            SpanFromTextCollector, TextCollector, DatetimeCollector, SingleResultWrapper
        },
        props: {
            value: {
                type: [Array]
            },
            annotation: {
                type: Object
            },
            status_messages: {
                type: Object
            },
        },
        data: () => ({
            value_to_add: undefined,
            value_to_add_status_message: {
                pass: false,
                message: []
            },

            confirmed_zero_results: false
        }),

        mounted() {

        },

        computed:{
            can_have_zero_result(){
                if (this.annotation.min === undefined){
                    return true;
                }
                if (this.annotation.min <= 0){
                    return true;
                }
                return false;
            },
        },
        watch: {
            value_to_add: function(){
                this.value_to_add_status_message =
                    Task.eval_constraints(this.value_to_add, this.annotation, this.annotation.constraints);
            }
        },
        methods: {
            confirm_zero_results(){
                this.confirmed_zero_results=true;
                this.$emit("input", this.value);
            },

            sorted_json_string(obj){
                return JSON.stringify(obj, Object.keys(obj).sort())
            },

            add_result(){
                if (this.value !== undefined){
                    for (let i = 0; i < this.value.length; i++){
                        const v = this.value[i];
                        if (this.sorted_json_string(v) === this.sorted_json_string(this.value_to_add)){
                            this.value_to_add_status_message.pass = false;
                            this.value_to_add_status_message.message = ['Duplication detected.'];
                            return;
                        }
                    }
                }

                const _vs = JSON.parse(JSON.stringify(this.value === undefined ? [] : this.value));
                _vs.push(this.value_to_add);
                this.emit_result(_vs);
            },
            remove_result(idx){
                const _vs = JSON.parse(JSON.stringify(this.value));
                _vs.splice(idx, 1);
                this.emit_result(_vs);
            },
            emit_result(payload){
                this.$emit("input", payload);
            },
        }

    }
</script>