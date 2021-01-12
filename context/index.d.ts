export type ApiMethod<Params extends Array<any>, Result = void> = (
  ...params: Params
) => Result | Promise<Result>;

export type ApiBase<State> = (payload: {
  getState: () => State;
  setState: (payload: State | ((prev: State) => State)) => void;
}) => {
  [Key: string]: ApiMethod<any, any>;
};

export type StoreApi<State, Api extends ApiBase<State>> = {
  init: State;
  api: Api;
};

export type StorePublicApi<State, Api extends ApiBase<State>> = {
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
    on: (callback: (state: State) => void) => void;
    off: (callback: (state: State) => void) => void;
  };
};

export type StoreInstance<State, Api extends ApiBase<State>> = {
  config: Api;
  state: State;
  listeners: {
    subscribers: Set<(state: State) => void>;
    use: {
      [Key in keyof ReturnType<Api>]: {
        before: Set<
          (payload: { params: Parameters<ReturnType<Api>[Key]> }) => void
        >;
        after: Set<
          (payload: {
            params: Parameters<ReturnType<Api>[Key]>;
            result: ReturnType<ReturnType<Api>[Key]>;
          }) => void
        >;
      };
    };
  };
  publickApi: StorePublicApi<State, Api>;
};

export type ShapeStorePublicApi = {
  [Key: string]: StorePublicApi<any, any>;
};

export type StorePublicApiState<T> = T extends StorePublicApi<infer U, any>
  ? U
  : T;

export type ShapeStorePublicApiState<ShapeApi extends ShapeStorePublicApi> = {
  [Key in keyof ShapeApi]: StorePublicApiState<ShapeApi[Key]>;
};

export type CombineInstance<ShapeApi extends ShapeStorePublicApi> = {
  api: ShapeApi;
  publicApi: CombinePublicApi<ShapeApi>;
};

export type CombinePublicApi<ShapeApi extends ShapeStorePublicApi> = {
  use: {
    [Key in keyof ShapeApi]: ShapeApi[Key];
  };
  listen: {
    on: (callback: (state: ShapeStorePublicApiState<ShapeApi>) => void) => void;
    off: (
      callback: (state: ShapeStorePublicApiState<ShapeApi>) => void
    ) => void;
  };
};

export type Context = {
  <Result = void>(callback: () => Result): Result;

  // Private
  stores: Record<string, object>;
  addStore: <State, Api extends ApiBase<State>>(payload: {
    name: string;
    init: State;
    api: Api;
  }) => StorePublicApi<State, Api>;
  setStoreState: (payload: { name: string; state: any }) => void;
  getStoreState: (payload: { name: string }) => any;

  combinations: Record<string, CombineInstance<any>>;
  addCombine: <ShapeApi extends ShapeStorePublicApi,  Api extends ApiBase<ShapeStorePublicApiState<ShapeApi>>(payload: {
    name: string;
    depends: ShapeApi;
    init: ShapeStorePublicApiState<ShapeApi>;
    api: Api;
  }) => CombinePublicApi<ShapeApi>;
};

export function createContext(): Context;
