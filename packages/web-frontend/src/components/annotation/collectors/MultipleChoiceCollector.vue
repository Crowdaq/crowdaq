<template>
    <div>
        <p>
            {{this.annotation.prompt}}
        </p>

        <div v-if="this.annotation.style === 'select'">
            <v-select
                    :items="select_style_items"
                    outlined
                    dense
                    prepend-icon="mdi-card-text-outline"
                    :hint="hint_value"
                    item-text="label"
                    item-value="value"
                    v-model="current_value"

            ></v-select>
        </div>

        <div v-else>

            <v-radio-group
                v-model="current_value"
            >
                <v-radio
                        v-for="(ans, idx) in annotation.options"
                        :key="idx"
                        :label="ans"
                        :value="idx"
                ></v-radio>
            </v-radio-group>
        </div>

    </div>
</template>

<script>

    export default {
        name: "MCCollector",
        mixins:[

        ],
        props: {
            value: String,
            annotation: {
                type: Object
            }
        },

        data: () => ({
        }),
        computed: {
            hint_value(){
                if (this.value === ''){
                    return ''
                }else{
                    return `${this.current_value}: ${this.annotation.options[this.current_value]}`
                }
            },
            select_style_items(){
                let ret = [];

                for (let k in this.annotation.options){
                    const opt = this.annotation.options[k];
                    ret.push({
                        label: opt,
                        value: k,
                    })
                }

                return ret;
            },


            current_value: {
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
        methods: {
        }
    }
</script>