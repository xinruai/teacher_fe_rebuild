<script setup lang="ts">
import { computed } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import Item from './Item.vue'
import AppLink from './Link.vue'

const props = defineProps<{
  item: RouteRecordRaw
  basePath: string
}>()

const showingChildren = computed(() =>
  props.item.children?.filter((child) => !child.meta?.hidden) || [],
)

const onlyOneChild = computed(() => {
  if (showingChildren.value.length === 1) return showingChildren.value[0]
  if (showingChildren.value.length === 0) return { ...props.item, path: '', noShowingChildren: true }
  return null
})

function resolvePath(routePath: string): string {
  if (routePath.startsWith('/')) return routePath
  return `${props.basePath}/${routePath}`.replace(/\/+/g, '/')
}
</script>

<template>
  <AppLink v-if="onlyOneChild && !props.item.meta?.alwaysShow" :to="resolvePath(onlyOneChild.path)">
    <el-menu-item :index="resolvePath(onlyOneChild.path)" class="submenu-title-noDropdown">
      <Item :icon="(onlyOneChild.meta?.icon || props.item.meta?.icon) as string" :title="(onlyOneChild.meta?.title || '') as string" />
    </el-menu-item>
  </AppLink>

  <el-sub-menu v-else :index="props.basePath" teleported>
    <template #title>
      <Item v-if="props.item.meta" :icon="props.item.meta.icon as string" :title="props.item.meta.title as string" />
    </template>
    <SidebarItem
      v-for="child in showingChildren"
      :key="child.path"
      :item="child"
      :base-path="resolvePath(child.path)"
      class="nest-menu"
    />
  </el-sub-menu>
</template>
