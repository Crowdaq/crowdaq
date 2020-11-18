<template>
    <div>
        <div v-if="annotation.type === 'multiple-choice'">

        </div>

        <div v-if="annotation.type === 'text' && annotation.repeated !== true">

        </div>

        <div v-if="annotation.type === 'text' && annotation.repeated === true">

        </div>

        <div v-if="annotation.type === 'span-from-text' && annotation.repeated === true">

        </div>
    </div>
</template>

<script>
    export default {
        name: "AnnotationResultWrapper",
        props: {
            annotation: {
                type: Object
            },
            assignment: {
                type: Object
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