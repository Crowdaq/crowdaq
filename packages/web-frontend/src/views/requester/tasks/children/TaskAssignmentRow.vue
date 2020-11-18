<template>
    <div>
        <v-row>
            <v-col
            >
                <v-btn icon :to="`/requester/${$route.params.owner}/taskset/${$route.params.annotation_taskset_id}/task/${item.annotation_task_id}`">
                    <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <router-link :to="`?annotation_task_id=${item.annotation_task_id}`">{{ item.annotation_task_id }}</router-link>
            </v-col>
            <v-col>
                <router-link :to="`?worker_platform=${item.worker_platform}&worker_id=${item.worker_id}`">{{ `(${item.worker_platform}) - ${item.worker_id}` }}</router-link>
            </v-col>
            <v-col>{{completeTimeOf(item)}}</v-col>
            <v-col>{{durationOf(item)}}</v-col>

            <v-col>
                <v-btn text @click="expanded = !expanded">Preview</v-btn>
            </v-col>
            <v-col>
                <v-btn icon color="error" @click="$emit('delete', item)">
                    <v-icon>mdi-delete</v-icon>
                </v-btn>
            </v-col>
        </v-row>
        <v-row v-if="expanded">
            <v-col cols="12">
                <CodeHighlight :code="JSON.stringify(item.response, null, 4)"></CodeHighlight>
            </v-col>
        </v-row>
    </div>
</template>
<script>
    import humanizeDuration from "humanize-duration";
    import moment from "moment";
    import CodeHighlight from "../../../../components/misc/CodeHighlight";

    export default {
        name: "TaskAssignmentTableRow",
        components: {
            CodeHighlight
        },
        props: {
            item: Object,
        },
        data: () => ({
            expanded: false
        }),
        methods: {
            humanize_seconds(seconds){
                return humanizeDuration(Math.round(seconds) * 1000)
            },

            completeTimeOf(item){
                return moment(item.complete_time);
            },

            durationOf(item){
                return this.humanize_seconds((moment(item.complete_time) - moment(item.start_time)) / 1000);
            }
        }
    }
</script>