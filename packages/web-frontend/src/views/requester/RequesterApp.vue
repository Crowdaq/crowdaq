<template>
    <div>
        <notifications
                position="top center"
        >
            <template slot="body" slot-scope="props">
                <v-alert
                        dense
                        colored-border
                        border="left"
                        elevation="10"
                        :color="props.item.type"
                >
                    <h3 class="subtitle-1">{{props.item.title}}</h3>
                    <v-icon @click="props.close">mdi-close</v-icon>
                    {{props.item.text}}
                </v-alert>
            </template>
        </notifications>

        <RequesterSideMenu></RequesterSideMenu>

        <div>
            <router-view></router-view>
        </div>
    </div>
</template>

<script>
    // @ is an alias to /src
    import AlertNotification from "../../components/AlertNotification";
    import RequesterSideMenu from "./RequesterSideMenu";
    export default {
        name: 'RequesterView',
        components: {
            RequesterSideMenu
        },

    }
</script>

<style>
</style>
