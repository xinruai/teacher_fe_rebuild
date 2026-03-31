<script setup lang="ts">
</script>

<template>
  <div class="g-header">
    <div class="g-header__col g-header__phase">阶段</div>
    <div class="g-header__col g-header__name">课堂名称</div>
    <div class="g-header__col g-header__type">课程类别</div>
    <div class="g-header__col g-header__plan">课堂说明</div>
    <div class="g-header__col g-header__time">上课时间</div>
    <div class="g-header__col g-header__explain">课程说明</div>
    <div class="g-header__col g-header__remark">课堂备注</div>
    <div class="g-header__col g-header__range">时长(min)</div>
    <div class="g-header__col g-header__material">材料</div>
    <div class="g-header__col g-header__arrange">排课</div>
  </div>
</template>

<style scoped lang="scss">
.g-header {
  display: flex;
  align-items: center;
  background: #eba472;
  color: #fff;
  font-size: 14px;
  font-weight: bold;
  padding: 10px 0;
  border-radius: 4px 4px 0 0;

  &__col {
    padding: 0 5px;
    text-align: center;
  }

  &__phase { width: 10%; }
  &__name { width: 11%; }
  &__type { width: 8%; }
  &__plan { width: 20%; }
  &__time { width: 12%; }
  &__explain { width: 7%; }
  &__remark { width: 10%; }
  &__range { width: 8%; }
  &__material { width: 10%; }
  &__arrange { width: 8%; }
}
</style>
