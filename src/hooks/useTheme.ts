import { computed, ref, watchEffect } from 'vue';
import {
  getActiveThemeName,
  setActiveThemeName
} from '@/utils/cache/local-storage';
import { useDark } from './useDark';

const DEFAULT_THEME_NAME = '#b340dc';

/** 主题列表 */
const themeList: { title: string; name: ThemeName }[] = [
  {
    title: '紫色',
    name: DEFAULT_THEME_NAME
  },
  {
    title: '黄色',
    name: '#ffd400'
  },
  {
    title: '红色',
    name: '#ff4747'
  },
  {
    title: '深紫色',
    name: '#a594f9'
  },
  {
    title: '橙色',
    name: '#ff7a00'
  },
  {
    title: '绿色',
    name: '#00ba7c'
  }
];

/** 正在应用的主题名称 */
const activeThemeName = ref<ThemeName>(
  getActiveThemeName() || DEFAULT_THEME_NAME
);

const mix = (color1: string, color2: string, weight: number = 0.5): string => {
  let color = '#';
  for (let i = 0; i <= 2; i++) {
    const c1 = parseInt(color1.substring(1 + i * 2, 3 + i * 2), 16);
    const c2 = parseInt(color2.substring(1 + i * 2, 3 + i * 2), 16);
    const c = Math.round(c1 * weight + c2 * (1 - weight));
    color += c.toString(16).padStart(2, '0');
  }
  return color;
};

/** 设置主题 */
const setTheme = (value: ThemeName, isDark: boolean) => {
  activeThemeName.value = value;

  document.documentElement.style.setProperty('--el-color-primary', value);

  // 设置透明主色，用于对话框 overlay 背景
  document.documentElement.style.setProperty(
    '--el-color-primary-alpha',
    `${value}44`
  );
};

/** 初始化 */
const initTheme = () => {
  const { isDark } = useDark();
  // watchEffect 来收集副作用
  watchEffect(() => {
    const value = activeThemeName.value ?? DEFAULT_THEME_NAME;
    setActiveThemeName(value);
    setTheme(value, isDark.value);
  });
};

/** 主题 hook */
export function useTheme() {
  return {
    themeList,
    activeThemeName,
    initTheme,
    primaryColor: computed(() => activeThemeName.value)
  };
}
