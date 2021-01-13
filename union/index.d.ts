import { UnionPublicApi, ShapeStoreApi } from "../context";
import { Store, StoreState } from "../store";

type DependsBase = {
  [key: string]: Store<any, any>;
};

type StoreToStorePublicApi<STORE extends Store<any, any>> = {
  name: ReturnType<ReturnType<STORE>>["name"];
  use: ReturnType<STORE>;
  listen: {
    on: ReturnType<ReturnType<STORE>>["on"];
    off: ReturnType<ReturnType<STORE>>["off"];
  };
  getState: ReturnType<ReturnType<STORE>>["getState"];
};

export type Union<Depends extends DependsBase> = (payload: {
  name: string;
  init?: {
    [Key in keyof Depends]?: StoreState<Depends[Key]>;
  };
}) => {
  name: UnionPublicApi<
    {
      [Key in keyof Depends]: StoreToStorePublicApi<Depends[Key]>;
    }
  >["name"];
  depends: {
    [Key in keyof Depends]: ReturnType<Depends[Key]>;
  };
  on: UnionPublicApi<
    {
      [Key in keyof Depends]: StoreToStorePublicApi<Depends[Key]>;
    }
  >["listen"]["on"];
  off: UnionPublicApi<
    {
      [Key in keyof Depends]: StoreToStorePublicApi<Depends[Key]>;
    }
  >["listen"]["off"];
  getState: UnionPublicApi<
    {
      [Key in keyof Depends]: StoreToStorePublicApi<Depends[Key]>;
    }
  >["getState"];
};

export function union<Depends extends DependsBase>(payload: {
  depends: Depends;
}): Union<Depends>;
