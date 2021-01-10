export type ApiMethodPayload<Params, Data = any> = {
  params: Params;
  data: Data;
};

export type ApiMethod<Params = void, Result = void, Data = any> = (
  params: Params,
  next: (payload: Data | ((prev: Data) => Data)) => void
) => Result | Promise<Result>;

export type ApiMethodParams<T> = T extends ApiMethod<infer U, any> ? U : T;

export type ApiMethodResult<T> = T extends ApiMethod<any, infer U> ? U : T;

export type StoreApi<
  Data,
  Api extends {
    [Key: string]: ApiMethod<any, any, Data>;
  }
> = (payload: {
  name: string;
  init?: Data;
}) => {
  [Key in keyof Api]: (
    payload: ApiMethodParams<Api[Key]>
  ) => ApiMethodResult<Api[Key]>;
};

export function storeApi<
  Data,
  Api extends {
    [Key: string]: ApiMethod<any, any, Data>;
  }
>(payload: { init: Data; api: Api }): StoreApi<Data, Api>;