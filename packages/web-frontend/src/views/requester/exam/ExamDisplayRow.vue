<template>
    <div style="display: contents">
        <tr >
            <td>


                <v-btn
                        color="success"
                        fab
                        elevation="0"
                        x-small
                        :to="`/requester/${$route.params.owner}/question_set/${question.question_set_id}/question/${question_id}`"
                >
                    <v-icon >mdi-pencil-outline</v-icon>
                </v-btn>

                <v-btn
                        fab
                        elevation="0"
                        x-small
                        @click="display_content=!display_content">
                    <v-icon color="success" v-if="!display_content">mdi-eye</v-icon>
                    <v-icon color="error" v-else>mdi-eye-off</v-icon>
                </v-btn>

            </td>
            <td>
                {{ question_id }}
            </td>
            <td>{{ question.assignment_count }}</td>
            <td>{{ question.correct_answer }}</td>
            <td>
                {{ question.disabled ? "Disabled" : "Enabled" }}
                <p style="font-size: small; color: #888888" >To disable/enable this question, use the edit functionality and change its disable status to false.</p>
            </td>
            <td>{{ question.passing_ratio }}</td>
            <td>{{ question.response_dist }}</td>
        </tr>
        <tr
            v-show="display_content"
        >
            <td colspan="7" style="background-color: #eeeeee; " >
                <MCQuestion :question="question" :is_answered="true"></MCQuestion>
            </td>
        </tr>
    </div>
</template>

<script>
    import MCQuestion from "../../../components/MCQuestion";
    export default {
        name: "ExamDisplayRow",
        components: {
            MCQuestion
        },
        props: {
            question: Object,
            question_id: String,
            question_set_id: String
        },
        data: () => ({
            display_content: false,
            enabled: true
        }),

        methods:{
            disable_question(){
                this.$client.exam_question()
            }
        }
    }
</script>