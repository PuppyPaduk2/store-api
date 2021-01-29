import { store } from "../store";
import { depend } from "../depend";

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
  },
});

const defaultAge = depend({
  stores: { age: numberApi },
  handler: ({ age }) => {
    age.api.set(10);
  },
  name: "default-age",
});

const defaultNameStore = defaultName(({ stores }) => stores.name);
const defaultAgeStore = defaultAge(({ stores }) => stores.age);

const name = defaultNameStore(({ api }) => api({
  setState: () => "",
  getState: () => "",
  reset: () => "",
}));

const age = defaultAgeStore(({ api }) => api({
  setState: () => 0,
  getState: () => 0,
  reset: () => 0,
}));

name.set("");
name.reset();

age.set(10);
age.inc();
age.dec();
age.reset();
