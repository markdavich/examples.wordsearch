<template>
  <select @change="onChange($event)" class="ai-selector" :value="modelValue">
    <option
      v-for="provider in providers"
      :key="provider.id"
      :value="provider.id"
    >
      {{ provider.name }}
    </option>
  </select>
</template>

<script>
export default {
  name: "AiSelector",
  props: {
    modelValue: { type: String, default: "gemini" },
  },
  emits: ["update:modelValue", "change"],
  data() {
    return {
      providers: [
        { id: "gemini", name: "Google Gemini" },
        { id: "groq", name: "Groq (Llama 4)" },
        // Future AI providers can be added here:
        // { id: "openai", name: "OpenAI GPT-4" },
        // { id: "claude", name: "Anthropic Claude" },
      ],
    };
  },
  methods: {
    onChange(event) {
      const value = event.target.value;
      this.$emit("update:modelValue", value);
      this.$emit("change", value);
    },
  },
};
</script>

<style lang="css" scoped>
.ai-selector {
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid var(--light-grey);
  background-color: white;
  cursor: pointer;
}
</style>
