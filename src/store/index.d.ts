import { StoreApi, StorePublic } from "../core/context";

export type Store<State, Api extends StoreApi<State>> = (payload: {
  name: string;
  init?: State;
}) => StorePublic<State, Api>;

export function store<State, Api extends StoreApi<State>>(payload: {
  init: State;
  api: Api;
}): Store<State, Api>;
