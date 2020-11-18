<template>
    <v-container>

        <v-row>
            <v-col>
                <v-dialog v-model="dialog" max-width="290">
                    <template v-slot:activator="{ on }">
                        <v-btn outlined color="success" v-on="on">
                            <v-icon>mdi-plus</v-icon>Add
                        </v-btn>
                    </template>
                    <v-card>
                        <v-card-title class="headline">New Instruction</v-card-title>
                        <v-card-text>
                            <v-container>
                                <v-row>
                                    <v-col>
                                        <v-text-field
                                                v-model="new_id"
                                                label="Id"
                                                hint="[0-9a-zA-Z_]*"
                                                persistent-hint
                                                required
                                        ></v-text-field>
                                    </v-col>
                                </v-row>
                            </v-container>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="success darken-1"
                                   text
                                   :to="`instruction/${new_id}?new=1`"
                                   @click="dialog = false">Create</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </v-col>
        </v-row>

        <v-row>
            <v-col>

                <PaginatedTable
                    :refresh_signal="refresh_signal"
                    op="instruction.list"
                    :filter_arg="{
                        owner: this.$route.params.owner
                    }"
                >
                    <template v-slot:header>
                        <v-row class="font-weight-bold">
                            <v-col>Name</v-col>
                            <v-col>Preview Link</v-col>
                            <v-col>Edit</v-col>
                        </v-row>
                    </template>
                    <template v-slot:item="{item}">
                        <v-row>
                            <v-col>{{ item.instruction_id }}</v-col>
                            <v-col>
                                <a :href="`/w/instruction/${$route.params.owner}/${item.instruction_id}`" target="_blank"> Preview </a>
                            </v-col>
                            <v-col>
                                <v-btn icon :to="`/requester/${$route.params.owner}/instruction/${item.instruction_id}`" color="success" class="mr-4">
                                    <v-icon>mdi-pencil</v-icon>
                                </v-btn>

                                <v-btn icon color="error" @click="delete_instruction(item)">
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
    import PaginatedTable from "../../../components/requester/PaginatedTable";
    export default {
        name: 'RequesterInstructionListView',
        components: {
            PaginatedTable
        },
        data () {
            return {
                refresh_signal: 0,
                new_id: "new_instruction",
                dialog: false,
                instructions: []
            }
        },
        methods: {
            delete_instruction(instruction){
                const {owner} = this.$route.params;
                this.$client.Instruction.delete(owner, instruction.instruction_id).then((resp => {
                    this.refresh_signal += 1;
                })).catch(err => {
                    this.handle_axios_error(err);
                })
            },
        },
        created () {
        },
        watch: {

        },
    }
</script>
