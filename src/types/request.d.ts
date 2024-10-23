declare interface IResponseBase {
  code: number;
  msg: string;
}

declare interface IResponsePage<T> extends IResponseBase {
  rows: T[];
  total: number;

  [key: string]: any;
}

declare interface IRequestBase {
  searchValue?: string;
  params?: Record<string, any>;
  pageNum?: number;
  pageSize?: number;

  [key: string]: any;
}
