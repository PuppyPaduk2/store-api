import { ApiBase, StorePublicApi } from "../context";

export type StoreState<T> = T extends Store<infer X, any> ? X : T;

export type Store<State, Api extends ApiBase<State>> = (payload: {
  name: string;
  init?: State;
}) => StorePublicApi<State, Api>["use"] & {
  (): StorePublicApi<State, Api>["listen"] &
    Pick<StorePublicApi<State, Api>, "name" | "getState">;
};

export function store<State, Api extends ApiBase<State>>(payload: {
  init: State;
  ani: Api;
}): Store<State, Api>;
