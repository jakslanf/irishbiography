<template>
  <div>
    <img :src=photo width="200" height="200">
    <pre>{{fullName}}</pre>
  </div>
</template>

<script>
export default {
  props: {
    fullName: String, photo: String, wikiEntity: String, vtUri: String, dibUri: String
  },
  data() {
    return {
      name: "BiographyItem"
    }
}}
</script>

<style scoped>

</style>