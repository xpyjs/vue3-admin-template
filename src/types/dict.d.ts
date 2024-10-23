declare interface IDictValue<T = any> {
  label: string;
  value: T;
  elTagType: string;
  elTagClass: string;
  key: string;
  id: string;
  picture?: string;

  [key: string]: any;
}
