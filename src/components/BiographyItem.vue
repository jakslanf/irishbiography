<template>
  <div>
    <img :src=displayphoto width="200" height="200">
    <div>{{ fullName.replace(/[{()}]/g, '') }}</div>
  </div>
</template>

<script>
export default {
  props: {
    fullName: String, photo: String, wikiEntity: String, vtUri: String, dibUri: String
  },
  data() {
    return {
      name: "BiographyItem",
      displayphoto: "src/assets/no_img.png"
    }
  },
  created() {
    if (this.photo === "") {
    } else {
      this.displayphoto = this.photo
    }
    console.log(this.fullName)
  }
}

</script>

<style scoped>

</style>