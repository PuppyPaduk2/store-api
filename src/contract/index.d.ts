import { StoreShape, DependApi, DependApiHandlerResult } from "../depend";
import { StoreInstance, StoreApiState, StoreApiApi } from "../store";
import { ContextScope } from "../context";

type DependShape<Stores extends StoreShape> = (
  depend: <
    StoreNames extends keyof Stores,
    DependStores extends {
      [Key in StoreNames]: StoreInstance<
        StoreApiState<Stores[Key]>,
        StoreApiApi<Stores[Key]>
      >;
    },
    HandlerResult = void
  >(payload: {
    stores: StoreNames[],
    handler: (stores: DependStores) => HandlerResult,
  }) => DependApi<
    { [Key in StoreNames]: Stores[Key] },
    HandlerResult
  >
) => {
  [dependName: string]: DependApi<any, any>;
};

export function contract<
  Stores extends StoreShape,
  Depends extends DependShape<Stores>
>(stores: Stores, options?: { depends: Depends }): {
  name: { [Key in keyof Stores]: string; };
  store: {
    [Key in keyof Stores]: (state?: StoreApiState<Stores[Key]>) => StoreInstance<
      StoreApiState<Stores[Key]>,
      StoreApiApi<Stores[Key]>
    >;
  };
  depend: {
    [Key in keyof ReturnType<Depends>]: () => void;
  };
  stores: <
    StoreNames extends keyof Stores = keyof Stores
  >(payload?: {
    use?: StoreNames[];
    state?: {
      [Key in StoreNames]?: StoreApiState<Stores[Key]>;
    };
  }) => () => {
    [Key in StoreNames]: StoreInstance<
      StoreApiState<Stores[Key]>,
      StoreApiApi<Stores[Key]>
    >;
  };
  depends: <
    DependNames extends keyof ReturnType<Depends> = keyof ReturnType<Depends>
  >(payload?: {
    use?: DependNames[];
  }) => () => {
    [Key in DependNames]: Promise<DependApiHandlerResult<ReturnType<Depends>[Key]>>;
  };
};
