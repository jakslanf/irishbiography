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
      const response = await axios.get(`http://localhost:9999/bigdata/sparql?s=<https://kb.virtualtreasury.ie/person/Synnott_Nicholas-Joseph_c20_dib_a8431>`)
      this.posts = response.data
    } catch (e) {
      this.errors.push(e)
    }
  }
}
</script>

<style scoped>

</style>