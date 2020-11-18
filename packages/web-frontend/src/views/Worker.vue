<template>
  <div class="about">
    <h1>This is an about page</h1>
  </div>
</template>
<script>
  export default {
    name: 'Worker',
    data () {
      return {
        loading: false,
        data: [],
        error: null
      }
    },
    created () {
      // fetch the data when the view is created and the data is
      // already being observed
      this.fetchData()
    },
    watch: {
      // call again the method if the route changes
      '$route': 'fetchData'
    },
    methods: {
      fetchData () {
        this.error = this.post = null;
        this.loading = true;
        // replace `getPost` with your data fetching util / API wrapper
        this.$client.get_projects(this.$route.params.id)
                .then(data => {
                  this.loading = false;
                  this.data = data;
                })
                .catch(err => {
                  this.loading = false;
                  this.error = err.toString()
                });

      }
    }


  }

</script>