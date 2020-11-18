<template>
    <div>
        <div v-if="validation.valid">

            <v-card v-if="type === 'instruction'">
                <InstructionWrapper :definition="definition"></InstructionWrapper>
            </v-card>

            <v-card v-else-if="type === 'tutorial'">
                <TutorialWrapper :definition="definition"></TutorialWrapper>
            </v-card>

            <v-card v-else-if="type === 'exam'">

            </v-card>

            <v-card v-else-if="type === 'annotation_task'">
                <SingleTaskAnnotationInterface
                        :annotation_groups="definition.annotation_groups"
                        :contexts="definition.contexts"
                        v-on:submit="submit_annotation_task"
                ></SingleTaskAnnotationInterface>
            </v-card>

        </div>

        <div v-else>
            Definition is not valid. {{validation.message}}
        </div>
    </div>
</template>
<script>

    import InstructionWrapper from "./instruction/InstructionWrapper";
    import TutorialWrapper from "./tutorial/TutorialWrapper";
    import _ from "lodash"

    export default {
        name: "CrowdaqObjectDisplayWrapper",
        components: {
            TutorialWrapper,
            InstructionWrapper
        },
        props: {
            type: String,
            definition: {
                validate(){
                    return true;
                }
            },
        },
        data: () => ({
            validation: {
                message: "",
                valid: true,
            }
        }),
        methods: {
            submit_annotation_task(){

            },
            validate: _.debounce(() => {
                if (this.type === "tutorial") {
                    this.validation.valid = this.$schema_validator.validate_tutorial(this.definition).valid;
                }

                if (this.type === "exam") {
                    this.validation.valid = this.$schema_validator.validate_tutorial(this.definition).valid;
                }

                if (this.type === "annotation_task") {
                    this.validation.valid = this.$schema_validator.validate_tutorial(this.definition).valid;
                }
            }, 100)
        },
        mounted() {

        },
        watch: {
            definition: function(){
                this.validate();
            }
        },
    }
</script>