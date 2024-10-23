<template>
  <el-dropdown trigger="click" @command="handleCommand">
    <div class="flex items-center mr-16px cursor-pointer select-none">
      <div
        class="w-16px h-16px rounded-4px mr-4px"
        :style="{ backgroundColor: activeThemeName }"
      />
      <div class="text-14px lh-18px">
        {{ themeList.find(t => t.name === activeThemeName)?.title }}
      </div>
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="item in themeList"
          :key="item.name"
          :command="item.name"
        >
          <div class="flex items-center mr-16px">
            <div
              class="w-16px h-16px rounded-4px mr-12px"
              :style="{ backgroundColor: item.name }"
            />
            <div class="text-14px lh-18px">{{ item.title }}</div>
          </div>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import useMessage from '@/hooks/useMessage';
import { useTheme } from '@/hooks/useTheme';

const { activeThemeName, themeList } = useTheme();

function handleCommand(name: string) {
  activeThemeName.value = name;
  useMessage('messages.theme_change_success', 'success', {
    params: { name: themeList.find(t => t.name === name)?.title }
  });
}
</script>

<style scoped></style>
