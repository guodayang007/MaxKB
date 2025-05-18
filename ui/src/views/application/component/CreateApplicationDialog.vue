<template>
  <el-dialog
    :title="$t('views.application.createApplication')"
    v-model="dialogVisible"
    width="650"
    append-to-body
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    class="create-application-dialog"
  >
    <el-form
      ref="applicationFormRef"
      :model="applicationForm"
      :rules="rules"
      label-position="top"
      require-asterisk-position="right"
      @submit.prevent
    >
    <el-form-item>
        <el-radio-group v-model="applicationForm.type" class="card__radio">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-card shadow="never" :class="applicationForm.type === 'SIMPLE' ? 'active' : ''">
                <el-radio value="SIMPLE" size="large">
                  <div class="type-header">
                    <el-icon class="type-icon"><Document /></el-icon>
                    <p class="mb-4">{{ $t('views.application.simple') }}</p>
                  </div>
                  <el-text type="info">{{
                    $t('views.application.applicationForm.form.appType.simplePlaceholder')
                  }}</el-text>
                </el-radio>
              </el-card>
            </el-col>
            <el-col :span="12" @click="selectedType('assistant')">
              <el-card shadow="never" :class="isWorkFlow(applicationForm.type) ? 'active' : ''">
                <el-radio value="WORK_FLOW" size="large">
                  <div class="type-header">
                    <el-icon class="type-icon"><Connection /></el-icon>
                    <p class="mb-4">{{ $t('views.application.workflow') }}</p>
                  </div>
                  <el-text type="info">{{
                    $t('views.application.applicationForm.form.appType.workflowPlaceholder')
                  }}</el-text>
                </el-radio>
              </el-card>
            </el-col>
          </el-row>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="$t('views.application.applicationForm.form.appName.label')" prop="name">
        <el-input
          v-model="applicationForm.name"
          maxlength="64"
          :placeholder="$t('views.application.applicationForm.form.appName.placeholder')"
          show-word-limit
          @blur="applicationForm.name = applicationForm.name?.trim()"
        />
      </el-form-item>
      <el-form-item :label="$t('views.application.applicationForm.form.appDescription.label')">
        <el-input
          v-model="applicationForm.desc"
          type="textarea"
          :placeholder="$t('views.application.applicationForm.form.appDescription.placeholder')"
          :rows="3"
          maxlength="256"
          show-word-limit
        />
      </el-form-item>
      
     
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click.prevent="dialogVisible = false" :loading="loading">
          <el-icon class="mr-1"><Close /></el-icon>
          {{ $t('common.cancel') }}
        </el-button>
        <el-button type="primary" @click="submitHandle(applicationFormRef)" :loading="loading">
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
import type { ApplicationFormType } from '@/api/type/application'
import type { FormInstance, FormRules } from 'element-plus'
import applicationApi from '@/api/application'
import { MsgSuccess, MsgAlert } from '@/utils/message'
import { isWorkFlow } from '@/utils/application'
import { baseNodes } from '@/workflow/common/data'
import { t } from '@/locales'
const router = useRouter()
const emit = defineEmits(['refresh'])

// @ts-ignore
const defaultPrompt = t('views.application.applicationForm.form.prompt.defaultPrompt', {
  data: '{data}',
  question: '{question}'
})

const optimizationPrompt =
  t('views.application.applicationForm.dialog.defaultPrompt1', {
    question: '{question}'
  }) +
  '<data></data>' +
  t('views.application.applicationForm.dialog.defaultPrompt2')

const workflowDefault = ref<any>({
  edges: [],
  nodes: baseNodes
})
const appTemplate = ref('blank')

const applicationFormRef = ref()

const loading = ref(false)
const dialogVisible = ref<boolean>(false)

const applicationForm = ref<ApplicationFormType>({
  name: '',
  desc: '',
  model_id: '',
  dialogue_number: 1,
  prologue: t('views.application.applicationForm.form.defaultPrologue'),
  dataset_id_list: [],
  dataset_setting: {
    ying_yong_zhi_shi_ku:false,
    top_n: 3,
    similarity: 0.6,
    max_paragraph_char_number: 5000,
    search_mode: 'embedding',
    no_references_setting: {
      status: 'ai_questioning',
      value: '{question}'
    }
  },
  model_setting: {
    prompt: defaultPrompt,
    system: t('views.application.applicationForm.form.roleSettings.placeholder'),
    no_references_prompt: '{question}'
  },
  model_params_setting: {},
  problem_optimization: false,
  problem_optimization_prompt: optimizationPrompt,
  stt_model_id: '',
  tts_model_id: '',
  stt_model_enable: false,
  tts_model_enable: false,
  tts_type: 'BROWSER',
  type: 'SIMPLE'
})

const rules = reactive<FormRules<ApplicationFormType>>({
  name: [
    {
      required: true,
      message: t('views.application.applicationForm.form.appName.placeholder'),
      trigger: 'blur'
    }
  ],
  model_id: [
    {
      required: false,
      message: t('views.application.applicationForm.form.aiModel.placeholder'),
      trigger: 'change'
    }
  ]
})

watch(dialogVisible, (bool) => {
  if (!bool) {
    applicationForm.value = {
      name: '',
      desc: '',
      model_id: '',
      dialogue_number: 1,
      prologue: t('views.application.applicationForm.form.defaultPrologue'),
      dataset_id_list: [],
      dataset_setting: {
        ying_yong_zhi_shi_ku:false,
        top_n: 3,
        similarity: 0.6,
        max_paragraph_char_number: 5000,
        search_mode: 'embedding',
        no_references_setting: {
          status: 'ai_questioning',
          value: '{question}'
        }
      },
      model_setting: {
        prompt: defaultPrompt,
        system: t('views.application.applicationForm.form.roleSettings.placeholder'),
        no_references_prompt: '{question}'
      },
      model_params_setting: {},
      problem_optimization: false,
      problem_optimization_prompt: optimizationPrompt,
      stt_model_id: '',
      tts_model_id: '',
      stt_model_enable: false,
      tts_model_enable: false,
      tts_type: 'BROWSER',
      type: 'SIMPLE'
    }
    applicationFormRef.value?.clearValidate()
  }
})

const open = () => {
  dialogVisible.value = true
}

const submitHandle = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid) => {
    if (valid) {
      if (isWorkFlow(applicationForm.value.type) && appTemplate.value === 'blank') {
        workflowDefault.value.nodes[0].properties.node_data.desc = applicationForm.value.desc
        workflowDefault.value.nodes[0].properties.node_data.name = applicationForm.value.name
        applicationForm.value['work_flow'] = workflowDefault.value
      }
      applicationApi.postApplication(applicationForm.value, loading).then((res) => {
        MsgSuccess(t('common.createSuccess'))
        if (isWorkFlow(applicationForm.value.type)) {
          router.push({ path: `/application/${res.data.id}/workflow` })
        } else {
          router.push({ path: `/application/${res.data.id}/${res.data.type}/setting` })
        }
        dialogVisible.value = false
      })
    }
  })
}

function selectedType(type: string) {
  appTemplate.value = type
}

defineExpose({ open })
</script>
<style lang="scss" scoped>
.radio-card {
  line-height: 22px;
  &.active {
    border-color: var(--el-color-primary);
    color: var(--el-color-primary);
  }
}

.create-application-dialog {
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

.el-form {
  .el-form-item {
    margin-bottom: 24px;
    
    :deep(.el-form-item__label) {
      padding-bottom: 8px;
      font-size: 14px;
      font-weight: 500;
      color: var(--el-text-color-primary);
      
      &::before {
        color: rgb(80, 181, 167);
      }
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