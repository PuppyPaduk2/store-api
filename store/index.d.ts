import { ApiBase, StoreApi, StorePublicApi } from "../context";

export function store<State, Api extends ApiBase<State>>(
  payload: StoreApi<State, Api>
): StorePublicApi<State, Api>["use"] & {
  (): Pick<StorePublicApi<State, Api>, "on" | "off">;
};
