<template>
  <div class="application-list-container p-24" style="padding-top: 24px">
    <div class="header-container mb-24">
      <div class="title-section">
        <h4 class="page-title">{{ $t('views.application.title') }}</h4>
        <div class="title-decoration"></div>
      </div>
      <div class="search-section">
        <div class="search-wrapper">
          <el-select
            v-model="selectUserId"
            class="mr-12 filter-select"
            @change="searchHandle"
            style="max-width: 240px; width: 150px"
          >
            <el-option
              v-for="item in userOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-input
            v-model="searchValue"
            @change="searchHandle"
            :placeholder="$t('views.application.searchBar.placeholder')"
            prefix-icon="Search"
            class="w-240 search-input"
            style="min-width: 240px"
            clearable
          />
        </div>
      </div>
    </div>
    <div v-loading.fullscreen.lock="paginationConfig.current_page === 1 && loading">
      <InfiniteScroll
        :size="applicationList.length"
        :total="paginationConfig.total"
        :page_size="paginationConfig.page_size"
        v-model:current_page="paginationConfig.current_page"
        @load="getList"
        :loading="loading"
      >
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6" class="mb-20">
            <el-card shadow="hover" class="application-card-add" style="--el-card-padding: 8px">
              <div class="card-add-button flex align-center cursor p-12" @click="openCreateDialog">
                <AppIcon iconName="app-add-application" class="mr-8 add-icon"></AppIcon>
                {{ $t('views.application.createApplication') }}
              </div>
              <el-divider style="margin: 8px 0" />
              <el-upload
                ref="elUploadRef"
                :file-list="[]"
                action="#"
                multiple
                :auto-upload="false"
                :show-file-list="false"
                :limit="1"
                :on-change="(file: any, fileList: any) => importApplication(file)"
                class="card-add-button"
              >
                <div class="flex align-center cursor p-12">
                  <AppIcon iconName="app-import" class="mr-8 import-icon"></AppIcon>
                  {{ $t('views.application.importApplication') }}
                </div>
              </el-upload>
            </el-card>
          </el-col>
          <el-col
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
            :xl="6"
            v-for="(item, index) in applicationList"
            :key="index"
            class="mb-20"
          >
            <CardBox
              :title="item.name"
              :description="item.desc"
              class="application-card cursor"
              @click="router.push({ path: `/application/${item.id}/${item.type}/overview` })"
            >
              <template #icon>
                <AppAvatar
                  v-if="isAppIcon(item?.icon)"
                  shape="square"
                  :size="40"
                  style="background: none"
                  class="mr-8 app-icon"
                >
                  <img :src="item?.icon" alt="" />
                </AppAvatar>
                <AppAvatar
                  v-else-if="item?.name"
                  :name="item?.name"
                  pinyinColor
                  shape="square"
                  :size="40"
                  class="mr-8 app-icon"
                />
              </template>
              <template #subTitle>
                <el-text class="color-secondary creator-info" size="small">
                  <auto-tooltip :content="item.username">
                    {{ $t('common.creator') }}: {{ item.username }}
                  </auto-tooltip>
                </el-text>
              </template>
              <div class="status-tag">
                <div v-if="isWorkFlow(item.type)" class="app-tag workflow-tag">
                  <el-icon class="tag-icon"><Connection /></el-icon>
                  <span class="tag-text">{{ $t('views.application.workflow') }}</span>
                </div>
                <div v-else class="app-tag simple-tag">
                  <el-icon class="tag-icon"><Document /></el-icon>
                  <span class="tag-text">{{ $t('views.application.simple') }}</span>
                </div>
              </div>

              <template #footer>
                <div class="footer-content">
                  <span @click.stop class="dropdown-container">
                    <el-dropdown trigger="click">
                      <el-button text class="action-button" @click.stop>
                        <el-icon><MoreFilled /></el-icon>
                      </el-button>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item @click="getAccessToken(item.id)">
                            <AppIcon iconName="app-view" class="dropdown-icon"></AppIcon>
                            {{ $t('views.application.setting.demo') }}
                          </el-dropdown-item>
                          <el-dropdown-item @click="settingApplication(item)">
                            <AppIcon iconName="Setting" class="dropdown-icon"></AppIcon>
                            {{ $t('common.setting') }}
                          </el-dropdown-item>
                          <el-dropdown-item
                            v-if="is_show_copy_button(item)"
                            @click="copyApplication(item)"
                          >
                            <AppIcon iconName="app-copy" class="dropdown-icon"></AppIcon>
                            {{ $t('common.copy') }}
                          </el-dropdown-item>
                          <el-dropdown-item @click.stop="exportApplication(item)">
                            <AppIcon iconName="app-export" class="dropdown-icon"></AppIcon>
                            {{ $t('common.export') }}
                          </el-dropdown-item>
                          <el-dropdown-item icon="Delete" @click.stop="deleteApplication(item)">
                            {{ $t('common.delete') }}
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </span>
                </div>
              </template>
            </CardBox>
          </el-col>
        </el-row>
      </InfiniteScroll>
    </div>
    <CreateApplicationDialog ref="CreateApplicationDialogRef" />
    <CopyApplicationDialog ref="CopyApplicationDialogRef" />
  </div>
</template>
<script setup lang="ts">
  // <!-- 创建应用 -->

import { ref, onMounted, reactive } from 'vue'
import applicationApi from '@/api/application'
import CreateApplicationDialog from './component/CreateApplicationDialog.vue'
import CopyApplicationDialog from './component/CopyApplicationDialog.vue'
import { MsgSuccess, MsgConfirm, MsgAlert, MsgError } from '@/utils/message'
import { isAppIcon } from '@/utils/application'
import { useRouter } from 'vue-router'
import { isWorkFlow } from '@/utils/application'
import { ValidType, ValidCount } from '@/enums/common'
import { t } from '@/locales'
import useStore from '@/stores'

const elUploadRef = ref<any>()
const { application, user, common } = useStore()
const router = useRouter()

const CopyApplicationDialogRef = ref()
const CreateApplicationDialogRef = ref()
const loading = ref(false)

const applicationList = ref<any[]>([])

const paginationConfig = reactive({
  current_page: 1,
  page_size: 30,
  total: 0
})

interface UserOption {
  label: string
  value: string
}

const userOptions = ref<UserOption[]>([])

const selectUserId = ref('all')

const searchValue = ref('')

const apiInputParams = ref([])

function copyApplication(row: any) {
  application.asyncGetApplicationDetail(row.id, loading).then((res: any) => {
    if (res?.data) {
      CopyApplicationDialogRef.value.open({ ...res.data, model_id: res.data.model })
    }
  })
}

const is_show_copy_button = (row: any) => {
  return user.userInfo ? user.userInfo.id == row.user_id : false
}

function settingApplication(row: any) {
  if (isWorkFlow(row.type)) {
    router.push({ path: `/application/${row.id}/workflow` })
  } else {
    router.push({ path: `/application/${row.id}/${row.type}/setting` })
  }
}

const exportApplication = (application: any) => {
  applicationApi.exportApplication(application.id, application.name, loading).catch((e) => {
    if (e.response.status !== 403) {
      e.response.data.text().then((res: string) => {
        MsgError(`${t('views.application.tip.ExportError')}:${JSON.parse(res).message}`)
      })
    }
  })
}
const importApplication = (file: any) => {
  const formData = new FormData()
  formData.append('file', file.raw, file.name)
  elUploadRef.value.clearFiles()
  applicationApi
    .importApplication(formData, loading)
    .then(async (res: any) => {
      if (res?.data) {
        searchHandle()
      }
    })
    .catch((e) => {
      if (e.code === 400) {
        MsgConfirm(t('common.tip'), t('views.application.tip.professionalMessage'), {
          cancelButtonText: t('common.confirm'),
          confirmButtonText: t('common.professional')
        }).then(() => {
          window.open('https://maxkb.cn/pricing.html', '_blank')
        })
      }
    })
}

function openCreateDialog() {
  common
    .asyncGetValid(ValidType.Application, ValidCount.Application, loading)
    .then(async (res: any) => {
      if (res?.data) {
        CreateApplicationDialogRef.value.open()
      } else if (res?.code === 400) {
        MsgConfirm(t('common.tip'), t('views.application.tip.professionalMessage'), {
          cancelButtonText: t('common.confirm'),
          confirmButtonText: t('common.professional')
        }).then(() => {
          window.open('https://maxkb.cn/pricing.html', '_blank')
        })
      }
    })
}

function searchHandle() {
  if (user.userInfo) {
    localStorage.setItem(user.userInfo.id + 'application', selectUserId.value)
  }
  applicationList.value = []
  paginationConfig.current_page = 1
  paginationConfig.total = 0
  getList()
}

function mapToUrlParams(map: any[]) {
  const params = new URLSearchParams()

  map.forEach((item: any) => {
    params.append(encodeURIComponent(item.name), encodeURIComponent(item.value))
  })

  return params.toString() // 返回 URL 查询字符串
}

function getAccessToken(id: string) {
  applicationList.value
    .filter((app) => app.id === id)[0]
    ?.work_flow?.nodes?.filter((v: any) => v.id === 'base-node')
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

  const apiParams = mapToUrlParams(apiInputParams.value)
    ? '?' + mapToUrlParams(apiInputParams.value)
    : ''
  application.asyncGetAccessToken(id, loading).then((res: any) => {
    window.open(application.location + res?.data?.access_token + apiParams)
  })
}

function deleteApplication(row: any) {
  MsgConfirm(
    // @ts-ignore
    `${t('views.application.delete.confirmTitle')}${row.name} ?`,
    t('views.application.delete.confirmMessage'),
    {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      confirmButtonClass: 'danger'
    }
  )
    .then(() => {
      applicationApi.delApplication(row.id, loading).then(() => {
        const index = applicationList.value.findIndex((v) => v.id === row.id)
        applicationList.value.splice(index, 1)
        MsgSuccess(t('common.deleteSuccess'))
      })
    })
    .catch(() => {})
}

function getList() {
  const params = {
    ...(searchValue.value && { name: searchValue.value }),
    ...(selectUserId.value &&
      selectUserId.value !== 'all' && { select_user_id: selectUserId.value })
  }
  applicationApi.getApplication(paginationConfig, params, loading).then((res) => {
    res.data.records.forEach((item: any) => {
      if (user.userInfo && item.user_id === user.userInfo.id) {
        item.username = user.userInfo.username
      } else {
        item.username = userOptions.value.find((v) => v.value === item.user_id)?.label
      }
    })
    applicationList.value = [...applicationList.value, ...res.data.records]
    paginationConfig.total = res.data.total
  })
}

function getUserList() {
  applicationApi.getUserList('APPLICATION', loading).then((res) => {
    if (res.data) {
      userOptions.value = res.data.map((item: any) => {
        return {
          label: item.username,
          value: item.id
        }
      })
      if (user.userInfo) {
        const selectUserIdValue = localStorage.getItem(user.userInfo.id + 'application')
        if (selectUserIdValue && userOptions.value.find((v) => v.value === selectUserIdValue)) {
          selectUserId.value = selectUserIdValue
        }
      }
      getList()
    }
  })
}

onMounted(() => {
  getUserList()
})
</script>
<style lang="scss" scoped>
.application-list-container {
  background-color: var(--el-bg-color);
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 24px; /* 增加标题下方间距 */
}

.filter-select, .search-input {
  border-radius: 8px;
  
  :deep(.el-input__wrapper) {
    box-shadow: 0 0 0 1px var(--el-border-color-light) inset;
  }
}

.application-card-add {
  width: 100%;
  font-size: 14px;
  min-height: var(--card-min-height);
  border: 1px dashed rgba(80, 181, 167, 0.4);
  background: rgba(80, 181, 167, 0.05);
  border-radius: 15px;
  box-sizing: border-box;
  transition: all 0.3s ease;
  margin-bottom: 10px;

  &:hover {
    border: 1px solid rgba(80, 181, 167, 0.7);
    background-color: rgba(80, 181, 167, 0.1);
    
    .add-icon, .import-icon {
      color: rgb(80, 181, 167);
    }
  }

  .card-add-button {
    border-radius: 8px;
    transition: all 0.2s ease;
    padding: 16px 12px;
    
    &:hover {
      background: rgba(80, 181, 167, 0.15);
    }

    :deep(.el-upload) {
      display: block;
      width: 100%;
      color: var(--el-text-color-regular);
    }
  }
}

.application-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(12, 143, 25, 0.05);
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  }
  
  .app-icon {
    border-radius: 8px;
    overflow: hidden;
    margin-right: 12px; /* 增加图标右侧间距 */
  }
  
  .creator-info {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-top: 8px; /* 增加创建者信息上方间距 */
    margin-bottom: 8px; /* 增加创建者信息下方间距 */
  }

  .status-tag {
    position: absolute;
    right: 16px;
    top: 15px;
    
    .app-tag {
      display: inline-flex;
      align-items: center;
      padding: 4px 8px;
      height: 24px;
      font-size: 12px;
      border-radius: 5px;
      
      .tag-icon {
        font-size: 14px;
        margin-right: 4px;
        display: flex;
        align-items: center;
        height: 100%;
        
        :deep(svg) {
          width: 14px;
          height: 14px;
        }
      }
      
      .tag-text {
        line-height: 14px;
        display: inline-flex;
        align-items: center;
        height: 100%;
      }
    }
    
    .workflow-tag {
      background-color: rgba(80, 181, 167, 0.1);
      color: rgb(80, 181, 167);
      border-color: rgba(80, 181, 167, 0.2);
    }
    
    .simple-tag {
      background-color: rgba(80, 181, 167, 0.1);
      color: rgb(80, 181, 167);
      border-color: rgba(80, 181, 167, 0.2);
    }
  }
  
  .footer-content {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-top: 12px;
    padding-top: 8px;
    border-top: 1px solid rgba(35, 73, 68, 0.1);
    
    .dropdown-container {
      margin-left: auto; /* 将下拉菜单推到右侧 */
    }
    
    .action-button {
      padding: 6px;
      border-radius: 4px;
      
      &:hover {
        background-color: rgba(80, 181, 167, 0.1);
        color: rgb(80, 181, 167);
      }
    }
  }
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  
  .dropdown-icon {
    margin-right: 8px;
    font-size: 16px;
  }
  
  &:hover {
    background-color: rgba(80, 181, 167, 0.1);
    color: rgb(80, 181, 167);
  }
}

.dropdown-custom-switch {
  padding: 5px 11px;
  font-size: 14px;
  font-weight: 400;

  span {
    margin-right: 26px;
  }
}

:deep(.el-card__body) {
  padding: 20px; /* 增加卡片内部间距 */
}

:deep(.el-divider--horizontal) {
  margin: 16px 0; /* 增加分隔线上下间距 */
}

/* 增加行间距 */
.el-row {
  margin-bottom: 24px !important;
}

/* 增加列间距 */
.el-col {
  margin-bottom: 24px !important;
}

/* 调整卡片内容间距 */
:deep(.card-box-content) {
  padding: 16px 0;
}

:deep(.card-box-title) {
  margin-bottom: 12px;
}

:deep(.card-box-description) {
  margin-top: 12px;
  margin-bottom: 16px;
  line-height: 1.6; /* 增加描述文本的行高 */
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  padding: 16px 24px;
  background: linear-gradient(135deg, rgba(80, 181, 167, 0.05) 0%, rgba(80, 181, 167, 0.1) 100%);
  border-radius: 16px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(28, 57, 53, 0.1);
  box-shadow: 0 4px 24px -8px rgba(80, 181, 167, 0.15);

  .title-section {
    position: relative;
    
    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin: 0;
      position: relative;
      z-index: 1;
      
      &::after {
        content: '';
        position: absolute;
        bottom: -4px;
        left: 0;
        width: 40%;
        height: 3px;
        background: linear-gradient(90deg, rgb(80, 181, 167) 0%, rgba(80, 181, 167, 0.2) 100%);
        border-radius: 2px;
      }
    }

    .title-decoration {
      position: absolute;
      top: 50%;
      left: -12px;
      transform: translateY(-50%);
      width: 24px;
      height: 24px;
      background: linear-gradient(135deg, rgba(80, 181, 167, 0.2) 0%, rgba(80, 181, 167, 0.05) 100%);
      border-radius: 6px;
      z-index: 0;
    }
  }

  .search-section {
    .search-wrapper {
      display: flex;
      gap: 12px;
      padding: 4px;
      background: rgba(255, 255, 255, 0.6);
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(80, 181, 167, 0.08);
      
      .filter-select, .search-input {
        border-radius: 8px;
        transition: all 0.3s ease;
        
        :deep(.el-input__wrapper) {
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 0 0 1px rgba(80, 181, 167, 0.1) inset;
          backdrop-filter: blur(4px);
          
          &:hover {
            box-shadow: 0 0 0 1px rgba(80, 181, 167, 0.3) inset;
          }
          
          &:focus-within {
            box-shadow: 0 0 0 1px rgb(80, 181, 167) inset;
          }
        }
        
        :deep(.el-input__inner) {
          &::placeholder {
            color: rgba(0, 0, 0, 0.4);
          }
        }
      }
    }
  }

  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: 20px;
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, rgb(80, 181, 167), transparent);
    border-radius: 0 0 3px 3px;
  }
}
</style>
