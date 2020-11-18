<template>
    <v-container>
        <v-row>
            <v-col>
                <v-dialog v-model="dialog"
                          max-width="640">
                    <template v-slot:activator="{ on }">
                        <v-btn outlined color="success" v-on="on">
                            <v-icon>mdi-plus</v-icon>Add
                        </v-btn>
                    </template>
                    <ExamConfig
                        :owner="$route.params.owner"
                        @update="jump_to_exam"></ExamConfig>
                </v-dialog>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="12">
                <PaginatedTable
                    :refresh_signal="refresh_signal"
                    op="exam.list"
                    :filter_arg="{
                        owner: this.$route.params.owner
                    }"
                >
                    <template v-slot:header>
                        <v-row class="font-weight-bold">
                            <v-col class="text-left">Name</v-col>
                            <v-col class="text-left">Preview Link</v-col>
                            <v-col class="text-left">Edit</v-col>
                        </v-row>

                    </template>

                    <template v-slot:item="{item}">
                        <v-row>
                            <v-col>{{ item.exam_id }}</v-col>
                            <v-col>
                                <a :href="`/w/exam/${$route.params.owner}/${item.exam_id}`" target="_blank"> Preview </a>
                            </v-col>
                            <v-col>
                                <v-btn icon color="success" :to="`./exam/${item.exam_id}`">
                                    <v-icon>mdi-pencil</v-icon>
                                </v-btn>

                                <v-btn icon color="error" @click="delete_exam(item)">
                                    <v-icon>mdi-delete</v-icon>
                                </v-btn>
                            </v-col>
                        </v-row>
                    </template>
                </PaginatedTable>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
    // @ is an alias to /src
    import ExamConfig from "../../../components/requester/configs/ExamConfig";
    import PaginatedTable from "../../../components/requester/PaginatedTable";

    export default {
        name: 'RequesterExamListView',
        components: {
            ExamConfig, PaginatedTable
        },
        data () {
            return {
                dialog: false,
                refresh_signal: 0,
            }
        },
        computed: {
        },
        methods: {
            fetch_listing(){
                const {owner} = this.$route.params;
                this.$client.make_request("exam.list", {
                    owner,
                    page_option: {
                        page: this.page,
                        page_size: 20,
                    }
                }).then((resp => {
                    this.exams = resp.data.results;
                })).catch(err => {
                    this.handle_axios_error(err)
                })
            },

            delete_exam(exam){
                const {owner} = this.$route.params;
                this.$client.make_request("exam.delete", {
                    owner, exam_id: exam.exam_id
                }).then((resp => {
                    this.refresh_signal += 1;
                })).catch(err => {
                    this.handle_axios_error(err);
                })
            },


            jump_to_exam(payload){
                const {owner, exam_id} = payload;
                this.dialog = false;
                this.$router.push(`/requester/${owner}/exam/${exam_id}`)
            },



        },
        created () {
            this.fetch_listing()
        },
        watch: {
            '$route': 'fetch_listing'
        },
    }
</script>
