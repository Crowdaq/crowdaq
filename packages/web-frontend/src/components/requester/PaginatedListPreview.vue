<template>
    <div>

        <v-list :nav="nav">
            <v-list-item :class="{
                'v-list-item--active' : $route.path === to,
                'v-list-item--link': $route.path === to
            }">
                <v-list-item-content class="sidebar-item-title" @click="goToLink">
                    <v-list-item-title class="title">
<!--                        <router-link :to="to" v-if="to" :link="false" class="white&#45;&#45;text sidebar-link">-->
<!--                            {{name}}-->
<!--                        </router-link>-->
<!--                        <span class="white&#45;&#45;text" v-else>{{name}}</span>-->
                        {{name}}
                    </v-list-item-title>
                </v-list-item-content>

                <v-list-item-action>
                    <v-icon v-if="!expanded" @click="update_items">mdi-arrow-right-circle-outline</v-icon>
                    <v-icon v-else @click="update_items">mdi-arrow-down-circle-outline</v-icon>
                </v-list-item-action>
            </v-list-item>
        </v-list>


        <v-list v-if="expanded">
                <div v-for="(item, index) in items" :key="index">
                    <slot :item=item name="content"></slot>
                </div>
                <slot name="additional"></slot>
        </v-list>
    </div>
</template>

<script>
    export default {
        name: "PaginatedListPreview",
        props: {
            name: String,
            to: {
                type: String,
                default: ""
            },

            nav: Boolean,

            op: String,
            filter_arg: Object,

            page_size: {
                type: Number,
                default: 5
            }
        },
        data: () => ({
            selected: "",
            items: [],
            current_page: 1,
            total_page: 1,
            expanded: false,
            loaded: false
        }),
        methods: {
            goToLink(){
                if (this.to){
                    this.$router.push(this.to);
                }
            },
            update_items() {
                if (this.loaded){
                    this.expanded = !this.expanded;
                }else{
                    this.expanded = !this.expanded;
                    this.$client.make_request(this.op, {
                        ...this.filter_arg, page_option: {
                            page: this.current_page,
                            page_size: this.page_size,
                        }
                    }).then(resp => {
                        this.total_page = Math.ceil(resp.data.estimated_item_count / this.page_size);
                        this.items = resp.data.payload;
                        this.expanded = true;
                        this.loaded = true;
                    }).catch(err => {
                        console.log(err);
                    })
                }
            },
        }
    }
</script>

<style>
    .sidebar-link{
        text-decoration: none;
    }
    .sidebar-item-title{
        cursor: pointer;
    }
</style>