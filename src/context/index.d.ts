import { Context, SerializedContext } from "../core/context";

type ContextScope = <Result = void>(callback: () => Result) => Result;

export function context(): ContextScope;

export function getRootContextScope(): ContextScope;

export function getContextState(
  contextScope: Context["scope"]
): {
  stores: {
    [Key in keyof Context["stores"]]: Context["stores"][Key]["public"];
  };
  unions: {
    [Key in keyof Context["unions"]]: Context["unions"][Key]["public"];
  };
};

export function serializeContext(contextScope?: ContextScope): SerializedContext;

export function deserializeContext(
  serializedContext: SerializedContext,
  constexScope?: ContextScope
): void
