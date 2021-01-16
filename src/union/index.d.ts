import { StorePublicState, UnionPublic } from "../core/context";
import { StoreCreator } from "../store";

export type UnionCreator<
  Depends extends { [key: string]: StoreCreator<any, any> }
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
  Depends extends { [key: string]: StoreCreator<any, any> }
>(payload: { depends: Depends }): UnionCreator<Depends>;
