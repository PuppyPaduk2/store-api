import { ApiBase, StoreApi, StorePublicApi } from "../context";

export type StoreState<T> = T extends Store<infer X, any> ? X : T;

export type Store<State, Api extends ApiBase<State>> = (payload: {
  name: string;
  init?: State;
}) => ReturnType<StorePublicApi<State, Api>>;

export function store<State, Api extends ApiBase<State>>(
  payload: StoreApi<State, Api>
): Store<State, Api>;
