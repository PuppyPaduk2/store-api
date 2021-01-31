import {
  StoreShape,
  DependApi,
  DependApiStores,
  DependApiHandlerResult,
} from "../../depend";
import {
  StoreInstance,
  StoreApiState,
  StoreApiApi,
} from "../../store";

export function contractStores<
  Stores extends StoreShape
>(config: Stores): {
  name: { [Key in keyof Stores]: string; };
  store: {
    [Key in keyof Stores]: (state?: StoreApiState<Stores[Key]>) => StoreInstance<
      StoreApiState<Stores[Key]>,
      StoreApiApi<Stores[Key]>
    >;
  };
  config: <StoreNames extends keyof Stores = keyof Stores>(
    use?: StoreNames[]
  ) => {
    [Key in StoreNames]: Stores[Key];
  };
  stores: <StoreNames extends keyof Stores = keyof Stores>(
    use?: StoreNames[]
  ) => (state?: {
    [Key in StoreNames]?: StoreApiState<Stores[Key]>;
  }) => {
    [Key in StoreNames]: StoreInstance<
      StoreApiState<Stores[Key]>,
      StoreApiApi<Stores[Key]>
    >;
  };
};

export type DependShape = {
  [key: string]: DependApi<any, any>;
};

export function contractDepends<
  Depends extends DependShape
>(config: Depends): {
  name: { [Key in keyof Depends]: string; };
  depend: {
    [Key in keyof Depends]: () => Promise<
      DependApiHandlerResult<Depends[Key]>
    >;
  };
  config: <DependNames extends keyof Depends = keyof Depends>(
    use?: DependNames[]
  ) => {
    [Key in DependNames]: Depends[Key];
  };
  depends: <DependNames extends keyof Depends = keyof Depends>(
    use?: DependNames[]
  ) => () => {
    [Key in DependNames]: Promise<
      DependApiHandlerResult<Depends[Key]>
    >;
  };
};
