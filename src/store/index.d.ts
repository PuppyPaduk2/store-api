import { StoreApi, StorePublic } from "../core/context";

export type StoreCreator<State, Api extends StoreApi<State>> = (payload: {
  name: string;
  init?: State;
}) => StorePublic<State, Api>;

export function store<State, Api extends StoreApi<State>>(payload: {
  init: State;
  api: Api;
}): StoreCreator<State, Api>;
