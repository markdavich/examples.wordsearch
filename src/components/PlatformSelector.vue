<template>
  <select @change="onChange($event)" class="platform-selector" :value="modelValue">
    <option
      v-for="platform in platforms"
      :key="platform.id"
      :value="platform.id"
    >
      {{ platform.name }}
    </option>
  </select>
</template>

<script>
export default {
  name: "PlatformSelector",
  props: {
    modelValue: { type: String, default: "cloudflare" },
  },
  emits: ["update:modelValue", "change"],
  data() {
    return {
      platforms: [
        { id: "cloudflare", name: "Cloudflare Workers" },
        { id: "vercel", name: "Vercel" },
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
.platform-selector {
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid var(--light-grey);
  background-color: white;
  cursor: pointer;
}
</style>
