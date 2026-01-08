<template>
  <div class="ai-container">
    <div class="title">AI Provider</div>
    <div class="row">
      <AiSelector v-model="selectedProvider" :platform="platform" @change="onProviderChange" />
    </div>
  </div>
</template>

<script>
import AiSelector from "@/components/AiSelector.vue";

export default {
  name: "Ai",
  components: {
    AiSelector,
  },
  props: {
    modelValue: { type: String, default: "groq" },
    platform: { type: String, default: "cloudflare" },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      selectedProvider: this.modelValue,
    };
  },
  watch: {
    modelValue(newVal) {
      this.selectedProvider = newVal;
    },
  },
  methods: {
    onProviderChange(provider) {
      this.$emit("update:modelValue", provider);
    },
  },
};
</script>

<style lang="css" scoped>
.ai-container {
  border: solid var(--light-grey) 1px;
  border-radius: 3px;
  padding: calc(var(--padding) / 2);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background-color: var(--tile-background);
}

.title {
  font-size: 1.1em;
  font-weight: 500;
  margin-bottom: 5px;
}

.row {
  margin-top: 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
</style>
