import Vue from 'vue'

export default {
    data: () => ({
        // hit_data: {
        //     assignment_id: "",
        //     hit_id: "",
        //     submit_to: "",
        //     worker_id: "",
        //     submit_to_url: "",
        // },
        mturk:{
            submit_payload: ""
        }
    }),
    compute: {
        hit_data(){
            return this.$store.getters['worker_app_store/get_hit_data'];
        },
        page_info(){
            return this.$store.getters['worker_app_store/get_page_info'];
        },
        links(){
            return this.$store.getters['worker_app_store/get_links'];
        }
    },
    methods: {
        submit_external_question(){
            const require_post_submit = this.hit_data.submit_to_url !== "";
            if (require_post_submit){
                Vue.nextTick(() => {
                    const form = document.getElementById('mturk-external-submit-form');
                    form.submit();
                })
            }else{
                location.reload();
            }
        }
    },
    watch: {
        "$route": function(){
            this.update_hit_data();
        }
    }
};
