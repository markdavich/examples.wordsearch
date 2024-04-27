<template>
  <div class="file-input">
    <div class="title">{{ label }}</div>
    <div class="row">
      <input ref="fileInput" @input="fileInput($event)" type="file" accept="text/plain" />
      <FileChooser :alternateFile="alternateFile" @fileSelected="fileSelected" />
    </div>
  </div>
</template>

<script>
import FileChooser from "@/components/FileChooser.vue";
export default {
  name: "FileInput",
  components: {
    FileChooser,
  },
  data() {
    return {
      file: "",
      alternateFile: undefined,
    };
  },
  props: {
    label: { type: String, default: "Choose File" },
  },
  methods: {
    fileInput(event) {
      const file = event.target.files[0];
      const fileReader = new FileReader();
      this.alternateFile = file.name;
      fileReader.onload = function (progressEvent) {
        this.fileSelected(progressEvent.target.result, false);
      }.bind(this);
      fileReader.readAsText(file);
    },
    fileSelected(file, resetFileInput) {
      if (resetFileInput) {
        this.alternateFile = undefined;
        const input = this.$refs.fileInput;
        input.type = "text";
        input.type = "file";
      }
      this.$emit("fileSelected", file);
    },
  },
};
</script>

<style lang="css" scoped>
.file-input {
  border: solid var(--light-grey) 1px;
  border-radius: 3px;
  padding: calc(var(--padding) / 2);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background-color: var(--tile-background);
}

title {
  font-size: 1.5em;
  margin-bottom: 15px;
}

.row {
  margin-top: 10px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
</style>
