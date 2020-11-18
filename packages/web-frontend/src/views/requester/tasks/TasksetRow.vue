<template>
    <div style="display: contents">
        <tr>
            <td>{{ task.id }}</td>
            <td>
                {{ task.finished_assignment_count }}
                <v-btn icon color="success" @click="expand_task(task.id)">
                    <v-icon>mdi-eye</v-icon>
                </v-btn>
            </td>
            <td>
                <v-btn outlined :to="`/w/task/${$route.params.owner}/${$route.params.taskset_id}/${task.id}`" color="info" target="_blank" class="mr-3">
                    <v-icon>mdi-play</v-icon> Annotate
                </v-btn>

                <v-btn icon :to="`${$route.params.taskset_id}/task/${task.id}`" color="info">
                    <v-icon>mdi-pencil</v-icon>
                </v-btn>

                <v-btn icon color="error" @click="delete_task(task.id)">
                    <v-icon>mdi-delete</v-icon>
                </v-btn>
            </td>
        </tr>

        <tr v-if="show_assignments">

        </tr>
    </div>
</template>

<script>
    export default {
        name: "TasksetRow",
        props:{
            task: Object,
        },
        data: () => ({
            show_assignments: false,
        }),
        methods: {
            delete_task(){
                this.$emit("delete", {});
            },
            expand_task(){

            },
        }
    }
</script>