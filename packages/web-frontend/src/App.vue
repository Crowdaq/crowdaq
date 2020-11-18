<template>
  <v-app>
<!--    <v-app-bar-->
<!--            app-->
<!--            color="white"-->
<!--    >-->
<!--&lt;!&ndash;      <v-app-bar-nav-icon @click="drawer = !drawer" />&ndash;&gt;-->
<!--&lt;!&ndash;      <v-btn&ndash;&gt;-->
<!--&lt;!&ndash;              v-on:click="go_to_url('/')"&ndash;&gt;-->
<!--&lt;!&ndash;              text&ndash;&gt;-->
<!--&lt;!&ndash;      >&ndash;&gt;-->
<!--&lt;!&ndash;        <v-icon>mdi-open-in-new</v-icon>&ndash;&gt;-->
<!--        <span class="mr-2"></span>-->
<!--&lt;!&ndash;      </v-btn>&ndash;&gt;-->
<!--      <v-spacer />-->
<!--    </v-app-bar>-->

<!--    <v-navigation-drawer-->
<!--            class="accent-4"-->
<!--            v-model="drawer"-->
<!--            dark-->
<!--            absolute-->
<!--            temporary-->
<!--    >-->
<!--      <v-list>-->
<!--        <v-list-item-->
<!--                v-for="item in items"-->
<!--                :key="item.title"-->
<!--                link-->
<!--        >-->
<!--          <v-list-item-content>-->
<!--            <v-list-item-title v-on:click="go_to_url(item.link)">{{ item.title }}</v-list-item-title>-->
<!--          </v-list-item-content>-->
<!--        </v-list-item>-->
<!--      </v-list>-->
<!--    </v-navigation-drawer>-->

    <v-main>
      <router-view></router-view>
    </v-main>

  </v-app>
</template>

<script>
  // @ is an alias to /src

  export default {
    name: 'Home',
    components: {

    },
    methods: {
      go_to_url(path){
        const route = {path};
        this.$router.push(route);
      }
    },
    data () {
      return {
        drawer: false,
        items: [
          { title: 'Projects', icon: 'dashboard' , link: "/projects"},
          { title: 'Workers', icon: 'account_box' , link: "/workers"},
        ],
      }
    },

  }
</script>
