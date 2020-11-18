<template>
    <span>
        <span v-if="annotation.type === 'multiple-choice'">{{value}}</span>
        <span v-if="annotation.type === 'text'">{{value}}</span>
        <span v-if="annotation.type === 'span-from-text'">{{value.surface}}</span>
        <span v-if="annotation.type === 'datetime'">{{value}}</span>
    </span>
</template>

<script>
    export default {
        name: 'SingleResultWrapper',
        props:{
            value: {
                validator: function (value) {
                    return true;
                }
            },
            annotation: {
                type: Object
            },
        },
    }
</script>