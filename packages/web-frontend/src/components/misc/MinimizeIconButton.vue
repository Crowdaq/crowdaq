<template>
    <span>
            <v-icon v-on:click="on_click">{{value ? "mdi-eye-outline" : "mdi-eye-off-outline"}}</v-icon>
    </span>
</template>

<script>
    export default {
        name: "MinimizeIconButton",
        props: {
            value: {
                type: Boolean
            }
        },
        methods: {
            on_click(){
                this.$emit("input", !this.value)
            }
        }
    }
</script>