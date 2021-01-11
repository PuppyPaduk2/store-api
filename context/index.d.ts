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
  on: (callback: (state: State) => void) => void;
  off: (callback: (state: State) => void) => void;
};

export type Store<State, Api extends ApiBase<State>> = {
  api: { init: State; api: Api };
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

export type Context = {
  stores: Record<string, object>;
  addStore: <State, Api extends ApiBase<State>>(payload: {
    name: string;
    api: StoreApi<State, Api>;
  }) => StorePublicApi<State, Api>;
  setStoreState: (payload: { name: string; state: any }) => void;
  getStoreState: (payload: { name: string }) => any;
};

export function createContext(): Context;
