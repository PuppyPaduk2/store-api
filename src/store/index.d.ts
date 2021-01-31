export type ConfigApiMethod<Params extends Array<any>, Result = void> = (
  ...params: Params
) => Result | Promise<Result>;

export type ConfigApiMethodShape = {
  [Key: string]: ConfigApiMethod<any, any>;
};

export type ConfigApi<
  State,
  Api extends ConfigApiMethodShape = ConfigApiMethodShape
> = (payload: {
  getState: () => State;
  setState: (payload: State | ((prev: State) => State)) => State;
  reset: () => State;
}) => Api;

export type StoreConfig<State, Api extends ConfigApi<State>> = {
  init: State;
  api: Api;
};

export type StoreApi<State, Api extends ConfigApi<State>> = <Result = void>(
  callback: (config: StoreConfig<State, Api>) => Result
) => Result;

export function store<
  State,
  Api extends ConfigApi<State>
>(config: StoreConfig<State, Api>): StoreApi<State, Api>;

export type StoreInstance<
  State,
  Api extends ConfigApi<State>
> = {
  getState: () => State;
  on: (callback: (state: State) => void) => void;
  off: (callback: (state: State) => void) => void;
  api: {
    [Key in keyof ReturnType<Api>]: (
      ...params: Parameters<ReturnType<Api>[Key]>
    ) => ReturnType<ReturnType<Api>[Key]>;
  };
  listen: {
    [Key in keyof ReturnType<Api>]: {
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
    }
  };
}

export type StoreApiState<T> = T extends StoreApi<infer U, any> ? U : T;

export type StoreApiApi<T> = T extends StoreApi<any, infer U> ? U : T;

export type StoreInstanceByApi<T extends StoreApi<any, any>> = StoreInstance<
  StoreApiState<T>,
  StoreApiApi<T>
>;
