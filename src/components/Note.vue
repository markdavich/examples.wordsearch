<template>
  <div class="note shadow">
    <div class="caption">{{ note.caption }}</div>
    <img v-if="src" class="picture shadow" :src="src" alt />
    <div class="foot">{{ note.foot }}</div>
  </div>
</template>

<script>
import Vue from "vue";
export default {
  name: "ntok",
  props: ["note"],
  data() {
    return {
      src: "",
    };
  },
  watch: {
    note: {
      immediate: true,
      handler(newValue) {
        const result = require(`@/assets/images/${newValue.file}.jpg`);
        this.src = result;
      },
    },
  },
};
</script>

<style lang="css" scoped>
.note {
  padding: var(--padding);
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  justify-items: center;
  align-items: center;
  width: 75%;
  border-radius: 10px;
}
.caption {
  font-size: 1.7em;
  text-align: center;
  font-weight: bold;
}
.picture {
  border-radius: 5px;
  width: 90%;
  height: auto;
}
.foot {
  font-size: 1.2em;
}
</style>