<template>
  <select v-if="assets" @change="changeFile($event)" class="file-chooser">
    <option v-if="alternateFile" value selected>{{ alternateFile }}</option>
    <option v-for="(asset, index) in assets" :key="`file-asset-${index}`" :value="asset">{{ asset }}</option>
  </select>
</template>

<script type="module">
export default {
  name: "FileChooser",
  props: {
    alternateFile: { type: String, default: undefined },
  },
  data() {
    return {
      assets: ["Enlighten", "ABC", "Numbers", "Hello"],
    };
  },
  methods: {
    async changeFile(event) {
      const fileName = event.target.value;
      const file = await import(`@/assets/${fileName}.txt?raw`)
      const blob = new Blob([file.default], { type: "text/plain" });
      const fileReader = new FileReader();
      fileReader.onload = this.onFileLoad;
      fileReader.readAsText(blob);
    },
    onFileLoad(progressEvent) {
      const fileData = progressEvent.target.result.replace(/\r/g, '');
      this.$emit("fileSelected", fileData, true);
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.changeFile({ target: { value: "Enlighten" } });
    });
  },
};
</script>

<style lang="css" scoped>
.file-chooser {
}
</style>
