<template>
    <v-container fluid>
        <PaginatedTable
                :refresh_signal="refresh_signal"
                op="feedback.list"
                :filter_arg="{
                            owner: this.$route.params.owner
                        }"
        >
            <template v-slot:header>
                <v-row class="font-weight-bold">
                    <v-col class="text-left">Worker</v-col>
                    <v-col class="text-left">Object</v-col>
                    <v-col class="text-left" cols="2">Email</v-col>
                    <v-col class="text-left">Time</v-col>
                    <v-col class="text-left" cols="6">Content</v-col>
                </v-row>

            </template>
            <template v-slot:item="{item}">
                <v-row>
                    <v-col>{{ `(${item.worker_platform}) ${item.worker_id}` }}</v-col>
                    <v-col>
                        {{getObjectString(item)}}
                    </v-col>

                    <v-col cols="2">
                        <a v-if="validateEmail(item.worker_email)" :href="`mailto:${item.worker_email}`">{{item.worker_email}}</a>
                        <span v-else>{{item.worker_email}}</span>
                    </v-col>

                    <v-col>
                        {{formatTime(item.create_at)}}
                    </v-col>

                    <v-col cols="6">
                        {{item.feedback}}
                    </v-col>
                </v-row>
            </template>
        </PaginatedTable>
    </v-container>
</template>

<script>
    // @ is an alias to /src
    import PaginatedTable from "../../../components/requester/PaginatedTable";
    import _ from 'lodash';
    import moment from 'moment'

    export default {
        name: 'RequesterFeedbackView',
        components: {
            PaginatedTable
        },
        data () {
            return {
                refresh_signal: 0
            }
        },
        methods: {
            validateEmail(email) {
                if (email){
                    const re = /^\S+@\S+$/;
                    return re.test(email);
                }
                return false;
            },

            formatTime(time){
                return moment(time);
            },

            getObjectString(item){
                const {
                    instruction_id,
                    tutorial_id,
                    exam_id,
                    annotation_taskset_id,
                    annotation_task_id,
                } = item;

                const names =
                    _.chain({
                        instruction_id,
                        tutorial_id,
                        exam_id,
                        annotation_taskset_id,
                        annotation_task_id,
                    }).map((v,k) => ({v,k}))
                        .filter(x => x.v !== null)
                        .map(x => `${x.k} = ${x.v}`).join("\n");

                return names;

            }

        },
        created () {

        },
        watch: {

        }
    }
</script>
