import {
  StoreApi,
  StoreApiState,
  StoreApiApi,
  StoreInstance,
} from "../store";

export type StoreShape = {
  [nameStore: string]: StoreApi<any, any>
};

export type DependConfig<Stores extends StoreShape, Result = void> = {
  stores: Stores;
  handler: (payload: {
    [Key in keyof Stores]: StoreInstance<
      StoreApiState<Stores[Key]>,
      StoreApiApi<Stores[Key]>
    >;
  }) => Result;
  name?: string;
};

export type DependApi<
  Stores extends StoreShape,
  HandlerResult = void
> = <Result = void>(
  callback: (
    config: DependConfig<Stores, HandlerResult>
  ) => Result
) => Result;

export function depend<Stores extends StoreShape, Result = void>(
  config: DependConfig<Stores, Result>
): DependApi<Stores, Result>;

export type DependApiStores<T> = T extends DependApi<infer U, any> ? U : T;

export type DependApiHandlerResult<T> = T extends DependApi<any, infer U> ? U : T;
