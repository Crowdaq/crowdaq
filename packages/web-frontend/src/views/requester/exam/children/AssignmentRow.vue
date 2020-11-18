<template>
    <div>
        <v-row>
            <v-col>
                <router-link :to="`?worker_platform=${item.worker_platform}&worker_id=${item.worker_id}`">{{ `(${item.worker_platform}) - ${item.worker_id}` }}</router-link>
            </v-col>
            <v-col>{{item.grade}}</v-col>
            <v-col>{{completeTimeOf(item)}}</v-col>
            <v-col>{{durationOf(item)}}</v-col>
            <v-col>
                <v-btn text @click="expanded=!expanded">See Response</v-btn>
            </v-col>
            <v-col>

                <v-btn icon color="error" @click="$emit('delete', item)">
                    <v-icon>mdi-delete</v-icon>
                </v-btn>
            </v-col>
        </v-row>
        <v-row v-if="expanded">
            <v-col cols="12">
                <CodeHighlight
                        :code="formatedResponse"></CodeHighlight>
            </v-col>
        </v-row>
    </div>

</template>


<script>
    import humanizeDuration from "humanize-duration";
    import moment from "moment";
    import CodeHighlight from "../../../../components/misc/CodeHighlight";

    export default {
        name: "ExamAssignmentRow",
        props: {
            item: Object
        },
        components: {
            CodeHighlight
        },
        data: function(){
            return {
                expanded: false,
                formatedResponse: JSON.stringify(this.item.response_payload, null, 4)
            }
        },
        mounted() {
            this.formatedResponse = JSON.stringify(this.item.response_payload, null, 4)
        },
        watch:{
            item: function(){
                this.formatedResponse = JSON.stringify(this.item.response_payload, null, 4)
            },
        },
        methods: {
            humanize_seconds(seconds){
                return humanizeDuration(Math.round(seconds) * 1000)
            },

            completeTimeOf(item){
                return moment(item.complete_time);
            },

            durationOf(item){
                return this.humanize_seconds((moment(item.complete_time) - moment(item.create_at)) / 1000);
            }

        }
    }
</script>