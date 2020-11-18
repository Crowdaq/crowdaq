<template>
    <v-container>
        <v-row>
            <v-col>
                <CrowdaqObjectDisplayWrapper
                        type="instruction"
                        :definition="definition"
                ></CrowdaqObjectDisplayWrapper>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
    import CrowdaqObjectDisplayWrapper from "../../components/CrowdaqObjectDisplayWrapper";

    export default {
        name: 'InstructionApp',
        components: {
            CrowdaqObjectDisplayWrapper
        },
        data: () => ({
            definition: ""
        }),
        methods: {
            fetch_data () {
                const {owner, instruction_id} = this.$route.params;
                this.$client.make_request(
                    "instruction.get",
                    {
                            owner,
                            instruction_id
                         }
                ).then(resp =>  {
                    this.definition = resp.data.definition
                }).catch(err => {

                })
            }
        },
        created () {
            // fetch the data when the view is created and the data is
            // already being observed
            this.fetch_data()
        },
        watch: {
            // call again the method if the route changes
            '$route': 'fetch_data'
        },
    }
</script>
