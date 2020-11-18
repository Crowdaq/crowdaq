<template>
    <div>
        <v-app-bar
                color="success"
                dense
                dark
        >
            <v-app-bar-nav-icon
                    v-on:click="open = !open"
            ></v-app-bar-nav-icon>

            <v-toolbar-title> {{$route.meta.title}} </v-toolbar-title>

            <v-spacer></v-spacer>

            <v-dialog v-model="profile_dialog"
                      max-width="640">
                <template v-slot:activator="{ on }">
                    <v-btn outlined v-on="on" class="mr-4" color="accent">
                        <v-icon>mdi-console</v-icon>
                        Update User Profile
                    </v-btn>
                </template>
                <UserConfig
                        :username="get_current_crowdaq_user()"
                        @update="() => profile_dialog=false"
                        @error="() => profile_dialog=false"
                ></UserConfig>
            </v-dialog>

            <v-btn
                outlined
                v-on:click="logout"
            >
                <v-icon>mdi-logout</v-icon> Logout
            </v-btn>
        </v-app-bar>


        <v-navigation-drawer
                class="side-menu"
                color="#264653"
                v-model="open"
                absolute
                temporary
                dark
        >

            <v-row>
                <v-col class="d-flex flex-row-reverse">
                    <v-icon
                            class="mr-3"
                            @click="open=false"
                            color="error">mdi-close-outline
                    </v-icon>
                </v-col>
            </v-row>

            <v-list-item class="mt-5 mb-5">
                <v-list-item-avatar>
                    <v-icon color="success">mdi-account</v-icon>
                </v-list-item-avatar>

                <v-list-item-content>
                    <v-list-item-title>Hi, {{$client.get_current_user() }}</v-list-item-title>
                </v-list-item-content>
            </v-list-item>

            <v-divider></v-divider>

<!--            <v-list>-->
<!--                <v-list-item link :to="'/studio'" two-line>-->
<!--                    <v-list-item-content>-->
<!--                        Design Studio-->
<!--                    </v-list-item-content>-->
<!--                </v-list-item>-->
<!--            </v-list>-->

            <PaginatedListPreview
                    op="instruction.list"
                    :filter_arg="{
                        owner: this.$client.get_current_user()
                    }"
                    name="Instruction"
                    nav
                    :to="'/requester/' + $client.get_current_user() +'/instruction'"
            >
                <template v-slot:content="{item}">
                    <v-list-item class="pl-12" :to="`/requester/${$route.params.owner}/instruction/${item.instruction_id}`" exact>
                        <v-list-item-content>
                            {{item.instruction_id}}
                        </v-list-item-content>
                    </v-list-item>
                </template>
                <template v-slot:additional>
                    <v-list-item :to="'/requester/' + $client.get_current_user() +'/instruction'" exact>
                        <v-list-item-action-text class="accent--text">
                            <v-icon color="accent">mdi-cog</v-icon>
                            Manage instructions
                        </v-list-item-action-text>
                    </v-list-item>
<!--                    <v-list-item link :to="'/studio?mode=new-instruction'">-->
<!--                        <v-list-item-action-text class="accent&#45;&#45;text">-->
<!--                            <v-icon color="accent">mdi-plus-circle-outline</v-icon>-->
<!--                            Create new instructions-->
<!--                        </v-list-item-action-text>-->
<!--                    </v-list-item>-->
                </template>
            </PaginatedListPreview>

            <PaginatedListPreview
                    op="tutorial.list"
                    :filter_arg="{
                        owner: this.$client.get_current_user()
                    }"
                    name="Tutorials"
                    nav
                    :to="'/requester/' + $client.get_current_user() +'/tutorial'"
            >
                <template v-slot:content="{item}">
                    <v-list-item link class="pl-12" :to="`/requester/${$route.params.owner}/tutorial/${item.tutorial_id}`" exact>
                        <v-list-item-content>
                            {{item.tutorial_id}}
                        </v-list-item-content>
                    </v-list-item>
                </template>
                <template v-slot:additional>
                    <v-list-item link :to="'/requester/' + $client.get_current_user() +'/tutorial'" exact>
                        <v-list-item-action-text class="accent--text">
                            <v-icon color="accent">mdi-cog</v-icon>
                            Manage tutorials
                        </v-list-item-action-text>
                    </v-list-item>
                </template>
            </PaginatedListPreview>

            <PaginatedListPreview
                    op="exam.list"
                    :filter_arg="{
                        owner: this.$client.get_current_user()
                    }"
                    name="Exams"
                    nav
                    :to="'/requester/' + $client.get_current_user() +'/exam'"
            >
                <template v-slot:content="{item}">
                    <v-list-item link class="pl-12" :to="`/requester/${$route.params.owner}/exam/${item.exam_id}`">
                        <v-list-item-content>{{item.exam_id}}</v-list-item-content>
                    </v-list-item>
                </template>
                <template v-slot:additional>
                    <v-list-item link :to="'/requester/' + $client.get_current_user() +'/exam'" exact>
                        <v-list-item-action-text class="accent--text">
                            <v-icon color="accent">mdi-cog</v-icon>
                            Manage Exams
                        </v-list-item-action-text>
                    </v-list-item>
                </template>
            </PaginatedListPreview>


            <PaginatedListPreview
                    op="annotation_taskset.list"
                    :filter_arg="{
                        owner: this.$client.get_current_user()
                    }"
                    name="Annotation Tasks"
                    nav
                    :to="'/requester/' + $client.get_current_user() +'/taskset'"
            >
                <template v-slot:content="{item}">
                    <v-list-item link class="pl-12" :to="`/requester/${$route.params.owner}/taskset/${item.annotation_taskset_id}`">
                        <v-list-item-content>{{item.annotation_taskset_id}}</v-list-item-content>
                    </v-list-item>
                </template>
                <template v-slot:additional>
                    <v-list-item link :to="'/requester/' + $client.get_current_user() +'/taskset'" exact>
                        <v-list-item-action-text class="accent--text">
                            <v-icon color="accent">mdi-cog</v-icon>
                            Manage Annotation Tasks
                        </v-list-item-action-text>
                    </v-list-item>
                </template>
            </PaginatedListPreview>

            <v-list>
                <v-list-item link :to="'/requester/' + $client.get_current_user() +'/feedback'">
                    <v-list-item-title >
                        Annotator Feedbacks
                        <v-icon>mdi-email-outline</v-icon>
                    </v-list-item-title>
                </v-list-item>
            </v-list>

        </v-navigation-drawer>
    </div>


</template>

<script>
    import PaginatedListPreview from "../../components/requester/PaginatedListPreview";
    import UserConfig from "../../components/requester/configs/UserConfig";
    export default {
        name: "RequesterSideMenu",
        components: {
            PaginatedListPreview, UserConfig
        },
        props:{
            // open: {
            //     type: Boolean,
            //     default: false
            // }
        },
        data: () => ({
            open: false,
            profile_dialog: false,
        }),
        methods:{
            logout(){
                this.$client.logout().then(
                    resp => {
                        window.localStorage.removeItem('auth_token');
                        // location.reload();
                        this.$router.push({ path: `/login` })
                    }
                ).catch(err => {
                    this.handle_axios_error(err);
                })
            }
        }
    }
</script>