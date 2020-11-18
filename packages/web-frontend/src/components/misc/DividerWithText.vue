<template>
    <hr class="divider-with-title" :data-content="title">
</template>

<script>
    export default {
        name: "Divider",
        props: {
            title: {
                type: String,
                default: ""
            }
        }
    }
</script>

<style scoped>
    .divider-with-title{
        line-height: 1em;
        position: relative;
        outline: 0;
        border: 0;
        color: black;
        text-align: center;
        height: 1.5em;
        opacity: .5;
    }

    .divider-with-title:before {
        content: '';
        background: linear-gradient(to right, transparent, #818078, transparent);
        position: absolute;
        left: 0;
        top: 50%;
        width: 100%;
        height: 1px;
    }
    .divider-with-title:after {
        content: attr(data-content);
        position: relative;
        display: inline-block;
        color: black;
        padding: 0 0.5em;
        line-height: 1.5em;
        color: #818078;
        background-color: #fcfcfa;
    }
</style>