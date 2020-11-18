export default {
    data: () => {
        return {
            feedback: {
                email: "",
                content: "",
                resource_type: "",
                resource_owner: "",
                resource_id: ""
            }
        }
    },
    methods: {
        submit_feedback_(){
            const feedback = this.feedback;
            const hit_data = this.hit_data;
            const page_url = window.location.href;
            const feedback_data = {feedback, hit_data, page_url};

            return this
                .$client
                .submit_feedback(
                    feedback_data,
                    this.feedback.resource_type,
                    this.feedback.resource_owner,
                    this.feedback.resource_id,
                );
        },
    }
};
