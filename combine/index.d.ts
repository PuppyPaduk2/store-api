import { Store, StoreState } from "../store";

export type ShapeApiBase = {
  [Key: string]: Store<any, any>;
};

export type ShapeState<Shape extends ShapeApiBase> = {
  [Key in keyof Shape]: StoreState<Shape[Key]>;
};

export type Combined<ShapeApi extends ShapeApiBase> = (payload: {
  name: string;
  init?: ShapeState<ShapeApi>;
}) => {
  [Key in keyof ShapeApi]: ReturnType<ShapeApi[Key]>;
} & {
  (): {
    on: (callback: (state: ShapeState<ShapeApi>) => void) => void;
    off: (callback: (state: ShapeState<ShapeApi>) => void) => void;
  };
};

export function combine<ShapeApi extends ShapeApiBase>(payload: {
  init: ShapeState<ShapeApi>;
  api: ShapeApi;
}): Combined<ShapeApi>;
