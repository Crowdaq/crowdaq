<template>
    <v-card>
        <v-card-text>
            <slot name="header"></slot>

            <v-divider class="mb-4 mt-4"/>

            <div v-for="(item, index) in items" :key="index">
                <slot name="item" :item="item"></slot>
            </div>
        </v-card-text>

        <div class="text-center">
            <v-pagination
                    v-show="total_page > 1"
                    v-model="current_page"
                    :length="total_page"
            ></v-pagination>
        </div>


    </v-card>
</template>

<script>
    export default {
        name: "PaginatedTable",
        props: {
            op: String,
            filter_arg: Object,
            refresh_signal:Number,
            page_size: {
                type: Number,
                default: 20
            }
        },
        data: () => ({
            items: [],
            current_page:1,
            total_page:1
        }),
        methods: {
            update_items(){
                this.$client.make_request(this.op, {
                    ...this.filter_arg, page_option: {
                        page: this.current_page,
                        page_size: this.page_size,
                    }
                }).then(resp => {
                    console.log(resp);
                    this.total_page = Math.ceil(resp.data.estimated_item_count / this.page_size);
                    this.items = resp.data.payload;
                }).catch(err => {

                })
            },
        },
        mounted() {
            this.update_items();
        },
        watch:{
            current_page: function(){
                this.update_items();
            },
            refresh_signal: function(){
                if (this.refresh_signal > 0){
                    this.update_items();
                }
            },
            filter_arg: function(){
                this.update_items();
            }
        }
    }
</script>