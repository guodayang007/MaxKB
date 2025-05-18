<template>
  <LayoutContainer :header="$t('views.applicationOverview.title')" class="dify-style-container">
    <el-scrollbar>
      <div class="main-calc-height p-24">
        <!-- Removed the h4 title here to match Dify's card-based structure -->
        <el-card shadow="never" class="overview-card dify-card" v-loading="loading">
          <div class="app-header flex align-center">
            <div
              class="edit-avatar mr-12"
              @mouseenter="showEditIcon = true"
              @mouseleave="showEditIcon = false"
            >
              <AppAvatar
                v-if="isAppIcon(detail?.icon)"
                shape="square"
                :size="32"
                style="background: none"
              >
                <img :src="detail?.icon" alt="" />
              </AppAvatar>
              <AppAvatar
                v-else-if="detail?.name"
                :name="detail?.name"
                pinyinColor
                shape="square"
                :size="32"
              />
              <AppAvatar
                v-if="showEditIcon"
                shape="square"
                class="edit-mask"
                :size="32"
                @click="openEditAvatar"
              >
                <el-icon><EditPen /></el-icon>
              </AppAvatar>
            </div>
            <h4 class="app-title">{{ detail?.name }}</h4>
          </div>

          <el-row :gutter="24" class="mt-24">
            <el-col :span="12">
              <div class="access-section">
                <div class="flex align-center mb-16">
                  <el-text class="section-title">{{
                    $t('views.applicationOverview.appInfo.publicAccessLink')
                  }}</el-text>
                  <el-switch
                    v-model="accessToken.is_active"
                    class="ml-8"
                    size="small"
                    inline-prompt
                    active-color="rgb(80, 181, 167)"
                    :active-text="$t('views.applicationOverview.appInfo.openText')"
                    :inactive-text="$t('views.applicationOverview.appInfo.closeText')"
                    :before-change="() => changeState(accessToken.is_active)"
                  />
                </div>

                <div class="mt-4 mb-16 url-display flex align-center">
                  <span class="vertical-middle lighter break-all ellipsis-1 url-text">
                    {{ shareUrl }}
                  </span>
                  <el-tooltip effect="dark" :content="$t('common.copy')" placement="top">
                    <el-button type="primary" text @click="copyClick(shareUrl)" class="copy-button">
                      <AppIcon iconName="app-copy"></AppIcon>
                    </el-button>
                  </el-tooltip>
                  <el-tooltip effect="dark" :content="$t('common.refresh')" placement="top">
                    <el-button
                      @click="refreshAccessToken"
                      type="primary"
                      text
                      style="margin-left: 1px"
                      class="refresh-button"
                    >
                      <el-icon><RefreshRight /></el-icon>
                    </el-button>
                  </el-tooltip>
                </div>
                <div class="button-group">
                  <el-button
                    v-if="accessToken?.is_active"
                    :disabled="!accessToken?.is_active"
                    type="primary"
                    tag="a"
                    :href="shareUrl"
                    target="_blank"
                    class="dify-button"
                  >
                    {{ $t('views.applicationOverview.appInfo.demo') }}
                  </el-button>
                  <el-button v-else :disabled="!accessToken?.is_active" type="primary" class="dify-button">
                    {{ $t('views.applicationOverview.appInfo.demo') }}
                  </el-button>
                  <el-button :disabled="!accessToken?.is_active" @click="openDialog" class="dify-button is-plain">
                    {{ $t('views.applicationOverview.appInfo.embedInWebsite') }}
                  </el-button>
                  <el-button @click="openLimitDialog" class="dify-button is-plain">
                    {{ $t('views.applicationOverview.appInfo.accessControl') }}
                  </el-button>
                  <el-button @click="openDisplaySettingDialog" class="dify-button is-plain">
                    {{ $t('views.applicationOverview.appInfo.displaySetting') }}
                  </el-button>
                </div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="access-section">
                <div class="flex mb-16">
                  <el-text class="section-title"
                    >{{ $t('views.applicationOverview.appInfo.apiAccessCredentials') }}
                  </el-text>
                </div>
                <div class="mt-4 mb-16 url-display">
                  <div class="mb-8">
                    <el-text>API {{ $t('common.fileUpload.document') }}：</el-text
                    ><el-button
                      type="primary"
                      link
                      @click="toUrl(apiUrl)"
                      class="vertical-middle lighter break-all url-text"
                    >
                      {{ apiUrl }}
                    </el-button>
                  </div>
                  <div class="flex align-center">
                    <span class="flex">
                      <el-text style="width: 80px">Base URL：</el-text>
                    </span>

                    <span class="vertical-middle lighter break-all ellipsis-1 url-text">{{
                      baseUrl + id
                    }}</span>
                    <el-tooltip effect="dark" :content="$t('common.copy')" placement="top">
                      <el-button type="primary" text @click="copyClick(baseUrl + id)" class="copy-button">
                        <AppIcon iconName="app-copy"></AppIcon>
                      </el-button>
                    </el-tooltip>
                  </div>
                </div>
                <div class="button-group">
                  <el-button @click="openAPIKeyDialog" class="dify-button">
                    {{ $t('views.applicationOverview.appInfo.apiKey') }}
                  </el-button>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <el-card shadow="never" class="overview-card dify-card mt-24" v-loading="statisticsLoading">
           <div class="app-header">
             <h4 class="app-title">{{ $t('views.applicationOverview.monitor.monitoringStatistics') }}</h4>
           </div>
           <div class="p-16">
             <div class="mb-16">
               <el-select
                 v-model="history_day"
                 class="mr-12"
                 @change="changeDayHandle"
                 style="width: 180px"
               >
                 <el-option
                   v-for="item in dayOptions"
                   :key="item.value"
                   :label="item.label"
                   :value="item.value"
                 />
               </el-select>
               <el-date-picker
                 v-if="history_day === 'other'"
                 v-model="daterangeValue"
                 type="daterange"
                 :start-placeholder="$t('views.applicationOverview.monitor.startDatePlaceholder')"
                 :end-placeholder="$t('views.applicationOverview.monitor.endDatePlaceholder')"
                 format="YYYY-MM-DD"
                 value-format="YYYY-MM-DD"
                 @change="changeDayRangeHandle"
               />
             </div>
             <div>
               <StatisticsCharts :data="statisticsData" />
             </div>
           </div>
        </el-card>
      </div>
    </el-scrollbar>
    <EmbedDialog
      ref="EmbedDialogRef"
      :data="detail"
      :api-input-params="mapToUrlParams(apiInputParams)"
    />
    <APIKeyDialog ref="APIKeyDialogRef" />
    <LimitDialog ref="LimitDialogRef" @refresh="refresh" />
    <EditAvatarDialog ref="EditAvatarDialogRef" @refresh="refreshIcon" />
    <XPackDisplaySettingDialog
      ref="XPackDisplaySettingDialogRef"
      @refresh="refresh"
      v-if="user.isEnterprise()"
    />
    <DisplaySettingDialog ref="DisplaySettingDialogRef" @refresh="refresh" v-else />
  </LayoutContainer>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import EmbedDialog from './component/EmbedDialog.vue'
import APIKeyDialog from './component/APIKeyDialog.vue'
import LimitDialog from './component/LimitDialog.vue'
import DisplaySettingDialog from './component/DisplaySettingDialog.vue'
import XPackDisplaySettingDialog from './component/XPackDisplaySettingDialog.vue'
import EditAvatarDialog from './component/EditAvatarDialog.vue'
import StatisticsCharts from './component/StatisticsCharts.vue'
import applicationApi from '@/api/application'
import overviewApi from '@/api/application-overview'
import { nowDate, beforeDay } from '@/utils/time'
import { MsgSuccess, MsgConfirm } from '@/utils/message'
import { copyClick } from '@/utils/clipboard'
import { isAppIcon } from '@/utils/application'
import useStore from '@/stores'
import { t } from '@/locales'
const { user, application } = useStore()
const route = useRoute()
const {
  params: { id }
} = route as any

const apiUrl = window.location.origin + '/doc/chat/'

const baseUrl = window.location.origin + '/api/application/'

const DisplaySettingDialogRef = ref()
const XPackDisplaySettingDialogRef = ref()
const EditAvatarDialogRef = ref()
const LimitDialogRef = ref()
const APIKeyDialogRef = ref()
const EmbedDialogRef = ref()

const accessToken = ref<any>({})
const detail = ref<any>(null)

const loading = ref(false)

const urlParams = computed(() =>
  mapToUrlParams(apiInputParams.value) ? '?' + mapToUrlParams(apiInputParams.value) : ''
)
const shareUrl = computed(
  () => application.location + accessToken.value.access_token + urlParams.value
)

const dayOptions = [
  {
    value: 7,
    // @ts-ignore
    label: t('views.applicationOverview.monitor.pastDayOptions.past7Days')
  },
  {
    value: 30,
    label: t('views.applicationOverview.monitor.pastDayOptions.past30Days')
  },
  {
    value: 90,
    label: t('views.applicationOverview.monitor.pastDayOptions.past90Days')
  },
  {
    value: 183,
    label: t('views.applicationOverview.monitor.pastDayOptions.past183Days')
  },
  {
    value: 'other',
    label: t('views.applicationOverview.monitor.pastDayOptions.other')
  }
]

const history_day = ref<number | string>(7)

// 日期组件时间
const daterangeValue = ref('')

// 提交日期时间
const daterange = ref({
  start_time: '',
  end_time: ''
})

const statisticsLoading = ref(false)
const statisticsData = ref([])

const showEditIcon = ref(false)
const apiInputParams = ref([])

function toUrl(url: string) {
  window.open(url, '_blank')
}
function openDisplaySettingDialog() {
  if (user.isEnterprise()) {
    XPackDisplaySettingDialogRef.value?.open(accessToken.value, detail.value)
  } else {
    DisplaySettingDialogRef.value?.open(accessToken.value, detail.value)
  }
}
function openEditAvatar() {
  EditAvatarDialogRef.value.open(detail.value)
}

function changeDayHandle(val: number | string) {
  if (val !== 'other') {
    daterange.value.start_time = beforeDay(val)
    daterange.value.end_time = nowDate
    getAppStatistics()
  }
}

function changeDayRangeHandle(val: string) {
  daterange.value.start_time = val[0]
  daterange.value.end_time = val[1]
  getAppStatistics()
}

function getAppStatistics() {
  overviewApi.getStatistics(id, daterange.value, statisticsLoading).then((res: any) => {
    statisticsData.value = res.data
  })
}

function refreshAccessToken() {
  MsgConfirm(
    t('views.applicationOverview.appInfo.refreshToken.msgConfirm1'),
    t('views.applicationOverview.appInfo.refreshToken.msgConfirm2'),
    {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel')
    }
  )
    .then(() => {
      const obj = {
        access_token_reset: true
      }
      // @ts-ignore
      const str = t('views.applicationOverview.appInfo.refreshToken.refreshSuccess')
      updateAccessToken(obj, str)
    })
    .catch(() => {})
}
function changeState(bool: Boolean) {
  const obj = {
    is_active: !bool
  }
  const str = obj.is_active ? t('common.status.enableSuccess') : t('common.status.disableSuccess')
  updateAccessToken(obj, str)
    .then(() => {
      return true
    })
    .catch(() => {
      return false
    })
}

async function updateAccessToken(obj: any, str: string) {
  applicationApi.putAccessToken(id as string, obj, loading).then((res) => {
    accessToken.value = res?.data
    MsgSuccess(str)
  })
}

function openLimitDialog() {
  LimitDialogRef.value.open(accessToken.value)
}

function openAPIKeyDialog() {
  APIKeyDialogRef.value.open()
}
function openDialog() {
  EmbedDialogRef.value.open(accessToken.value?.access_token)
}
function getAccessToken() {
  application.asyncGetAccessToken(id, loading).then((res: any) => {
    accessToken.value = res?.data
  })
}

function getDetail() {
  application.asyncGetApplicationDetail(id, loading).then((res: any) => {
    detail.value = res.data
    detail.value.work_flow?.nodes
      ?.filter((v: any) => v.id === 'base-node')
      .map((v: any) => {
        apiInputParams.value = v.properties.api_input_field_list
          ? v.properties.api_input_field_list.map((v: any) => {
              return {
                name: v.variable,
                value: v.default_value
              }
            })
          : v.properties.input_field_list
            ? v.properties.input_field_list
                .filter((v: any) => v.assignment_method === 'api_input')
                .map((v: any) => {
                  return {
                    name: v.variable,
                    value: v.default_value
                  }
                })
            : []
      })
  })
}

function refresh() {
  getAccessToken()
}

function refreshIcon() {
  getDetail()
}

function mapToUrlParams(map: any[]) {
  const params = new URLSearchParams()

  map.forEach((item: any) => {
    params.append(encodeURIComponent(item.name), encodeURIComponent(item.value))
  })

  return params.toString() // 返回 URL 查询字符串
}

onMounted(() => {
  getDetail()
  getAccessToken()
  changeDayHandle(history_day.value)
})
</script>
<style lang="scss" scoped>
.dify-style-container {
  // Define primary color variable for easier use
  --primary-color: rgb(80, 181, 167);
  --primary-color-light: rgba(80, 181, 167, 0.1); // Lighter shade for backgrounds/hovers

  .overview-card {
    position: relative;
    // Removed active-button style as it's integrated into the card header now
  }

  .dify-card {
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    background-color: #fff;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05); // Subtle shadow

    .app-header {
      padding: 16px 24px; // Match Dify padding
      border-bottom: 1px solid #f3f4f6;
      margin-bottom: 0; // Remove default margin
    }

    .app-title {
      color: #111827;
      font-size: 18px;
      font-weight: 600;
    }

    .access-section {
      padding: 24px; // Match Dify padding
    }

    .section-title {
      color: #374151;
      font-size: 14px;
      font-weight: 500;
    }

    .url-display {
      background-color: #f9fafb; // Light background for URL
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 8px 12px;
      margin-bottom: 24px !important; // Adjust margin
      word-break: break-all; // Ensure long URLs break correctly

      .url-text {
        flex-grow: 1; // Allow text to take available space
        margin-right: 8px;
        color: #4b5563;
        font-size: 14px;
      }

      .copy-button, .refresh-button {
        color: #6b7280; // Icon button color
        &:hover {
          color: var(--primary-color); // Hover color
          background-color: transparent;
        }
      }
    }

    .button-group {
      display: flex;
      gap: 12px; // Space between buttons
      flex-wrap: wrap; // Allow buttons to wrap on smaller screens
    }

    .dify-button {
      border-radius: 8px;
      padding: 10px 16px;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;

      &.el-button--primary {
        background-color: var(--primary-color);
        border-color: var(--primary-color);
        color: #fff;

        &:hover {
          background-color: darken(rgb(80, 181, 167), 8%); // Slightly darker on hover
          border-color: darken(rgb(80, 181, 167), 8%);
        }

        &:active {
           background-color: darken(rgb(80, 181, 167), 12%);
           border-color: darken(rgb(80, 181, 167), 12%);
        }

        &.is-disabled {
          background-color: rgba(80, 181, 167, 0.5);
          border-color: rgba(80, 181, 167, 0.5);
          color: rgba(255, 255, 255, 0.8);
        }
      }

      &.is-plain {
        background-color: #fff;
        border-color: #d1d5db;
        color: #374151;

        &:hover {
          background-color: #f9fafb;
          border-color: #d1d5db;
          color: #111827;
        }

        &:active {
          background-color: #f3f4f6;
          border-color: #d1d5db;
          color: #111827;
        }

        &.is-disabled {
          background-color: #f9fafb;
          border-color: #e5e7eb;
          color: #9ca3af;
        }
      }
    }
  }
}

// Global style adjustments if needed (consider moving to a global stylesheet)
:deep(.el-switch.is-checked .el-switch__core) {
  border-color: var(--primary-color) !important;
  background-color: var(--primary-color) !important;
}

:deep(.el-date-editor .el-range__icon) {
  color: #9ca3af; // Adjust icon color
}

:deep(.el-select) {
  .el-input__wrapper {
    border-radius: 8px;
    border-color: #d1d5db;
    box-shadow: none;
    &:hover {
      border-color: #b3b3b3;
    }
    &.is-focused {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 1px var(--primary-color);
    }
  }
}

:deep(.el-date-editor) {
   .el-range-input {
     color: #374151;
   }
   .el-range__close-icon {
     color: #9ca3af;
   }
   .el-range-separator {
     color: #9ca3af;
   }
   .el-input__wrapper {
     border-radius: 8px;
     border-color: #d1d5db;
     box-shadow: none;
     &:hover {
       border-color: #b3b3b3;
     }
     &.is-focused {
       border-color: var(--primary-color);
       box-shadow: 0 0 0 1px var(--primary-color);
     }
   }
}

</style>
