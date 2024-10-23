import useDictStore from '@/store/modules/dict';
import { getDicts } from '@/api/system/dict/data';
import { ComputedRef, computed } from 'vue';
import { uuid } from '@/utils';

/**
 * 获取字典数据
 */
export function useDict<T = string>(
  dictType: string,
  converter?: (value: string) => T
): Record<string, ComputedRef<IDictValue<T>[]>> & {
  reload: () => void;
} {
  return (() => {
    function getDict() {
      getDicts(dictType).then(resp => {
        useDictStore().setDict(
          dictType,
          resp.data.map((p: any) => {
            const id = uuid();
            return {
              label: p.dictLabel,
              value:
                converter && typeof converter === 'function'
                  ? converter(p.dictValue)
                  : `${p.dictValue}`,
              elTagType: p.listClass,
              elTagClass: p.cssClass,
              picture: p.picture,
              key: id,
              id
            };
          })
        );
      });
    }

    const dicts = useDictStore().getDict(dictType);
    if (!dicts) {
      getDict();
    }

    const { dict } = useDictStore();

    return {
      [dictType]: computed(() => dict(dictType) || []),
      reload: () => {
        useDictStore().removeDict(dictType);
        getDict();
      }
    } as any;
  })();
}
