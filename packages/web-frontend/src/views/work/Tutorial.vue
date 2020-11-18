<template>
    <v-container fluid>
        <CrowdaqObjectDisplayWrapper
                type="tutorial"
                :definition="definition"
        ></CrowdaqObjectDisplayWrapper>
    </v-container>
</template>

<script>

    import CrowdaqObjectDisplayWrapper from "../../components/CrowdaqObjectDisplayWrapper";
    export default {
        name: 'TutorialInterface',
        components: {
            CrowdaqObjectDisplayWrapper
        },
        data: () => ({
            definition: {
                question_set: []
            }
        }),
        computed: {
        },
        methods: {
            fetch_data () {
                const {owner, tutorial_id} = this.$route.params;
                // const project_id = this.$route.params.project_id;
                this.$client.make_request("tutorial.get",
                    {owner, tutorial_id})
                    .then(resp => {
                        this.definition = resp.data.definition;
                        this.$store.commit("worker_app_store/add_instruction",{
                            owner,
                            name: "Instruction",
                            instruction_id: this.definition.instruction_id,
                            params: this.$route.query
                        });
                    })
                    .catch(error => {

                    })
            }
        },
        created () {
            // fetch the data when the view is created and the data is
            // already being observed
            this.fetch_data()
        },
        watch: {
            '$route': 'fetch_data',
        },
    }
</script>
