<template>
    <div>
<!--        <AlertNotification></AlertNotification>-->
        <notifications
                position="top center"
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
        <WorkAppBar></WorkAppBar>
        <div>
            <router-view></router-view>
        </div>

    </div>
</template>

<script>
    // @ is an alias to /src
    import AlertNotification from "../../components/AlertNotification";
    import WorkAppBar from "./WorkAppBar";

    export default {
        name: 'WorkApp',
        components: {
            // AlertNotification,
            WorkAppBar
        },
        data () {
            return {

            }
        },
    }
</script>
