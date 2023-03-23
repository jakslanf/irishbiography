<template>
  <div class="popup">
    <div class="popup-inner">
      <slot name="header"/>
      <br/>
      <button @click="() => view('approved')" class="popup-tab">Approved</button>
      <button @click="() => view('treasury')" class="popup-tab">Virtual Treasury</button>
      <button @click="() => view('wikidata')" class="popup-tab">WikiData</button>
      <div v-if="tab=='approved'">
        <p>Click on the Virtual Treasury and WikiData tabs to approve facts</p>
        <p>Approved facts will then appear here on this page!</p>
      </div>
      <div v-if="tab=='treasury'">
        <slot name="treasury"/>
      </div>
      <div v-if="tab=='wikidata'">
        <slot name="wikidata"/>
      </div>
      <br/>
      <button @click="() => close()" class="popup-close">Close Popup</button>
    </div>
  </div>
</template>
<!-- https://www.youtube.com/watch?v=HorXomQrOi8 -->
<script>
export default {
  name: "BiographyPopUp",
  data() {
    return {
      tab: 'approved'
    }
  },
  methods: {
    close() {
      this.$emit('close');
    },
    view(string) {
      this.tab = string
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