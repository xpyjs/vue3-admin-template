import { SystemSymbolId } from './symbolId';

const SYSTEM_NAME = SystemSymbolId;

/** 缓存数据时用到的 Key */
class CacheKey {
  static readonly TOKEN = `${SYSTEM_NAME}-token-key`;
  static readonly ACTIVE_THEME_NAME = `${SYSTEM_NAME}-active-theme-name-key`;
  static readonly ACTIVE_LANG_NAME = `${SYSTEM_NAME}-active-lang-name-key`;
  static readonly ACTIVE_COLOR_SCHEME = `${SYSTEM_NAME}-active-color-scheme-key`;
  static readonly ACTIVE_FONT_SIZE = `${SYSTEM_NAME}-active-font-size-key`;
}

export default CacheKey;
