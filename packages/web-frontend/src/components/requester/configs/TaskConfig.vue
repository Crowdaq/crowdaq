<template>
    <v-card :loading="loading">
        <v-card-text>
            <v-container>
                <v-row>
                    <v-col>
                        <span
                                class="pb-4"
                                style="font-size: large"
                                v-if="annotation_taskset_id !== ''"
                        >
                            <b>Taskset ID:</b> <span style="text-decoration: underline">{{annotation_taskset_id}}</span>
                        </span>

                        <v-text-field
                                label="Taskset ID"
                                v-else
                                v-model="new_annotation_taskset_id">
                        </v-text-field>

                        <v-text-field
                                label="Time Limit in Seconds"
                                v-model="time_limit_in_seconds">
                        </v-text-field>
                    </v-col>
                </v-row>
            </v-container>
        </v-card-text>

        <v-card-actions>
            <v-btn outlined color="success" @click="update" :disabled="loading">
                Update
            </v-btn>
        </v-card-actions>
    </v-card>
</template>
<script>
    export default {
        name: "AnnotationTaskSetConfig",
        props: {
            owner: String,
            annotation_taskset_id: {
                type: String,
                default: ""
            }
        },
        data: () => ({
            loading: false,
            changed: false,
            new_annotation_taskset_id: "",
            time_limit_in_seconds: 3600,
        }),
        methods:{
            load(){
                if (this.annotation_taskset_id !==''){
                    const {owner, annotation_taskset_id} = this;
                    this.loading = true;
                    this.$client.make_request("annotation_taskset.get", {
                        owner, annotation_taskset_id
                    }).then(resp => {
                        this.loading=false;
                        this.time_limit_in_seconds = resp.data.time_limit_in_seconds;
                        this.changed = false;
                    }).catch(err => {
                        this.loading=false;
                    });
                }
            },
            update(){

                const {
                    time_limit_in_seconds,
                    owner
                } = this;

                const annotation_taskset_id = this.annotation_taskset_id !== '' ? this.annotation_taskset_id : this.new_annotation_taskset_id;

                const definition = {
                    time_limit_in_seconds
                };

                this.$client.make_request("annotation_taskset.update", {
                    owner, annotation_taskset_id, definition
                }).then(resp => {
                    this.$emit('update', {
                        owner, annotation_taskset_id, definition
                    })
                }).catch(err => {
                    console.log(err);
                });
            }
        },
        watch:{
            time_limit_in_seconds: function(){
                this.changed = true;
            },
            annotation_taskset_id: {
                immediate: true,
                handler(newVal, oldVal) {
                    if (newVal === ''){
                        return;
                    }else{
                        this.load()
                    }
                },
            },
        }
    }
</script>