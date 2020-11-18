<template>
    <div>
        <div v-for="(msg, idx) in error_messages"
             :key="idx">
            <v-subheader
                    class="error--text"
                    v-if="show_all_error || idx === 0"
            >
                                    <span
                                            class="mr-2 text-decoration-underline"
                                            v-if="!show_all_error && idx === 0 && error_messages.length > 1"
                                            @click="show_all_error = true"> (see {{error_messages.length-1}} more {{ error_messages.length-1 === 1 ? 'error' : 'errors'}})</span>
                <span v-else-if="show_all_error && idx === 0"
                      class="mr-2"
                      @click="show_all_error = false">
<!--                    <v-icon small color="error">mdi-close</v-icon>-->
                    (See less)
                </span>
                <span>{{msg}}</span>
            </v-subheader>
        </div>
    </div>
</template>

<script>
    export default {
        name: "ExpandableEditorErrorMessages",
        props: {
            error_messages: Array
        },
        data: () => ({
            show_all_error: false
        })
    }
</script>
