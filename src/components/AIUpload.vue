<template>
  <div class="ai-upload">
    <div class="title">AI Upload</div>
    <div class="row">
      <button
        class="ai-upload-btn"
        @click="triggerFileInput"
        :disabled="isLoading"
        :class="{ loading: isLoading }"
      >
        <span v-if="!isLoading">Upload Image</span>
        <span v-else>Processing...</span>
      </button>

      <PlatformSelector v-model="selectedPlatform" />

      <input
        ref="fileInput"
        type="file"
        :accept="acceptedTypes"
        @change="handleFileSelect"
        style="display: none"
      />
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script>
import PlatformSelector from "@/components/PlatformSelector.vue";
import { parsePuzzleWithAI, isSupportedForAIParsing } from "@/services/puzzle-parser-api.js";

export default {
  name: "AIUpload",
  components: {
    PlatformSelector,
  },
  props: {
    aiProvider: { type: String, default: "gemini" },
  },
  data() {
    return {
      isLoading: false,
      error: null,
      selectedPlatform: "cloudflare",
      // Accept images and PDFs
      acceptedTypes: "image/png,image/jpeg,image/jpg,image/webp,image/gif,application/pdf",
    };
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click();
    },

    async handleFileSelect(event) {
      const file = event.target.files[0];
      if (!file) return;

      // Reset state
      this.error = null;
      this.isLoading = true;

      try {
        // Validate file type
        if (!isSupportedForAIParsing(file)) {
          throw new Error(
            "Unsupported file type. Please upload an image (PNG, JPG, WebP, GIF) or PDF."
          );
        }

        // Check file size (limit to 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          throw new Error("File is too large. Please upload a file smaller than 10MB.");
        }

        // Call the AI API with selected platform and AI provider
        const result = await parsePuzzleWithAI(file, {
          platform: this.selectedPlatform,
          aiProvider: this.aiProvider,
        });

        if (result.success) {
          // Emit the parsed puzzle data
          this.$emit("puzzleParsed", result.puzzleData);
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        this.error = err.message || "An error occurred while processing the file.";
      } finally {
        this.isLoading = false;
        // Reset the file input so the same file can be selected again
        event.target.value = "";
      }
    },
  },
};
</script>

<style lang="css" scoped>
.ai-upload {
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

.ai-upload-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  font-weight: 500;
  transition: all 0.2s ease;
}

.ai-upload-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.ai-upload-btn:active:not(:disabled) {
  transform: translateY(0);
}

.ai-upload-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.ai-upload-btn.loading {
  background: linear-gradient(135deg, #a0a0a0 0%, #808080 100%);
}

.error-message {
  margin-top: 8px;
  padding: 8px 12px;
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 4px;
  color: #dc2626;
  font-size: 0.875em;
  max-width: 300px;
}
</style>
