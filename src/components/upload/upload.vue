<template>
  <el-upload
    class="w-full h-full relative x-upload"
    :action="url"
    :show-file-list="false"
    :accept="accept"
    :headers="{ Authorization: `Bearer ${token}` }"
    :name="type"
    :on-success="handleSuccess"
    :before-upload="handleBeforeUpload"
    v-loading.fullscreen.lock="loading"
    :element-loading-text="$t('messages.uploading')"
  >
    <slot v-if="$slots.default" />

    <div
      v-else
      ref="avatarRef"
      class="w-full h-full rounded-10% box-border overflow-hidden relative cursor-pointer flex justify-center items-center"
      :class="[
        {
          'b-1 b-dashed b-[var(--el-border-color)]': !imageUrl && !name
        },
        {
          'rounded-50%': shape === 'circle'
        }
      ]"
    >
      <template v-if="imageUrl || name">
        <XAvatar
          v-if="type === 'image'"
          :list="[{ url: imageUrl, name }]"
          :shape="shape"
          :size="size"
        />
        <video
          v-else-if="type === 'video'"
          :src="imageUrl"
          class="w-full h-full"
        />
      </template>
      <XIcon
        v-else
        name="svg-icon:base-image"
        :size="size / 2"
        color="var(--x-text-second-color)"
      />

      <template v-if="showClear">
        <transition name="el-fade-in">
          <div v-show="isHover && imageUrl" class="absolute top-4px right-4px">
            <XIcon
              name="svg-icon:assets-management-delete-role"
              size="16"
              class="cursor-pointer"
              @click.stop="
                () => {
                  imageUrl = '';
                  $emit('remove');
                }
              "
            />
          </div>
        </transition>
      </template>
    </div>
  </el-upload>
</template>

<script lang="ts" setup>
import useMessage from '@/hooks/useMessage';
import { useElementHover } from '@vueuse/core';
import { UploadProps } from 'element-plus';
import { PropType, computed, ref } from 'vue';
import XIcon from '../icon';
import XAvatar from '../avatar';
import { getToken } from '@/utils';
defineOptions({ name: 'XUpload' });

const props = defineProps({
  url: { type: String, required: true },
  showClear: { type: Boolean, default: true },
  type: { type: String as PropType<'image' | 'video'>, default: 'image' },
  beforeUpload: {
    type: Function as PropType<UploadProps['beforeUpload']>,
    default: () => true
  },
  shape: { type: String as PropType<'square' | 'circle'>, default: 'square' },
  name: String,
  size: { type: Number, default: 40 }
});

const accept = computed(() => {
  switch (props.type) {
    case 'video':
      return 'video/*';
    case 'image':
      return 'image/*';
    default:
      return '*/*';
  }
});

const token = getToken();

const imageUrl = defineModel<string>();
const emit = defineEmits(['remove', 'uploaded']);

const avatarRef = ref();
const isHover = useElementHover(avatarRef);

const handleSuccess: UploadProps['onSuccess'] = res => {
  loading.value = false;

  // 如果成功，res 就是地址，否则就是错误信息
  if (res.msg) {
    useMessage(res.msg, 'error', { i18n: false });
  } else {
    imageUrl.value = res;
    emit('uploaded', res);
  }
};

const loading = ref(false);
const handleBeforeUpload: UploadProps['beforeUpload'] = file => {
  return Promise.resolve(props.beforeUpload(file)).then(res => {
    if (res) {
      loading.value = true;
    }
    return res;
  });
};
</script>

<style scoped lang="scss">
.x-upload {
  :deep(.el-upload) {
    width: 100%;
    height: 100%;
  }
}
</style>
