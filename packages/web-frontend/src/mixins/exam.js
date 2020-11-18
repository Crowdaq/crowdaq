export default {
    data: () => ({
        exam: {
            instruction_id: "",
            tutorial_id: "",
            remain_attempts: 0,
            questions: [],
            progress: 0,
            total_questions: 0,
            user_response: {},
            assignment_id: "",
        }
    }),
    methods: {
        fetch_exam(){
            const {workerId} = this.$route.query;
            const {owner, exam_id} = this.$route.params;

            this.$client.get_exam_data(owner, exam_id, workerId)
                .then(resp => {
                    console.log(resp.data);
                    const data = resp.data;
                    this.exam.questions = data.questions;
                    this.exam.instruction_id = data.instruction_id;
                    this.exam.tutorial_id = data.tutorial_id;
                    this.exam.total_questions = this.exam.questions.length;
                    this.exam.exam_assignment_id = data.exam_assignment_id;
                    this.exam.remain_attempts = data.remain_attempts;
                })
                .catch(error => {
                    this.handle_axios_error(error);
                })
        },

        is_answered(task_id){
            return this.exam.user_response[task_id] !== undefined;
        },

        handle_exam_response(resp){
            const {task_id} = resp;
            this.exam.user_response[task_id] = resp.selected_index;
            this.exam.progress = Object.keys(this.exam.user_response).length;
        },

        update_progress(){
            this.exam.progress = Object.keys(this.exam.user_response).length;
        },
    }
};
