import { store } from "../store";
import { depend } from "../depend";
import {
  rootContext,
  context,
  attachStore,
  attachDepend,
  serializeContext,
  deserializeContext,
} from "../context";

const stringApi = store({
  init: "",
  api: ({ setState, reset }) => ({
    set: (value: string) => setState(value),
    reset,
  }),
});

const numberApi = store({
  init: 0,
  api: ({ getState, setState, reset }) => ({
    set: (value: number) => setState(value),
    inc: () => setState(getState() + 1),
    dec: () => setState(prev => prev - 1),
    reset,
  }),
});

const defaultName = depend({
  stores: { name: stringApi },
  handler: ({ name }) => {
    name.api.set("Bob");
    return name.getState();
  },
});

const defaultAge = depend({
  stores: { age: numberApi },
  handler: ({ age }) => {
    age.api.set(10);
    age.api.inc();
  },
});

const rootStores = rootContext(() => {
  attachDepend(defaultName);
  attachDepend(defaultAge);

  return {
    name: attachStore("name", stringApi),
    age: attachStore("age", numberApi),
  };
});

const app = context();

const appStores = app(() => {
  attachDepend(defaultName);
  attachDepend(defaultAge);

  return {
    name: attachStore("name", stringApi),
    age: attachStore("age", stringApi),
  };
});

console.log(rootStores.age.getState());
console.log(rootStores.name.getState());

console.log(appStores.age.getState());
console.log(appStores.name.getState());

const serializedApp = serializeContext(app);

deserializeContext({ context: app, data: serializedApp });
