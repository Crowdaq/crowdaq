<template>
    <v-card :loading="loading">
        <v-card-text>
            <v-container>
                <v-row>
                    <v-col>
                        <span
                                class="pb-4"
                                style="font-size: large"
                        >
                            <b>Username: :</b> <span style="text-decoration: underline">{{username}}</span>
                        </span>

                        <v-text-field
                                label="AWS Access Key"
                                v-model="aws_access_key_id">
                        </v-text-field>
                        <v-text-field
                                label="AWS Secret Key"
                                v-model="aws_secret_access_key">
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
        name: "UserProfileConfig",
        props: {
            username: String,
        },
        data: () => ({
            loading: false,
            aws_access_key_id: "",
            aws_secret_access_key: "",
        }),
        methods:{
            load(){
                if (this.exam_id !==''){
                    const {username} = this;
                    this.loading = true;
                    this.$client.make_request("user_profile.get", {
                        username
                    }).then(resp => {
                        const {
                            aws_access_key_id,
                            aws_secret_access_key
                        } = resp.data;
                        this.aws_access_key_id = aws_access_key_id;
                        this.aws_secret_access_key = aws_secret_access_key;
                        this.loading=false;
                    }).catch(err => {
                        this.loading=false;
                    });
                }
            },
            update(){
                const {
                    aws_access_key_id,
                    aws_secret_access_key,
                    username
                } = this;
                this.loading=true;
                this.$client.make_request("user_profile.update", {
                    username, aws_access_key_id, aws_secret_access_key
                }).then(resp => {
                    this.loading=false;
                    this.$notify({
                      text: 'Profile updated.',
                      type: 'success'
                    })
                    this.$emit('update')
                }).catch(err => {
                    this.loading=false;
                    this.$emit('error')
                  this.$notify({
                    text: 'There is an error.',
                    type: 'error'
                  })
                });
            }
        },
        watch:{
            username: {
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