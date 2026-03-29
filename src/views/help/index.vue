<script setup lang="ts">
import { ref, reactive } from 'vue'
import { menusList, type MenuItem } from './cfg'
import aboutMk from './components/aboutMk.vue'
import useGuide from './components/useGuide.vue'
import webFunctions from './components/webFunctions.vue'
import teacManual from './components/teacManual.vue'
import { getLocal } from '@/utils/auth'

const menus = reactive<MenuItem[]>(JSON.parse(JSON.stringify(menusList)))
const currentId = ref('')
const content = ref<HTMLElement>()

const teacinfo = getLocal<Record<string, any>>('teacinfo')

function scrollToTop(id: string) {
  currentId.value = id
  const el = document.getElementById(id)
  if (el && content.value) {
    content.value.scrollTop = el.offsetTop - 25
  }
}

function handleScroll() {
  const contentEl = document.getElementById('right')
  if (!contentEl) return
  for (const item of menus) {
    const el = document.getElementById(item.id)
    if (el && contentEl.scrollTop - el.offsetTop > -50) {
      currentId.value = item.id
    }
    dealChildren(item, contentEl)
  }
}

function dealChildren(item: MenuItem, contentEl: HTMLElement) {
  if (!item.children) return
  for (const child of item.children) {
    const el = document.getElementById(child.id)
    if (el && contentEl.scrollTop - el.offsetTop > -50) {
      currentId.value = child.id
    }
    dealChildren(child, contentEl)
  }
}

function showUp(index: number, secIndex: number, upType: boolean) {
  if (secIndex !== -1) {
    menus[index].children![secIndex].upType = upType
  } else {
    menus[index].upType = upType
  }
}
</script>

<template>
  <div class="page-container">
    <div class="left">
      <div v-for="(item, index) in menus" :key="index">
        <div class="first">
          <span
            :class="{ active: currentId === item.id }"
            @click="scrollToTop(item.id)"
          >
            {{ item.title }}
          </span>
          <i
            v-if="item.showArrow"
            class="arrow"
            :class="{
              'el-icon-arrow-down': !item.upType,
              'el-icon-arrow-up': item.upType,
            }"
            @click="showUp(index, -1, !item.upType)"
          />
        </div>
        <template v-if="item.children && item.upType">
          <div v-for="(secItem, secIdx) in item.children" :key="secIdx" class="second">
            <i
              v-if="secItem.showArrow"
              class="arrow"
              :class="{
                'el-icon-arrow-down': !secItem.upType,
                'el-icon-arrow-up': secItem.upType,
              }"
              @click="showUp(index, secIdx, !secItem.upType)"
            />
            <div
              :class="{ active: currentId === secItem.id }"
              @click="scrollToTop(secItem.id)"
            >
              <span v-if="secItem.showNo">{{ secIdx + 1 }}. </span>{{ secItem.title }}
            </div>
            <template v-if="secItem.children && secItem.upType">
              <div
                v-for="(thirdItem, thirdIdx) in secItem.children"
                :key="thirdIdx"
                class="third"
              >
                <div
                  :class="{ active: currentId === thirdItem.id }"
                  @click="scrollToTop(thirdItem.id)"
                >
                  <span v-if="thirdItem.showNo">● </span>{{ thirdItem.title }}
                </div>
              </div>
            </template>
          </div>
        </template>
      </div>
    </div>
    <div id="right" ref="content" class="right-content" @scroll="handleScroll">
      <aboutMk :teacinfo="teacinfo" />
      <useGuide />
      <webFunctions />
      <teacManual />
    </div>
  </div>
</template>

<style scoped lang="scss">
.page-container {
  height: 100%;
  margin: 0 auto;
  line-height: 30px;
  display: flex;
  overflow: auto;
  max-width: 1200px;

  > div {
    padding: 20px 30px 20px 20px;
  }

  .left {
    border-right: 1px solid #e7e7e7;
    overflow-y: auto;
    background: #fff;
    min-width: 285px;

    .first {
      color: #333333;
      font-weight: 700;
      font-size: 18px;
      cursor: pointer;
      margin-top: 10px;
      position: relative;
    }

    .second,
    .third {
      font-size: 16px;
      margin: 10px 0 0 35px;
      cursor: pointer;
      position: relative;
    }

    .third {
      font-size: 14px;
    }

    .active {
      color: #25a1ff;
      cursor: pointer;

      span {
        color: #25a1ff;
      }
    }
  }

  .arrow {
    position: absolute;
    right: -22px;
    top: 7px;
    font-weight: 700;
    font-size: 16px;
  }

  .right-content {
    margin: 25px 20px 0 40px;
    padding: 0 0 50px 0;
    overflow: auto;
    box-sizing: border-box;
    width: calc(100vw - 380px);
    height: calc(100vh - 85px);

    > div {
      width: 850px !important;
    }

    &::-webkit-scrollbar {
      width: 0px;
      background-color: transparent;
    }
  }
}

:deep(.menu-title),
:deep(.item-title),
:deep(.third-title) {
  color: #333333;
  font-size: 20px;
  font-weight: 700;
  margin: 10px 0;
}

:deep(.item-title) {
  font-size: 16px;
  margin-left: -40px;
}

:deep(.menu-title) {
  padding-top: 18px;
  margin-top: 0;
}

:deep(.third-title) {
  font-size: 15px;
  margin-left: -14px;
}

:deep(.step .title),
:deep(.first-title) {
  font-size: 16px !important;
}
</style>
