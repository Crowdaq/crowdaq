<template>
    <div>
        <v-chip
            class="ma-2"
            label
            v-if="annotation.label"
        >
            {{annotation.label}}
        </v-chip>
        <v-icon>mdi-check-bold</v-icon> {{result}}
    </div>
</template>

<script>
    export default {
        name: "MultipleChoiceResult",
        props: {
            annotation: {
                type: Object
            },
            result: {
                type: String
            }
        },
        data: () => ({

        }),
        methods: {
            on_input(){

            }
        }
    }
</script>