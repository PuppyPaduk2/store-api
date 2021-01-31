import { context, attachStore, attachDepend } from "./src/context";
import { store } from "./src/store";
import { depend } from "./src/depend";

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

const initName = depend({
  stores: { name: stringApi },
  handler: ({ name }) => name.api.set("Bob"),
});

const initAge = depend({
  stores: { age: numberApi },
  handler: ({ age }) => age.api.set(10),
});

const initAlise = depend({
  stores: { name: stringApi, age: numberApi },
  handler: ({ name, age }) => ({
    name: name.api.set("Alise"),
    age: age.api.set(5),
  }),
});

const appDepends = () => ({
  initName: attachDepend(initName),
  initAge: attachDepend(initAge),
  initAlise: attachDepend(initAlise),
  initBoth: {
    name: attachDepend(initName),
    age: attachDepend(initAge),
  },
});

const appStores = () => ({
  name: attachStore("name", stringApi),
  age: attachStore("age", numberApi),
});

const app = context();

app(appDepends);
app(appStores);
