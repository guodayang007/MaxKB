<template>
  <div class="card-add cursor" @click="$emit('click')">
    <div class="card-content">
      <div style="height: 5px;"></div>
      <div class="icon-wrapper">
        <AppIcon iconName="Plus" class="plus-icon" />
      </div>
      <span class="title">{{ title }}</span>
    </div>
    <div class="hover-effect"></div>
  </div>
</template>

<script setup lang="ts">
import { t } from '@/locales'
defineOptions({ name: 'CardAdd' })
defineProps({
  title: {
    type: String,
    default: t('common.title')
  }
})
</script>

<style lang="scss" scoped>
.card-add {
  width: 100%;
  min-height: var(--card-min-height);
  border-radius: 12px;
  border: 1px dashed rgba(80, 181, 167, 0.3);
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.9) 0%,
    rgba(255, 255, 255, 0.95) 100%
  );
  backdrop-filter: blur(8px);
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  .card-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 24px 24px;
    position: relative;
    z-index: 2;
  }

  .icon-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: rgba(80, 181, 167, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

    .plus-icon {
      font-size: 24px;
      color: rgb(80, 181, 167);
      transition: all 0.3s ease;
    }
  }

  .title {
    font-size: 16px;
    font-weight: 500;
    color: var(--el-text-color-regular);
    transition: color 0.3s ease;
  }

  .hover-effect {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg,
      rgba(80, 181, 167, 0.05),
      rgba(80, 181, 167, 0.02)
    );
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 1;
  }

  &:hover {
    transform: translateY(-2px);
    border-color: rgb(80, 181, 167);
    box-shadow: 0 8px 24px -4px rgba(80, 181, 167, 0.15);

    .hover-effect {
      opacity: 1;
    }

    .icon-wrapper {
      background: rgb(80, 181, 167);
      transform: scale(1.1);

      .plus-icon {
        color: white;
        transform: rotate(180deg);
      }
    }

    .title {
      color: rgb(80, 181, 167);
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
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
  }
}
</style>
