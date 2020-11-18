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
                    <TaskConfig
                            :owner="$client.get_current_user()"
                            @update="refresh_signal += 1"
                    ></TaskConfig>
                </v-dialog>

            </v-col>
        </v-row>
        <v-row>
            <v-col>

                <PaginatedTable
                        :refresh_signal="refresh_signal"
                        op="annotation_taskset.list"
                        :filter_arg="{
                            owner: this.$route.params.owner
                        }"
                >
                    <template v-slot:header>
                        <v-row class="font-weight-bold">
                            <v-col class="text-left">Name</v-col>
                            <v-col class="text-left">Link</v-col>
                        </v-row>

                    </template>

                    <template v-slot:item="{item}">
                        <v-row>
                            <v-col>{{ item.annotation_taskset_id }}</v-col>
                            <v-col>
                                <v-btn icon :to="`taskset/${item.annotation_taskset_id}`" color="success">
                                    <v-icon>mdi-open-in-new</v-icon>
                                </v-btn>

                                <v-btn icon color="error" @click="delete_taskset(item)">
                                    <v-icon>mdi-delete-outline</v-icon>
                                </v-btn>
                            </v-col>
                        </v-row>
                    </template>
                </PaginatedTable>
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <v-pagination
                        v-if="page_len > 1"
                        v-model="page"
                        :length="page_len"
                ></v-pagination>
            </v-col>
        </v-row>
</v-container>
</template>

<script>
    // @ is an alias to /src

    import TaskConfig from "../../../components/requester/configs/TaskConfig";
    import PaginatedTable from "../../../components/requester/PaginatedTable";

    export default {
        name: 'RequesterTasksetList',
        components: {
            TaskConfig, PaginatedTable
        },
        data () {
            return {
                refresh_signal: 0,
                new_id:'new_taskset',
                dialog: false,
                page: 1,
                page_len: 1,
                taskset_ids: [],
                selected_taskset: ""
            }
        },
        methods: {
            delete_taskset(item){
                const {owner} = this.$route.params;
                this.$client.make_request("annotation_taskset.delete", {
                    owner, annotation_taskset_id: item.annotation_taskset_id
                })
                .then(resp => {
                    this.refresh_signal += 1;
                }).catch(err => this.handle_axios_error(err))
                ;
            }
        },
        created () {
        },
        watch: {
        },
    }
</script>
