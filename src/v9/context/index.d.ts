import { StoreApi, StoreInstance, ConfigApi } from "../store";
import { DependApi, StoreShape } from "../depend";

export function rootContext<Result = void>(
  callback: () => Result
): Result;

export type ContextScope = <Result = void>(
  callback: () => Result
) => Result;

export function context(): ContextScope;

export function attachStore<
  State,
  Api extends ConfigApi<State>
>(
  name: string,
  storeApi: StoreApi<State, Api>,
  state?: State
): StoreInstance<State, Api>;

export function attachDepend<
  Stores extends StoreShape,
  HandlerResult = void
>(dependApi: DependApi<Stores, HandlerResult>): Promise<HandlerResult>;

export type SerializedContext = { stores: { [key: string]: any } };

export function serializeContext(contextScope?: ContextScope): SerializedContext;

export function deserializeContext(payload: {
  context?: ContextScope,
  data: SerializedContext,
}): ContextScope
