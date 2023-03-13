<template>

</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      posts: [],
      errors: []
    }
  },

  // Fetches posts when the component is created.
  async created() {
    try {
      console.log("zowee")
      const response = await axios.post(
          'http://localhost:80/blazegraph/namespace/BeyondSample/sparql/',
          new URLSearchParams({
            'query': 'SELECT * { ?s ?p ?o } LIMIT 1'
          }),
          {
            headers: {
              'Accept': 'application/json'
            }
          }
      );
      this.posts = response.data
      console.log("wowee")
    } catch (e) {
      this.errors.push(e)
    }
  }
}
</script>

<style scoped>

</style>