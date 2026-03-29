<script setup lang="ts">
defineProps<{
  icon?: string
  title?: string
}>()
</script>

<template>
  <div style="display: inline-flex; align-items: center;">
    <!-- TODO: Replace with SvgIcon component -->
    <svg v-if="icon" class="svg-icon" aria-hidden="true" style="width: 1em; height: 1em; margin-right: 16px;">
      <use :xlink:href="'#icon-' + icon" />
    </svg>
    <span v-if="title">{{ title }}</span>
  </div>
</template>
