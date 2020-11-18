<template>
    <div>
        <notifications
            position="top left"
        >
            <template slot="body" slot-scope="props">
                <v-alert
                    dense
                    dark
                    :color="props.item.type"
                >
                    <h3 class="subtitle-1">{{props.item.title}}</h3>
                    <v-icon @click="props.close">mdi-close</v-icon>
                    {{props.item.text}}
                </v-alert>
            </template>
        </notifications>

        <v-sheet class="d-flex align-center flex-column login-background">

            <v-card class="pa-2 ma-12 login-box" raised>
                <v-card-title>
                    <span class="title font-weight-light">Login</span>
                </v-card-title>
                <v-card-text>
                    <v-text-field
                            v-model="username"
                            label="Username"
                            required
                            v-on:keydown="handle_keydown"
                    ></v-text-field>
                    <v-text-field
                            v-model="password"
                            :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                            :type="show1 ? 'text' : 'password'"
                            label="Password"
                            @click:append="show1 = !show1"
                            v-on:keydown="handle_keydown"
                    ></v-text-field>
                </v-card-text>

                <v-card-actions class="d-flex justify-end">
                    <v-btn
                        color="#2A9D90"
                        text
                        v-on:click="login"
                    >
                        <v-icon>mdi-login-variant</v-icon>Login
                    </v-btn>
                </v-card-actions>

            </v-card>

        </v-sheet>
    </div>

</template>

<script>
    // @ is an alias to /src

    import AlertNotification from "../../components/AlertNotification";
    import Cookies from 'js-cookie'

    export default {
        name: 'WorkApp',
        components: {

        },
        data () {
            return {
                username: "",
                password: "",
                show1: false,
            }
        },
        methods: {
            handle_keydown(event){
                if(event.key === "Enter"){
                    this.login()
                }
            },
            login(){
                this.$client.login(this.username, this.password).then(resp => {
                    console.log(resp.data);
                    const token = resp.data.token;

                    window.localStorage.setItem('auth_token', token);

                    let {redirect} = this.$route.query;
                    if (!redirect){
                        redirect = `/requester/${this.username}/instruction`
                    }

                    // We need to clear all message here.
                    // this.$store.commit("alerts/clear_messages");
                    this.$router.push(redirect);
                }).catch(error => {})
            }
        }
    }
</script>

<style>
    .login-background{
        height: 100%;
        width: 100%;
        position: absolute;
        background: #264653;
        background: -webkit-linear-gradient(bottom right, #264653, #2A9D90);
        background: -moz-linear-gradient(bottom right, #264653, #2A9D90);
        background: linear-gradient(to top left, #264653, #2A9D90);
    }
    .login-box{
        height: 400px;
        width: 350px;
        background: #e9c46a;
    }
</style>
