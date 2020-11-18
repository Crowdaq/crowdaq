<template>
    <div v-if="display_alert_message">
        <p
                class="pa-3 mb-1"
                v-bind:class="{
                    'error-background': msg.type === 'error',
                    'success-background': msg.type === 'success',
                }"
                v-for="(msg, idx) in alert_messages"
                :key="idx"
        >
            <v-btn icon v-on:click="pop_message(idx)">
                <v-icon color="white">mdi-close</v-icon>
            </v-btn>
            {{msg.message}}
        </p>
    </div>
</template>

<script>
    export default {
        name: 'AlertNotification',
        data () {
            return {

            }
        },
        computed: {
            alert_messages(){
                return this.$store.getters['alerts/get_alert_messages']
            },
            display_alert_message(){
                return this.$store.getters['alerts/has_alert_messages']
            },
        },
        methods:{
            pop_message(idx){
                this.$store.commit('alerts/remove_message', {idx});
            }
        }
    }
</script>
<style>
    .error-background{
        color: white;
        background-color: #f44336
    }

    .success-background{
        color: white;
        background-color: #42b983;
    }
</style>