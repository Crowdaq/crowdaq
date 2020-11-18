<template>
    <div>
        <PaginatedTable
                :refresh_signal="refresh_signal"
                op="exam_question.list"
                :filter_arg="{
                        owner: this.$route.params.owner,
                        exam_id: this.$route.params.exam_id
                    }"
        >
            <template v-slot:header>
                <v-row class="font-weight-bold">
                    <v-col class="text-left">Question ID</v-col>
                    <v-col class="text-left">Preview</v-col>
                    <v-col class="text-left">Action</v-col>
                    <v-col class="text-left">Total</v-col>
                    <v-col class="text-left">Correct Answer</v-col>
                    <v-col class="text-left">Average Score</v-col>
                    <v-col class="text-left">Response Distribution</v-col>
                </v-row>
            </template>

            <template v-slot:item="{item}">
                <QuestionRow
                        @enable="enable_question"
                        @disable="disable_question"
                        :item="item"/>
            </template>
        </PaginatedTable>

    </div>
</template>

<script>
    import PaginatedTable from "../../../../components/requester/PaginatedTable";
    import QuestionRow from "./QuestionRow";
    export default {
        name: "ExamQuestions",
        components: {
            PaginatedTable, QuestionRow
        },
        props: {

        },
        data: () => ({
            refresh_signal: 0
        }),

        methods:{
            upload_exam_question(){

            },
            disable_question({question_id}){
                const {owner, exam_id} = this.$route.params;
                this.$client.make_request("exam_question.disable", {
                    owner, exam_id, question_id
                }).then(resp => {
                    this.refresh_signal += 1;
                })
            },

            enable_question({question_id}){
                const {owner, exam_id} = this.$route.params;
                this.$client.make_request("exam_question.enable", {
                    owner, exam_id, question_id
                }).then(resp => {
                    this.refresh_signal += 1;
                })
            },
        },
        watch:{

        },
    }
</script>