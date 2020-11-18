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
                        <v-card-title class="headline">New Tutorial</v-card-title>
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
                                   :to="`tutorial/${new_id}?new=1`"
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
                        op="tutorial.list"
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
                            <v-col>{{ item.tutorial_id }}</v-col>
                            <v-col>
                                <router-link :to="`/w/tutorial/${$route.params.owner}/${item.tutorial_id}`" target="_blank"> Preview </router-link>
                            </v-col>
                            <v-col>
                                <v-btn icon :to="`tutorial/${item.tutorial_id}`" color="success" class="mr-4">
                                    <v-icon>mdi-pencil</v-icon>
                                </v-btn>

                                <v-btn icon color="error" @click="delete_tutorial(item.tutorial_id)">
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
        name: 'RequesterTutorialListView',
        components: {
            PaginatedTable
        },
        data () {
            return {
                refresh_signal:0,
                new_id: "new_tutorial",
                dialog: false,
                tutorials: []
            }
        },
        methods: {
            delete_tutorial(tutorial_id){
                const {owner} = this.$route.params;
                this.$client.make_request("tutorial.delete", {owner, tutorial_id}).then((resp => {
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
