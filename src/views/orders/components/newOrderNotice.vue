<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElNotification } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { setRushOrderNotice, getRushOrderNoticeSetting } from '@/api/modules/order'

const isShow = ref(false)
const loading = ref(false)
const btnloading = ref(false)
const form = reactive<Record<string, any>>({})
const formRef = ref<FormInstance>()
const current = ref<any>({})

const timeIntervalList = [
  { value: 1, label: '每2小时发送一次' },
  { value: 2, label: '每24小时发送一次' },
  { value: 3, label: '每个新订单发送一次' },
]

async function show(row: any) {
  isShow.value = true
  current.value = row
  await fetchNoticeSetting()
}

function closeModal() {
  isShow.value = false
  current.value = {}
  Object.keys(form).forEach((k) => delete form[k])
}

async function fetchNoticeSetting() {
  loading.value = true
  const res = await getRushOrderNoticeSetting({ teacId: current.value.teacId })
  loading.value = false
  if (res.status == 200) {
    const { statused, noticeTimeInterval } = res.body || {}
    form.statused = statused
    form.noticeTimeInterval = noticeTimeInterval
  }
}

function submit() {
  formRef.value?.validate(async (valid) => {
    if (valid) {
      const params = {
        teacId: current.value.teacId,
        ...form,
      }
      btnloading.value = true
      const res = await setRushOrderNotice(params)
      btnloading.value = false
      if (res.status == 200) {
        ElNotification.success('设置成功')
        closeModal()
      }
    }
  })
}

defineExpose({ show, closeModal })
</script>

<template>
  <div>
    <el-dialog title="新订单通知设置" v-model="isShow" width="320px" append-to-body>
      <el-form :model="form" ref="formRef" v-loading="loading">
        <el-form-item label="通知功能" prop="statused" class="is-required">
          <el-switch
            v-model="form.statused"
            active-color="#FF8723"
            inactive-color="#DCDCDC"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
        <el-form-item
          v-show="form.statused"
          label="时间间隔设置"
          prop="noticeTimeInterval"
          :rules="[{ required: true, message: '请选择时间间隔' }]"
        >
          <el-select v-model.number="form.noticeTimeInterval" placeholder="请选择时间间隔" size="small">
            <el-option
              v-for="item in timeIntervalList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
              {{ item.label }}
              <img
                v-if="item.value === 3"
                src="@/assets/images/home/recommend.png"
                alt=""
                class="recommend-icon"
              />
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeModal" type="primary" link class="btn">取 消</el-button>
          <el-button type="primary" link @click="submit" class="submit-btn" :loading="btnloading">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dialog) {
  position: relative;
  border-radius: 10px;
  .el-dialog__title {
    font-weight: 700;
  }
  .dialog-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    box-shadow: 0px 0 23px 0px rgba(0, 0, 0, 0.12);
    text-align: center;
    padding: 10px;
  }
  .el-dialog__body {
    height: 320px;
  }
}
.el-select {
  width: 170px;
}
:deep(.el-form-item) {
  display: flex;
  justify-content: space-between;
  .el-form-item__label {
    flex: 1;
    text-align: left;
  }
}
:deep(.btn),
:deep(.submit-btn) {
  border: 1px solid #ff8723;
  height: 28px;
  width: 60px;
  padding: 0;
  font-size: 12px;
  border-radius: 14px;
  margin: 0 10px;
  span {
    color: #ff8723;
    font-size: 12px;
  }
}
:deep(.submit-btn) {
  background: #ff8723;
  span {
    color: #fff;
  }
  .el-icon-loading {
    color: #fff;
  }
}
.recommend-icon {
  height: 16px;
  width: auto;
  vertical-align: middle;
}
</style>
