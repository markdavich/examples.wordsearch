<template>
  <div class="note shadow">
    <div class="caption">{{ note.caption }}</div>
    <img v-if="src" class="picture shadow" :src="url" alt />
    <div class="foot">{{ note.foot }}</div>
  </div>
</template>

<script>
import { computed } from "vue";
export default {
  name: "ntok",
  props: ["note"],
  data() {
    return {
      url: "",
      src: true,
    };
  },
  watch: {
    note: {
      immediate: true,
      async handler(newValue) {
        if (newValue && newValue.file) {
          // Dynamically resolve the image path
          this.url = new URL(`../assets/images/${newValue.file}.jpg`, import.meta.url).href;
        } else {
          this.src = false; // Hide the image if no file is provided
        }
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