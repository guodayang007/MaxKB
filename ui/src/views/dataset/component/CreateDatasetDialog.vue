<template>
  <el-dialog
    :title="$t('views.dataset.createDataset')"
    v-model="dialogVisible"
    width="720"
    append-to-body
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    class="create-dataset-dialog"
  >
    <!-- 基本信息 -->
    <BaseForm ref="BaseFormRef" v-if="dialogVisible" />
    <el-form
      ref="DatasetFormRef"
      :rules="rules"
      :model="datasetForm"
      label-position="top"
      require-asterisk-position="right"
      @submit.prevent
    >
      <el-form-item :label="$t('views.dataset.datasetForm.form.datasetType.label')" required>
        <el-radio-group v-model="datasetForm.type" class="card__radio" @change="radioChange">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-card shadow="never" :class="datasetForm.type === '0' ? 'active' : ''">
                <el-radio value="0" size="large">
                  <div class="type-header">
                    <el-icon class="type-icon"><Document /></el-icon>
                    <p class="mb-4">{{ $t('views.dataset.general') }}</p>
                  </div>
                  <el-text type="info">{{
                    $t('views.dataset.datasetForm.form.datasetType.generalInfo')
                  }}</el-text>
                </el-radio>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card shadow="never" :class="datasetForm.type === '1' ? 'active' : ''">
                <el-radio value="1" size="large">
                  <div class="type-header">
                    <el-icon class="type-icon"><Connection /></el-icon>
                    <p class="mb-4">{{ $t('views.dataset.web') }}</p>
                  </div>
                  <el-text type="info">{{
                    $t('views.dataset.datasetForm.form.datasetType.webInfo')
                  }}</el-text>
                </el-radio>
              </el-card>
            </el-col>
          </el-row>
          <el-row :gutter="20" v-hasPermission="new ComplexPermission([], ['x-pack'], 'OR')">
            <el-col :span="12">
              <el-card
                shadow="never"
                class="mb-16"
                :class="datasetForm.type === '2' ? 'active' : ''"
                @click="datasetForm.type = '2'"
              >
                <div class="flex-between">
                  <div class="flex align-center">
                    <AppAvatar shape="square" :size="32" style="background: none">
                      <img src="@/assets/logo_lark.svg" style="width: 100%" alt="" />
                    </AppAvatar>
                    <div>
                      <p>
                        <el-text>{{ $t('views.dataset.lark') }}</el-text>
                      </p>
                      <el-text type="info">{{
                        $t('views.dataset.datasetForm.form.datasetType.larkInfo')
                      }}</el-text>
                    </div>
                  </div>
                  <el-radio value="2" size="large" style="width: 16px"></el-radio>
                </div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <!--              <el-card-->
              <!--                shadow="never"-->
              <!--                class="mb-16"-->
              <!--                :class="datasetForm.type === '3' ? 'active' : ''"-->
              <!--                @click="datasetForm.type = '3'"-->
              <!--              >-->
              <!--                <div class="flex-between">-->
              <!--                  <div class="flex align-center">-->
              <!--                    <AppAvatar class="mr-8" :size="32">-->
              <!--                      <img src="@/assets/icon_web.svg" style="width: 100%" alt="" />-->
              <!--                    </AppAvatar>-->
              <!--                    <div>-->
              <!--                      <p>-->
              <!--                        <el-text>{{ $t('views.dataset.yuque') }}</el-text>-->
              <!--                      </p>-->
              <!--                      <el-text type="info">{{-->
              <!--                        $t('views.dataset.datasetForm.form.datasetType.yuqueInfo')-->
              <!--                      }}</el-text>-->
              <!--                    </div>-->
              <!--                  </div>-->
              <!--                  <el-radio value="3" size="large" style="width: 16px"></el-radio>-->
              <!--                </div>-->
              <!--              </el-card>-->
            </el-col>
          </el-row>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        :label="$t('views.dataset.datasetForm.form.source_url.label')"
        prop="source_url"
        v-if="datasetForm.type === '1'"
      >
        <el-input
          v-model="datasetForm.source_url"
          :placeholder="$t('views.dataset.datasetForm.form.source_url.placeholder')"
          @blur="datasetForm.source_url = datasetForm.source_url.trim()"
        />
      </el-form-item>
      <el-form-item
        :label="$t('views.dataset.datasetForm.form.selector.label')"
        v-if="datasetForm.type === '1'"
      >
        <el-input
          v-model="datasetForm.selector"
          :placeholder="$t('views.dataset.datasetForm.form.selector.placeholder')"
          @blur="datasetForm.selector = datasetForm.selector.trim()"
        />
      </el-form-item>
      <el-form-item label="App ID" prop="app_id" v-if="datasetForm.type === '2'">
        <el-input
          v-model="datasetForm.app_id"
          :placeholder="$t('views.application.applicationAccess.larkSetting.appIdPlaceholder')"
        />
      </el-form-item>
      <el-form-item label="App Secret" prop="app_secret" v-if="datasetForm.type === '2'">
        <el-input
          v-model="datasetForm.app_secret"
          type="password"
          show-password
          :placeholder="$t('views.application.applicationAccess.larkSetting.appSecretPlaceholder')"
        />
      </el-form-item>
      <el-form-item label="Folder Token" prop="folder_token" v-if="datasetForm.type === '2'">
        <el-input
          v-model="datasetForm.folder_token"
          :placeholder="
            $t('views.application.applicationAccess.larkSetting.folderTokenPlaceholder')
          "
        />
      </el-form-item>
      <el-form-item label="User ID" prop="user_id" v-if="datasetForm.type === '3'">
        <el-input
          v-model="datasetForm.user_id"
          :placeholder="
            $t('views.application.applicationAccess.larkSetting.folderTokenPlaceholder')
          "
        />
      </el-form-item>
      <el-form-item label="Token" prop="token" v-if="datasetForm.type === '3'">
        <el-input
          v-model="datasetForm.token"
          :placeholder="
            $t('views.application.applicationAccess.larkSetting.folderTokenPlaceholder')
          "
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click.prevent="dialogVisible = false" :loading="loading">
          <el-icon class="mr-1"><Close /></el-icon>
          {{ $t('common.cancel') }}
        </el-button>
        <el-button type="primary" @click="submitHandle" :loading="loading">
          <el-icon class="mr-1"><Check /></el-icon>
          {{ $t('common.create') }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { Document, Connection, Close, Check } from '@element-plus/icons-vue'
import { ref, watch, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BaseForm from './BaseForm.vue'
import datasetApi from '@/api/dataset'
import { MsgSuccess, MsgAlert } from '@/utils/message'
import { t } from '@/locales'
import { ComplexPermission } from '@/utils/permission/type'
const emit = defineEmits(['refresh'])

const router = useRouter()
const BaseFormRef = ref()
const DatasetFormRef = ref()

const loading = ref(false)
const dialogVisible = ref<boolean>(false)

const datasetForm = ref<any>({
  type: '0',
  source_url: '',
  selector: '',
  app_id: '',
  app_secret: '',
  folder_token: ''
})

const rules = reactive({
  source_url: [
    {
      required: true,
      message: t('views.dataset.datasetForm.form.source_url.requiredMessage'),
      trigger: 'blur'
    }
  ],
  app_id: [
    {
      required: true,
      message: t('views.application.applicationAccess.larkSetting.appIdPlaceholder'),
      trigger: 'blur'
    }
  ],
  app_secret: [
    {
      required: true,
      message: t('views.application.applicationAccess.larkSetting.appSecretPlaceholder'),
      trigger: 'blur'
    }
  ],
  folder_token: [
    {
      required: true,
      message: t('views.application.applicationAccess.larkSetting.folderTokenPlaceholder'),
      trigger: 'blur'
    }
  ],
  user_id: [
    {
      required: true,
      message: t('views.dataset.datasetForm.form.user_id.requiredMessage'),
      trigger: 'blur'
    }
  ],
  token: [
    {
      required: true,
      message: t('views.dataset.datasetForm.form.token.requiredMessage'),
      trigger: 'blur'
    }
  ]
})

watch(dialogVisible, (bool) => {
  if (!bool) {
    datasetForm.value = {
      type: '0',
      source_url: '',
      selector: ''
    }
    DatasetFormRef.value?.clearValidate()
  }
})

const open = () => {
  dialogVisible.value = true
}

const submitHandle = async () => {
  if (await BaseFormRef.value?.validate()) {
    await DatasetFormRef.value.validate((valid: any) => {
      if (valid) {
        if (datasetForm.value.type === '0') {
          const obj = {
            ...BaseFormRef.value.form,
            type: datasetForm.value.type
          }
          datasetApi.postDataset(obj, loading).then((res) => {
            MsgSuccess(t('common.createSuccess'))
            router.push({ path: `/dataset/${res.data.id}/document` })
            emit('refresh')
          })
        } else if (datasetForm.value.type === '1') {
          const obj = { ...BaseFormRef.value.form, ...datasetForm.value }
          datasetApi.postWebDataset(obj, loading).then((res) => {
            MsgSuccess(t('common.createSuccess'))
            router.push({ path: `/dataset/${res.data.id}/document` })
            emit('refresh')
          })
        } else if (datasetForm.value.type === '2') {
          const obj = { ...BaseFormRef.value.form, ...datasetForm.value }
          datasetApi.postLarkDataset(obj, loading).then((res) => {
            MsgSuccess(t('common.createSuccess'))
            router.push({ path: `/dataset/${res.data.id}/document` })
            emit('refresh')
          })
        }
      } else {
        return false
      }
    })
  } else {
    return false
  }
}
function radioChange() {
  datasetForm.value.source_url = ''
  datasetForm.value.selector = ''
}

defineExpose({ open })
</script>
<style lang="scss" scoped>
.create-dataset-dialog {
  .el-dialog {
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(80, 181, 167, 0.15);
    
    :deep(.el-dialog__header) {
      margin: 0;
      padding: 24px;
      border-bottom: 1px solid rgba(80, 181, 167, 0.1);
      background: linear-gradient(135deg, rgba(80, 181, 167, 0.08), rgba(80, 181, 167, 0.02));
      
      .el-dialog__title {
        font-size: 18px;
        font-weight: 600;
        background: linear-gradient(to right, rgb(80, 181, 167), rgba(80, 181, 167, 0.7));
        -webkit-background-clip: text;
        color: transparent;
      }
    }
    
    :deep(.el-dialog__body) {
      padding: 24px;
    }
    
    :deep(.el-dialog__footer) {
      padding: 16px 24px;
      border-top: 1px solid rgba(80, 181, 167, 0.1);
      background: rgba(80, 181, 167, 0.02);
    }
  }
}

// 输入框样式优化
:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  box-shadow: none !important;
  border: 1px solid rgba(80, 181, 167, 0.2);
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(80, 181, 167, 0.4);
  }
  
  &:focus-within {
    border-color: rgb(80, 181, 167);
    box-shadow: 0 0 0 2px rgba(80, 181, 167, 0.1) !important;
  }
}

// 单选卡片组样式
.card__radio {
  width: 100%;
  
  :deep(.el-radio__input) {
    display: none;
  }
  
  .type-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    
    .type-icon {
      font-size: 24px;
      margin-right: 12px;
      padding: 8px;
      border-radius: 8px;
      background: rgba(80, 181, 167, 0.1);
      color: rgb(80, 181, 167);
    }
    
    p {
      font-size: 16px;
      font-weight: 500;
      margin: 0;
    }
  }
  
  .el-card {
    height: 100%;
    border: 1px solid rgba(80, 181, 167, 0.2);
    border-radius: 12px;
    transition: all 0.3s ease;
    cursor: pointer;
    
    &:hover {
      transform: translateY(-2px);
      border-color: rgba(80, 181, 167, 0.4);
      background: rgba(80, 181, 167, 0.02);
      box-shadow: 0 4px 12px rgba(80, 181, 167, 0.1);
    }
    
    &.active {
      border-color: rgb(80, 181, 167);
      background: rgba(80, 181, 167, 0.05);
      
      .type-icon {
        background: rgb(80, 181, 167);
        color: white;
      }
      
      :deep(.el-radio__label) {
        color: rgb(80, 181, 167);
      }
    }
    
    :deep(.el-card__body) {
      padding: 20px;
    }
    
    .el-text {
      font-size: 14px;
      line-height: 1.5;
      color: var(--el-text-color-secondary);
    }
  }
}

// 底部按钮样式
.dialog-footer {
  text-align: right;
  
  .el-button {
    min-width: 100px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    
    .el-icon {
      font-size: 16px;
    }
    
    &:not(:last-child) {
      margin-right: 12px;
    }
    
    &--primary {
      background: linear-gradient(135deg, rgb(80, 181, 167), rgba(80, 181, 167, 0.9));
      border: none;
      
      &:hover {
        background: linear-gradient(135deg, rgba(80, 181, 167, 0.9), rgb(80, 181, 167));
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(80, 181, 167, 0.2);
      }
    }
  }
}
</style>
