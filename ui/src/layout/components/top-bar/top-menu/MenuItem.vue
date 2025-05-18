<template>
  <div
    class="menu-item-container flex-center h-full"
    :class="[isActive ? 'active' : '', 'menu-hover-effect']"
    @click="router.push({ name: menu.name })"
  >
    <div class="menu-content">
      <div class="icon-wrapper">
        <el-icon class="nav-icon" :class="{'icon-active': isActive}">
          <component :is="getMenuIcon" />
        </el-icon>
      </div>
      <div class="title">{{ $t(menu.meta?.title as string) }}</div>
    </div>
    <div class="active-indicator"></div>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute, type RouteRecordRaw } from 'vue-router'
import { computed } from 'vue'
import { 
  Menu, 
  House, 
  Connection,
  Monitor,
  ChatDotRound,
  Setting,
  Document
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const props = defineProps<{
  menu: RouteRecordRaw
}>()

const isActive = computed(() => {
  const { name, path, meta } = route
  return (name == props.menu.name && path == props.menu.path) || meta?.activeMenu == props.menu.path
})

// 根据路由名称返回对应的图标
const getMenuIcon = computed(() => {
  switch (props.menu.name) {
    case 'home':
      return House
    case 'application':
      return Monitor
    case 'dataset':
      return Document
    case 'chat':
      return ChatDotRound
    case 'workflow':
      return Connection
    case 'setting':
      return Setting
    default:
      return Menu
  }
})
</script>

<style lang="scss" scoped>
.menu-item-container {
  margin-right: 28px;
  cursor: pointer;
  font-size: 15px;
  position: relative;
  padding: 0 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  .menu-content {
    display: flex;
    align-items: center;
    position: relative;
    z-index: 2;
  }

  .icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    margin-right: 6px;
    border-radius: 6px;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    background: transparent;
    
    .nav-icon {
      font-size: 18px;
      color: var(--el-text-color-regular);
      transition: all 0.3s ease;
      
      &.icon-active {
        color: rgb(80, 181, 167);
        transform: scale(1.1);
      }
    }
  }

  .title {
    font-weight: 500;
    transition: all 0.3s ease;
    background: linear-gradient(to right, rgb(80, 181, 167), rgb(80, 181, 167));
    background-size: 0 2px;
    background-position: 0 100%;
    background-repeat: no-repeat;
  }

  .active-indicator {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%) scaleX(0);
    width: 24px;
    height: 3px;
    background: linear-gradient(90deg,
      rgba(80, 181, 167, 0.5),
      rgb(80, 181, 167),
      rgba(80, 181, 167, 0.5)
    );
    border-radius: 3px 3px 0 0;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 0;
  }

  &:hover {
    .icon-wrapper {
      background: rgba(80, 181, 167, 0.1);
      transform: translateY(-2px);
      
      .nav-icon {
        color: rgb(80, 181, 167);
      }
    }
    
    .title {
      color: rgb(80, 181, 167);
      background-size: 100% 2px;
    }
  }

  &.active {
    color: rgb(80, 181, 167);
    
    .icon-wrapper {
      background: rgba(80, 181, 167, 0.1);
    }
    
    .title {
      color: rgb(80, 181, 167);
      background-size: 100% 2px;
    }
    
    .active-indicator {
      opacity: 1;
      transform: translateX(-50%) scaleX(1);
      box-shadow: 0 0 8px rgba(80, 181, 167, 0.2);
    }
  }
}

// 添加鼠标悬停特效
.menu-hover-effect {
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg,
      rgba(80, 181, 167, 0.08),
      rgba(80, 181, 167, 0.02)
    );
    border-radius: 8px;
    opacity: 0;
    transition: all 0.3s ease;
    z-index: 1;
  }
  
  &:hover::before {
    opacity: 1;
  }
}
</style>
