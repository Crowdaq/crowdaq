<template>
    <div>
        <p>{{annotation.prompt}}</p>
        <v-textarea
                rows="1"
                placeholder="Put your response here"
                auto-grow
                outlined
                dense
                prepend-icon="mdi-card-text-outline"
                v-model="current_text"
                :error="!status_messages.pass && value !== ''"
                :error-messages="status_messages.messages"
                :success-messages="(status_messages.pass && !quiet && value !== '') ? 'Saved' : undefined"
                :success="status_messages.pass && !quiet && value !== ''"
        ></v-textarea>
    </div>
</template>

<script>

    export default {
        name: "TextCollector",
        mixins:[

        ],
        data: () => ({
        }),
        props: {
            annotation: Object,
            status_messages: {
                type : Object
            },
            value: String,
            quiet: {
                type: Boolean,
                default: false
            }
        },
        methods: {

        },
        computed: {
            current_text: {
                get(){
                    return this.value;
                },
                set(nv){
                    this.$emit("input", nv);
                }
            }
        },

        mounted() {

        },

        watch:{
            value: function(){

            }
        },
    }
</script>

<style scoped>
</style>