import { StorePublicState, UnionPublic } from "../core/context";
import { Store } from "../store";

export type Union<
  Depends extends { [key: string]: Store<any, any> }
> = (payload: {
  name: string;
  init?: {
    [Key in keyof Depends]: StorePublicState<ReturnType<Depends[Key]>>;
  };
}) => UnionPublic<
  {
    [Key in keyof Depends]: ReturnType<Depends[Key]>;
  }
>;

export function union<
  Depends extends { [key: string]: Store<any, any> }
>(payload: { depends: Depends }): Union<Depends>;
