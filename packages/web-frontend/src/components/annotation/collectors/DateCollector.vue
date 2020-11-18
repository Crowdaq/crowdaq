<template>
    <div>
        <p>{{annotation.prompt}}</p>

        <v-row>
            <v-col cols="12" md="4">
                <v-select
                        :items="selected_granularities"
                        label="Time Scale"
                        v-model="granularity"
                ></v-select>
            </v-col>

            <v-col cols="12" md="4">
                <v-text-field
                    v-if="granularity==='year'"
                    v-model="date"
                    label="Year (e.g. 2020)"
                    :error-messages="date_error"
                    :error="date_error !== ''"
                ></v-text-field>

                <v-menu
                        v-else
                        v-model="date_menu"
                        :close-on-content-click="false"
                        :nudge-right="40"
                        transition="scale-transition"
                        offset-y
                        min-width="290px"
                >
                    <template v-slot:activator="{ on }">
                        <v-text-field
                                v-model="date"
                                prepend-icon="mdi-calendar"
                                label="Select Date"
                                readonly
                                v-on="on"
                        ></v-text-field>
                    </template>
                    <v-date-picker v-if="granularity==='month'"
                                   type="month" v-model="date" @input="date_menu = false"></v-date-picker>
                    <v-date-picker v-else v-model="date"
                                   @input="date_menu = false"></v-date-picker>
                </v-menu>
            </v-col>

            <v-col cols="12" md="4">
                <v-text-field
                        v-if="granularity==='hour' || granularity==='minute' || granularity==='second'"
                        label="Write Time"
                        :hint="time_placeholder"
                        :placeholder="time_placeholder"
                        v-model="time"
                        outlined
                        :error-messages="time_error"
                        :error="time_error !== ''"
                ></v-text-field>
            </v-col>


        </v-row>

    </div>
</template>

<script>
    import * as moment from 'moment';

    export default {
        name: "DatetimeCollector",
        mixins:[

        ],
        props: {
            value: {
                type: Object
            },
            annotation: {
                type: Object
            },
        },
        data: () => ({
            date_menu: false,
            time_menu: false,
            granularities: ['year', 'month', 'day', 'hour', 'minute', 'second'],

            granularity: 'day',
            date: '',
            time: undefined,

            time_error: "Select a time",
            date_error: "Select a date",

        }),
        watch:{
            granularity: function(){
                this.date = moment().format("YYYY-MM-DD");
                this.time = '';
            },
            date: function(){
                this.date_error = "";

                if (this.granularity === 'year'){
                    let d = moment(this.date, "YYYY", true);
                    if (!d.isValid()){
                        this.date_error = "Wrong time format, Correct format is YYYY. e.g. 2020";
                    }
                }

                this.emit_results();
            },
            time: function(){
                let d;
                this.time_error = "";

                if (this.granularity === 'hour'){
                    d = moment(this.time, "HH", true);
                    if (!d.isValid()){
                        this.time_error = "Wrong time format, Correct format is " + this.time_placeholder;
                    }
                }

                if (this.granularity === 'minute'){
                    d = moment(this.time, "HH:mm", true);
                    if (!d.isValid()){
                        this.time_error = "Wrong time format, Correct format is " + this.time_placeholder;
                    }
                }

                if (this.granularity === 'second'){
                    d = moment(this.time, "HH:mm:ss", true);
                    if (!d.isValid()){
                        this.time_error = "Wrong time format, Correct format is " + this.time_placeholder;
                    }
                }
                this.emit_results();
            },
        },
        computed: {
            selected_granularities(){
                if(this.annotation.granularities === undefined || this.annotation.granularities === null || this.annotation.granularities === ''){
                    return this.granularities
                }
                return this.granularities.filter(x => this.annotation.granularities.includes(x))
            },

            time_placeholder(){
                if(this.granularity === 'hour'){
                    return "HH (24 hours, e.g. 01 or 18)"
                }

                if(this.granularity === 'minute'){
                    return "HH:MM (24 hours, e.g. 18:36 or 01:59)"
                }

                if(this.granularity === 'second'){
                    return "HH:MM:SS (24 hours, e.g. 18:36:57 or 01:59:11)"
                }

                return "";
            },
        },
        methods: {
            emit_results(){

                if (this.granularity === 'hour' || this.granularity === 'minute' || this.granularity === 'second'){
                        this.$emit('input', {
                            granularity: this.granularity,
                            value: `${this.date} ${this.time}`
                        })
                }

                if (this.granularity === 'year' || this.granularity === 'month' || this.granularity === 'day'){
                    this.$emit('input', {
                        granularity: this.granularity,
                        value: `${this.date}`
                    })
                }
            }
        }
    }
</script>