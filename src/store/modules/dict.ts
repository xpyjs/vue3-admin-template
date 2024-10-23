import { defineStore } from 'pinia';

const useDictStore = defineStore('dict', {
  state: (): {
    dicts: Record<string, IDictValue[]>;
  } => ({
    dicts: {}
  }),
  getters: {
    dict: state => {
      return (_key: string | null) => {
        if (_key === null && _key === '') {
          return null;
        }
        try {
          if (typeof _key !== 'string') throw new Error('_key must be string');
          return state.dicts[_key];
        } catch (e) {
          return null;
        }
      };
    }
  },
  actions: {
    // 获取字典
    getDict(_key: string | null) {
      if (_key === null && _key === '') {
        return null;
      }
      try {
        if (typeof _key !== 'string') throw new Error('_key must be string');
        return this.dicts[_key];
      } catch (e) {
        return null;
      }
    },
    // 设置字典
    setDict(_key: string | null, value: any) {
      if (_key !== null && _key !== '') {
        this.dicts[_key] = value;
      }
    },
    // 删除字典
    removeDict(_key: any) {
      let flag = false;
      try {
        if (typeof _key !== 'string') throw new Error('_key must be string');
        delete this.dicts[_key];
        flag = true;
      } catch (e) {
        flag = false;
      }

      return flag;
    },
    // 清空字典
    cleanDict() {
      this.dicts = {};
    },
    // 初始字典
    initDict() {
      console.log('init');
    }
  }
});

export default useDictStore;
