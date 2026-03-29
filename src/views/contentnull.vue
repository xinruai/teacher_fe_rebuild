<script setup lang="ts">
withDefaults(defineProps<{
  statuscode?: number
}>(), {
  statuscode: 0,
})
</script>

<template>
  <div class="contentnull" style="text-align: center; padding: 40px 0;">
    <img src="@/assets/images/order-contentnone.png" alt="" style="width: 186px; height: auto; display: block; margin: 0 auto;" />
    <div v-if="statuscode === 3" style="color: #999; margin-top: 10px;">暂无搜索结果</div>
    <div v-else style="color: #999; margin-top: 10px;">暂无数据</div>
  </div>
</template>
