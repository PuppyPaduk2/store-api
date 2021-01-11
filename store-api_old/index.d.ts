// export type ApiMethodPayload<Params, Data = any> = {
//   params: Params;
//   data: Data;
// };

export type ApiMethod<Params extends Array<any>, Result = void> = (
  ...params: Params
) => Result | Promise<Result>;

// export type ApiMethodParams<T> = T extends ApiMethod<infer U, any> ? U : T;

// export type ApiMethodResult<T> = T extends ApiMethod<any, infer U> ? U : T;

export type StoreApi<
  Data,
  Api extends (payload: {
    data: () => Data;
    change: (payload: Data | ((prev: Data) => Data)) => void;
  }) => {
    [Key: string]: ApiMethod<any, any>;
  }
> = (payload: {
  name: string;
  init?: Data;
}) => {
  use: {
    [Key in keyof ReturnType<Api>]: {
      (...params: Parameters<ReturnType<Api>[Key]>): ReturnType<
        ReturnType<Api>[Key]
      >;
      on: {
        before: (
          callback: (payload: {
            params: Parameters<ReturnType<Api>[Key]>;
          }) => void
        ) => void;
        after: (
          callback: (payload: {
            params: Parameters<ReturnType<Api>[Key]>;
            result: ReturnType<ReturnType<Api>[Key]>;
          }) => void
        ) => void;
      };
      off: {
        before: (
          callback: (payload: {
            params: Parameters<ReturnType<Api>[Key]>;
          }) => void
        ) => void;
        after: (
          callback: (payload: {
            params: Parameters<ReturnType<Api>[Key]>;
            result: ReturnType<ReturnType<Api>[Key]>;
          }) => void
        ) => void;
      };
    };
  };
  listen: {
    on: (callback: (data: Data) => void) => void;
    off: (callback: (data: Data) => void) => void;
  };
};

export function storeApi<
  Data,
  Api extends (payload: {
    data: () => Data;
    change: (payload: Data | ((prev: Data) => Data)) => void;
  }) => {
    [Key: string]: ApiMethod<any, any>;
  }
>(payload: { init: Data; api: Api }): StoreApi<Data, Api>;
