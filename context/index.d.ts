export type ApiMethod<Params extends Array<any>, Result = void> = (
  ...params: Params
) => Result | Promise<Result>;

export type ApiBase<State> = (payload: {
  getState: () => State;
  setState: (payload: State | ((prev: State) => State)) => void;
}) => {
  [Key: string]: ApiMethod<any, any>;
};

type ApiMethods<State, Api extends ApiBase<State> = ApiBase<State>> = {
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

export type StorePublicApi<State, Api extends ApiBase<State>> = {
  name: string;
  use: ApiMethods<State, Api>;
  listen: {
    on: (callback: (state: State) => void) => void;
    off: (callback: (state: State) => void) => void;
  };
  getState: () => State;
};

export type StoreInstance<State, Api extends ApiBase<State>> = {
  config: Api;
  init: State;
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

type ShapeStoreApi = {
  [key: string]: StorePublicApi<any, any>;
};

type StorePublicApiState<T> = T extends StorePublicApi<infer U, any>
  ? U
  : never;

type UnionPublicApi<Depends extends ShapeStoreApi> = {
  name: string;
  depends: Depends;
  listen: {
    on: (
      callback: (
        state: {
          [Key in keyof Depends]: StorePublicApiState<Depends[Key]>;
        }
      ) => void
    ) => void;
    off: (
      callback: (
        state: {
          [Key in keyof Depends]: StorePublicApiState<Depends[Key]>;
        }
      ) => void
    ) => void;
  };
  getState: () => {
    [Key in keyof Depends]: StorePublicApiState<Depends[Key]>;
  };
};

type UnionInstance<Depends extends ShapeStoreApi> = {
  depends: Depends;
  init: {
    [Key in keyof Depends]: StorePublicApiState<Depends[Key]>;
  };
  listeners: {
    subscribers: Set<
      (
        state: {
          [Key in keyof Depends]: StorePublicApiState<Depends[Key]>;
        }
      ) => void
    >;
  };
  publicApi: UnionPublicApi<Depends>;
};

export type Context = {
  <Result = void>(callback: () => Result): Result;

  // @private
  stores: Record<string, StoreInstance<any, any>>;
  addStore: <State, Api extends ApiBase<State>>(payload: {
    name: string;
    init: State;
    api: Api;
  }) => StorePublicApi<State, Api>;
  setStoreState: (payload: { name: string; state: any }) => void;
  getStoreState: (payload: { name: string }) => any;

  unions: Record<string, UnionInstance<any>>;
  addUnion: <Depends extends ShapeStoreApi>(payload: {
    name: string;
    depends: Depends;
  }) => UnionPublicApi<Depends>;
  getUnionState: (payload: { name: string }) => any;
};

export function createContext(): Context;
