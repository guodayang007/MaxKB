<template>
  <div class="top-bar-container border-b flex-between">
    <div class="flex-center h-full">
      <div class="app-title-container cursor" @click="router.push('/')">
        <div class="logo flex-center">
          <LogoFull />
        </div>
      </div>
    </div>
    <TopMenu></TopMenu>

    <div class="flex-center avatar">
      <!-- <el-button
        v-if="!user.isEnterprise()"
        link
        type="primary"
        @click="toUrl('https://maxkb.cn/pricing.html')"
        class="mr-8"
      >
        <AppIcon iconName="app-pricing" class="mr-8" style="font-size: 20px"></AppIcon>

        {{ $t('common.professional') }}
      </el-button> -->
      <!-- <el-tooltip
        effect="dark"
        :content="$t('layout.github')"
        placement="top"
        v-if="user.themeInfo?.showProject"
      >
        <AppIcon
          iconName="app-github"
          class="cursor color-secondary mr-8 ml-8"
          style="font-size: 20px"
          @click="toUrl(user.themeInfo?.projectUrl)"
        ></AppIcon>
      </el-tooltip> -->
      <!-- <el-tooltip
        effect="dark"
        :content="$t('layout.wiki')"
        placement="top"
        v-if="user.themeInfo?.showUserManual"
      >
        <AppIcon
          iconName="app-reading"
          class="cursor color-secondary mr-8 ml-8"
          style="font-size: 20px"
          @click="toUrl(user.themeInfo?.userManualUrl)"
        ></AppIcon>
      </el-tooltip> -->

      <!-- <el-tooltip
        effect="dark"
        :content="$t('layout.forum')"
        placement="top"
        v-if="user.themeInfo?.showForum"
      >
        <AppIcon
          iconName="app-help"
          class="cursor color-secondary mr-16 ml-8"
          style="font-size: 20px"
          @click="toUrl(user.themeInfo?.forumUrl)"
        ></AppIcon>
      </el-tooltip> -->


      <!-- <el-dropdown trigger="click" type="primary">
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="(lang, index) in langList"
              :key="index"
              :value="lang.value"
              @click="changeLang(lang.value)"
              >{{ lang.label }}</el-dropdown-item
            >
          </el-dropdown-menu>
        </template>
        <AppIcon
          iconName="app-translate"
          class="cursor color-secondary mr-16 ml-8"
          style="font-size: 20px"
        >
        </AppIcon>
      </el-dropdown> -->
      <Avatar></Avatar>
    </div>
  </div>
</template>

<script setup lang="ts">
import TopMenu from './top-menu/index.vue'
import Avatar from './avatar/index.vue'
import { useRouter } from 'vue-router'
// import { langList } from '@/locales/index'
// import { useLocale } from '@/locales/useLocale'

import useStore from '@/stores'
const { user } = useStore()
const router = useRouter()

// const { changeLocale } = useLocale()
// const changeLang = (lang: string) => {
//   changeLocale(lang)
// }
function toUrl(url: string) {
  window.open(url, '_blank')
}
</script>

<style lang="scss">
.top-bar-container {
  height: var(--app-header-height);
  box-sizing: border-box;
  padding: var(--app-header-padding);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(80, 181, 167, 0.1);
  position: relative;
  z-index: 100;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, 
      rgba(80, 181, 167, 0.2),
      rgba(80, 181, 167, 0.1) 50%,
      rgba(80, 181, 167, 0) 100%
    );
  }

  .app-title-container {
    margin-right: 45px;
    position: relative;
    padding: 0 12px;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(80, 181, 167, 0.08);
      border-radius: 8px;

      &::after {
        width: 24px;
        opacity: 1;
      }
    }

    &::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 2px;
      background: rgb(80, 181, 167);
      transition: all 0.3s ease;
      opacity: 0;
      border-radius: 2px;
    }

    .logo {
      height: 100%;
      padding: 8px 0;
    }
  }

  .avatar {
    position: relative;
    padding: 0 8px;
    height: 100%;
    
    &::before {
      content: '';
      position: absolute;
      left: -24px;
      top: 50%;
      transform: translateY(-50%);
      width: 1px;
      height: 24px;
      background: linear-gradient(to bottom,
        rgba(80, 181, 167, 0),
        rgba(80, 181, 167, 0.1) 50%,
        rgba(80, 181, 167, 0)
      );
    }
  }

  :deep(.el-button) {
    background: linear-gradient(135deg,
      rgba(80, 181, 167, 0.1),
      rgba(80, 181, 167, 0.05)
    );
    border: 1px solid rgba(80, 181, 167, 0.1);
    color: rgb(80, 181, 167);
    transition: all 0.3s ease;

    &:hover {
      background: linear-gradient(135deg,
        rgba(80, 181, 167, 0.15),
        rgba(80, 181, 167, 0.1)
      );
      border-color: rgba(80, 181, 167, 0.2);
      transform: translateY(-1px);
    }
  }

  :deep(.el-dropdown) {
    color: var(--el-text-color-regular);
  }

  .color-secondary {
    color: var(--el-text-color-secondary);
    transition: color 0.3s ease;

    &:hover {
      color: rgb(80, 181, 167);
    }
  }
}
</style>
