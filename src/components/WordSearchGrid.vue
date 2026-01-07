<template>
  <div class="grid-container" ref="gridContainer">
    <div class="word-search-grid shadow" ref="gridElement">
      <div class="row" v-for="(row, rIndex) in letters" :key="`wsg-row-${rIndex}`">
        <div
          class="letter"
          v-for="(letter, lIndex) in row"
          :key="`wsg-column-${lIndex}`"
          :class="{
            highlighted: getCellColor(rIndex, lIndex),
            elevated: isCellElevated(rIndex, lIndex)
          }"
          :style="getCellStyle(rIndex, lIndex)"
          ref="cellRefs"
        >
          {{ letter }}
        </div>
      </div>
    </div>
    <!-- SVG overlay for circles -->
    <svg
      v-if="circles.length > 0"
      class="circles-overlay"
      :width="svgWidth"
      :height="svgHeight"
    >
      <path
        v-for="circle in sortedCircles"
        :key="circle.answer"
        :d="getStadiumPath(circle)"
        :stroke="circle.color"
        :stroke-width="circle.answer === hoveredCircle ? 5 : 3"
        :fill="circle.answer === hoveredCircle ? circle.color : 'none'"
        :fill-opacity="circle.answer === hoveredCircle ? 0.3 : 0"
        class="answer-circle"
        :class="{ hovered: circle.answer === hoveredCircle }"
        @mouseenter="emit('circleHover', circle.answer)"
        @mouseleave="emit('circleHover', null)"
      />
    </svg>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';

const props = defineProps({
  letters: { type: Array, required: true },
  highlightedCells: { type: Array, default: () => [] },
  circles: { type: Array, default: () => [] },
  hoveredCircle: { type: String, default: null },
});

const emit = defineEmits(['circleHover']);

// Sort circles so hovered one is last (renders on top in SVG)
const sortedCircles = computed(() => {
  if (!props.hoveredCircle) return props.circles;

  const others = props.circles.filter(c => c.answer !== props.hoveredCircle);
  const hovered = props.circles.find(c => c.answer === props.hoveredCircle);

  return hovered ? [...others, hovered] : props.circles;
});

const gridContainer = ref(null);
const gridElement = ref(null);
const cellRefs = ref([]);
const cellSize = ref(0);
const svgWidth = ref(0);
const svgHeight = ref(0);

function getCellColor(row, col) {
  const cell = props.highlightedCells.find(c => c.row === row && c.col === col);
  return cell ? cell.color : null;
}

// Check if a cell is part of the hovered circle (to elevate it above SVG)
function isCellElevated(row, col) {
  if (!props.hoveredCircle) return false;

  const circle = props.circles.find(c => c.answer === props.hoveredCircle);
  if (!circle) return false;

  // Calculate all cells along the line from start to end
  const { startRow, startCol, endRow, endCol } = circle;
  const rowStep = endRow === startRow ? 0 : (endRow > startRow ? 1 : -1);
  const colStep = endCol === startCol ? 0 : (endCol > startCol ? 1 : -1);

  let r = startRow;
  let c = startCol;

  while (true) {
    if (r === row && c === col) return true;
    if (r === endRow && c === endCol) break;
    r += rowStep;
    c += colStep;
  }

  return false;
}

function getCellStyle(row, col) {
  const color = getCellColor(row, col);
  if (color) {
    return { backgroundColor: color };
  }
  return {};
}

function updateDimensions() {
  if (gridElement.value && props.letters.length > 0) {
    const gridRect = gridElement.value.getBoundingClientRect();
    svgWidth.value = gridRect.width;
    svgHeight.value = gridRect.height;

    // Calculate cell size from grid dimensions
    const cols = props.letters[0]?.length || 1;
    const rows = props.letters.length || 1;
    cellSize.value = gridRect.width / cols;
  }
}

function getStadiumPath(circle) {
  // Get center points of start and end cells
  const startX = (circle.startCol + 0.5) * cellSize.value;
  const startY = (circle.startRow + 0.5) * cellSize.value;
  const endX = (circle.endCol + 0.5) * cellSize.value;
  const endY = (circle.endRow + 0.5) * cellSize.value;

  // Calculate the angle of the word
  const dx = endX - startX;
  const dy = endY - startY;
  const angle = Math.atan2(dy, dx);

  // Radius for the semicircle ends (half cell height with padding)
  const r = cellSize.value * 0.45;

  // Perpendicular offset for the parallel lines
  const perpX = Math.sin(angle) * r;
  const perpY = -Math.cos(angle) * r;

  // Extend start and end points outward by a small amount for padding
  const padding = cellSize.value * 0.08;
  const extendX = Math.cos(angle) * padding;
  const extendY = Math.sin(angle) * padding;

  const sx = startX - extendX;
  const sy = startY - extendY;
  const ex = endX + extendX;
  const ey = endY + extendY;

  // Four corners of the stadium (two parallel lines)
  const topStartX = sx + perpX;
  const topStartY = sy + perpY;
  const topEndX = ex + perpX;
  const topEndY = ey + perpY;
  const bottomEndX = ex - perpX;
  const bottomEndY = ey - perpY;
  const bottomStartX = sx - perpX;
  const bottomStartY = sy - perpY;

  // Build the path:
  // 1. Move to top-left (start of top line)
  // 2. Line to top-right (end of top line)
  // 3. Arc (semicircle) on the right
  // 4. Line to bottom-left (end of bottom line)
  // 5. Arc (semicircle) on the left
  // 6. Close path
  const path = [
    `M ${topStartX} ${topStartY}`,
    `L ${topEndX} ${topEndY}`,
    `A ${r} ${r} 0 0 1 ${bottomEndX} ${bottomEndY}`,
    `L ${bottomStartX} ${bottomStartY}`,
    `A ${r} ${r} 0 0 1 ${topStartX} ${topStartY}`,
    'Z'
  ].join(' ');

  return path;
}

onMounted(() => {
  updateDimensions();
  window.addEventListener('resize', updateDimensions);
});

watch(() => props.letters, () => {
  nextTick(updateDimensions);
}, { deep: true });

watch(() => props.circles, () => {
  nextTick(updateDimensions);
}, { deep: true });
</script>

<style lang="css" scoped>
.grid-container {
  position: relative;
  display: inline-block;
  margin: auto;
}

.word-search-grid {
  display: inline-flex;
  flex-direction: column;
  border-radius: 5px;
  border: solid var(--light-grey) 1px;
  height: min-content;
  background-color: var(--tile-background);
}

.row {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
}

.letter {
  border: solid rgba(223, 223, 223, 0.472) 1px;
  border-right: none;
  border-bottom: none;

  display: flex;
  flex-direction: column;
  justify-content: center;

  font-family: monospace;
  font-size: 1.5em;
  height: 1.5em;
  width: 1.5em;
}

.letter.highlighted {
  font-weight: bold;
}

.letter.elevated {
  position: relative;
  z-index: 10;
  pointer-events: none;
}

.circles-overlay {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}

.answer-circle {
  pointer-events: stroke;
  cursor: pointer;
  transition: stroke-width 0.2s, opacity 0.2s;
}

.answer-circle:hover,
.answer-circle.hovered {
  stroke-width: 5;
}
</style>