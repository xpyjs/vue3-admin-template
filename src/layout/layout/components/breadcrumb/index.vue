<template>
  <el-breadcrumb class="XBreadcrumb" separator="/">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item v-for="item in levelList" :key="item.path"
        >{{ $t(item.meta?.title || '') }}
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const levelList = ref<AppRouteConfig[]>([]);

function getBreadcrumb() {
  let matched = route.matched.filter(
    item => item.meta && item.meta.title
  ) as AppRouteConfig[];

  const _m = matched.filter(
    item => item.meta && item.meta.title && item.meta.breadcrumb !== false
  );

  // 去重，去掉 meta.title 相同的路由
  levelList.value = _m.filter((item, index) => {
    return (
      _m.findIndex(_item => _item.meta?.title === item.meta?.title) === index
    );
  });
}

watchEffect(() => {
  // if you go to the redirect page, do not update the breadcrumbs
  if (route.path.startsWith('/redirect')) {
    return;
  }
  getBreadcrumb();
});
getBreadcrumb();
</script>

<style lang="scss" scoped>
.XBreadcrumb.el-breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 50px;
  margin-left: 8px;

  .el-breadcrumb__item + .el-breadcrumb__item {
    :deep(.el-breadcrumb__inner) {
      font-weight: 600;
    }
  }
}

.breadcrumb-enter-active,
.breadcrumb-leave-active {
  transition: all 0.3s;
}

.breadcrumb-enter,
.breadcrumb-leave-active {
  opacity: 0;
  transform: translateX(20px);
}

.breadcrumb-move {
  transition: all 0.3s;
}

.breadcrumb-leave-active {
  position: absolute;
}
</style>
