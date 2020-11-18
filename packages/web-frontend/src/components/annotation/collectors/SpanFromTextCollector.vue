<template>
    <div>
        <p>
            {{this.annotation.prompt}}
        </p>

        <div class="text-selector mb-4" v-on:mouseleave="invalidate_selection">
            <pre><span
                    v-for="(char, index) in context.text"
                    v-bind:key="char.index"
                    v-on:mousedown="mouse_down_on_text(index)"
                    v-on:mouseup="mouse_up_on_text(index)"
                    v-on:mouseenter="mouse_enter_on_text(index)"
                    v-on:dblclick="mouse_dblclick_on_text(index)"
                    class="noselect"
                    v-bind:style="{
                        color: text_color_at(index),
                        background: background_color_at(index),
                    }"
            >{{char}}<br v-if="char==='\n'"></span></pre>
        </div>

        <!--  Make sure there is NO space between the actual data and the span tag. Otherwise it will mess up the display format.-->
        <div v-if="selected_text !== ''">

            <v-btn
                class="error--text" text fab x-small
                v-on:click="clear_selection">
                x
            </v-btn>

            <span
                    v-if="status_messages.pass && !quiet"
                    class="success--text">(Saved) </span>
            Selected span is: <span style="text-decoration: underline">{{selected_text}}</span>
            <p class="error--text" v-for="(msg, idx) in status_messages.messages" :key="idx">
                {{msg}}
            </p>
        </div>

        <p v-else>
            Select a span using the above panel.
        </p>

    </div>
</template>

<script>
    import AnnotationSystemMixin from '../../../mixins/annotation_system';

    export default {
        name: "SpanFromTextCollector",
        data: () => ({
            selected_spans: [],
            selection: {
                state: "none",
                start: -1,
                end: -1,
                current: -1,
            },
            selected_locations : {},
        }),
        mixins:[
            AnnotationSystemMixin
        ],
        props: {
            annotation: {
                type: Object,
            },
            selected_background_color: {
                type: String,
                default: "yellow"
            },
            selecting_background_color:{
                type: String,
                default: "lightskyblue"
            },
            value: {
                type: [Object, Array]
            },
            status_messages: {
                type : Object
            },
            existing_values: {
              type: Array,
              default: function () {
                return []
              }
            },
            quiet: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            context(){
                return this.get_context_from_id(this.annotation.from_context);
            },

            selected_text(){

                let {start, end} = this.selection;

                if (start !== -1 && end === -1){
                    end = this.selection.current;
                }

                return this.context.text.substring(Math.min(start, end), Math.max(start, end));
            },
            local_value: {
                get(){
                    return this.value;
                },
                set(nv){
                    this.$emit("input", nv);
                }
            },
            pass_repeated_constraint(){
                if (this.annotation.repeated !== true){
                    return true;
                }
                let {min, max} = this.annotation;
                if (min === undefined) min = -1;
                if (max === undefined) max = Infinity;
                return this.value.length >= min && this.value.length <= max;
            },

        },
        methods: {
            onClick() {

            },
            invalidate_selection() {
                if (this.selection.state !== "none") {
                    this.clear_selection();
                    // this.evaluate_constraint();
                }
            },
            mouse_down_on_text(index) {
                this.selection.start = index;
                this.selection.state = "selecting";
            },

            mouse_up_on_text(index) {
                if (this.selection.state !== "selecting") {
                    return;
                }
                this.selection.end = index;
                this.selection.state = "none";
                let _start = Math.min(this.selection.start, this.selection.end);
                let _end = Math.max(this.selection.start, this.selection.end);

                if (_start === _end){
                    _start = -1;
                    _end = -1;
                }

                this.selection.start = _start;
                this.selection.end = _end;

                this.local_value = {
                    surface: this.context.text.substring(this.selection.start, this.selection.end),
                    start: this.selection.start,
                    end: this.selection.end,
                };

                // this.evaluate_constraint();
            },
            mouse_enter_on_text(index) {
                this.selection.current = index;
            },

            mouse_dblclick_on_text(index) {
                function shouldStop(char){
                    return char === " " || char === "." ||
                        char === "," || char === "?" ||
                        char === "'" || char === '"' ||
                        char === "!" || char === ";" ||
                        char === ":" || char === "\n"
                        ;
                }
                let end = this.context.text.length - 1;
                for (let i = index; i < this.context.text.length; i++){
                    if(shouldStop(this.context.text[i])){
                        end = i - 1;
                        break;
                    }
                }
                let start = 0;
                for (let i = index; i > 0; i--){
                    if(shouldStop(this.context.text[i])){
                        start = i + 1;
                        break;
                    }
                }
                this.selection.start = start;
                this.selection.end = end + 1;
                this.local_value = {
                    surface: this.context.text.substring(this.selection.start, this.selection.end),
                    start: this.selection.start,
                    end: this.selection.end,
                };

                // this.evaluate_constraint();

            },
            clear_selection() {
                this.selection.state = "none";
                this.selection.start = -1;
                this.selection.end = -1;
                this.selection.current = -1;
                this.local_value = {
                    surface: "",
                    start: this.selection.start,
                    end: this.selection.end,
                };
            },

            text_color_at(index) {
                return "black"
            },

            background_color_at(idx) {
                if (this.selection.state === "selecting") {
                    if ((idx >= Math.min(this.selection.current, this.selection.start)) && (idx <= Math.max(this.selection.current, this.selection.start))) {
                        return this.selecting_background_color;
                    }
                }
                if (this.selection.state === "none") {
                    if ((idx >= this.selection.start) && (idx < this.selection.end)) {
                        return this.selecting_background_color;
                    }
                }

                if (this.selected_locations[idx] === true){
                    return this.selected_background_color;
                }

                return undefined;
            },

            update_selected_locations(){
                this.selected_locations = {};
                for (let i = 0; i < this.existing_values.length; i++) {
                    const {start, end} = this.existing_values[i];
                    for (let j = start; j < end; j++) {
                        this.$set(this.selected_locations, j ,true);
                    }

                }
            }
        },
        watch:{
            value: function(){
                // this.evaluate_constraint();
                this.update_selected_locations()
            },
        }
    }
</script>

<style scoped>
    .noselect {
        -webkit-touch-callout: none; /* iOS Safari */
        -webkit-user-select: none; /* Safari */
        -khtml-user-select: none; /* Konqueror HTML */
        -moz-user-select: none; /* Old versions of Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
        user-select: none;
        /* Non-prefixed version, currently
                                       supported by Chrome, Opera and Firefox */
    }

    .text-selector span {
        cursor: text
    }
    .text-selector{
        border-style: solid;
        border-width: 1px;
        background-color: lightyellow;
    }
    pre{
        white-space: normal;
        word-wrap: break-word;
    }
    .pass-requirement{
        color: #42b983;
    }
    .miss-requirement{
        color: #b31d28;
    }

</style>
