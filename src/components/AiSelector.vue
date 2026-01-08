<template>
  <select @change="onChange($event)" class="ai-selector" :value="modelValue">
    <option
      v-for="provider in filteredProviders"
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
    modelValue: { type: String, default: "groq" },
    platform: { type: String, default: "cloudflare" },
  },
  emits: ["update:modelValue", "change"],
  data() {
    return {
      providers: [
        { id: "groq", name: "Groq (Llama 4)" },
        { id: "together", name: "Together AI (Llama Vision)" },
        { id: "cloudflare-ai", name: "Cloudflare AI (LLaVA)", platforms: ["cloudflare"] },
        { id: "gemini", name: "Google Gemini" },
        // Future AI providers can be added here:
        // { id: "openai", name: "OpenAI GPT-4" },
        // { id: "claude", name: "Anthropic Claude" },
      ],
    };
  },
  computed: {
    filteredProviders() {
      return this.providers.filter(provider => {
        // If no platform restriction, available on all platforms
        if (!provider.platforms) return true;
        // Check if the provider is available on the specified platform
        return provider.platforms.includes(this.platform);
      });
    },
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
