export type Method<Params extends Array<any>, Result = void> = (
  ...params: Params
) => Result | Promise<Result>;

export type StoreApi<State> = (payload: {
  getState: () => State;
  setState: (payload: State | ((prev: State) => State)) => State;
}) => {
  [Key: string]: Method<any, any>;
};

export type Store<State, Api extends StoreApi<State>> = {
  init: State;
  state: State;
  api: Api;
  listeners: {
    store: Set<(state: State) => void>;
    methods: {
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
  public: StorePublic<State, Api>;
};

export type StorePublic<State, Api extends StoreApi<State>> = {
  api: {
    [Key in keyof ReturnType<Api>]: {
      call: (
        ...params: Parameters<ReturnType<Api>[Key]>
      ) => ReturnType<ReturnType<Api>[Key]>;
      before: {
        on: (
          callback: (payload: {
            params: Parameters<ReturnType<Api>[Key]>;
          }) => void
        ) => void;
        off: (
          callback: (payload: {
            params: Parameters<ReturnType<Api>[Key]>;
          }) => void
        ) => void;
      };
      after: {
        on: (
          callback: (payload: {
            params: Parameters<ReturnType<Api>[Key]>;
            result: ReturnType<ReturnType<Api>[Key]>;
          }) => void
        ) => void;
        off: (
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
  getState: () => State;
};

export type StorePublicState<T> = T extends StorePublic<infer U, any> ? U : T;

export type Union<Depends extends { [key: string]: StorePublic<any, any> }> = {
  depends: Depends;
  listeners: {
    store: Set<(state: StorePublicState<Depends>) => void>;
  };
  public: UnionPublic<Depends>;
};

export type UnionPublic<
  Depends extends { [key: string]: StorePublic<any, any> }
> = {
  depends: Depends;
  on: (
    callback: (
      state: {
        [Key in keyof Depends]: StorePublicState<Depends[Key]>;
      }
    ) => void
  ) => void;
  off: (
    callback: (
      state: {
        [Key in keyof Depends]: StorePublicState<Depends[Key]>;
      }
    ) => void
  ) => void;
  getState: () => {
    [Key in keyof Depends]: StorePublicState<Depends[Key]>;
  };
};

export type Context = {
  scope: <Result = void>(callback: () => Result) => Result;

  stores: Record<string, Store<any, any>>;
  store: <State, Api extends StoreApi<State>>(payload: {
    name: string;
    init: State;
    api: Api;
  }) => StorePublic<State, Api>;
  setStoreState: (payload: { name: string; state: any }) => void;
  getStoreState: (payload: { name: string }) => any;

  unions: Record<string, Union<any>>;
  union: <Depends extends { [key: string]: StorePublic<any, any> }>(payload: {
    name: string;
    depends: Depends;
  }) => UnionPublic<Depends>;
  getUnionState: (payload: { name: string }) => any;
};

export function createContext(): Context;
