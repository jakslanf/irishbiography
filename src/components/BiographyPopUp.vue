<template>
  <div class="popup">
    <div class="popup-inner">
      <slot/>
      <button @click="() => close()" class="popup-close">Close Popup</button>
    </div>
  </div>
</template>
<!-- https://www.youtube.com/watch?v=HorXomQrOi8 -->
<script>
export default {
  name: "BiographyPopUp",
  methods: {
    close() {
      this.$emit('close');
    }
  }

}
</script>

<style lang="scss" scoped>
.popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
  background-color: rgba(0, 0, 0, 0.2);

  display: flex;
  align-items: center;
  justify-content: center;

  .popup-inner {
    background: #ffffff;
    color: black;
    padding: 32px;
  }
}
</style>