<template>
   <div>
    <div
      class="first-title"
      id="1.3"
    > 3.腾讯会议课堂操作指南</div>
    <div class="guide-content">
      <img src="@/assets/images/help/help-tx.png" alt="">
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
.first-title {
  font-weight: 700;
  font-size: 15px !important;
  color: #333333;
}
.second-title {
  font-weight: 700;
  font-size: 15px !important;
  color: #333333;
  margin-left: -10px;
  margin-top: 10px;
  &::before {
    display: inline-block;
    content: "";
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #333333;
    position: relative;
    top: -3px;
    margin-right: 3px;
  }
}
.font-red {
  color: red;
}
.guide-content {
  padding-left: 60px;
  line-height: 25px;
}
.mt {
  margin-top: 10px;
}
img {
  width: 610px;
  height: auto;
  display: block;
}
</style>
