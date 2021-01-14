import { createContext } from "./index";

const app = createContext();

const userName = app.store({
  name: "user-name",
  init: "",
  api: ({ getState, setState }) => ({
    change: (value: string) => setState(value),
    value: () => getState(),
  }),
});

const userAge = app.store({
  name: "user-age",
  init: 0,
  api: ({ getState, setState }) => ({
    change: (value: number) => setState(value),
    value: () => getState(),
  }),
});

const user = app.union({
  name: "user",
  depends: { name: userName, age: userAge },
});

const tokens = app.store({
  name: "tokens",
  init: { main: "", refresh: "" },
  api: ({ getState, setState }) => ({
    signIn: () => Promise.resolve({ main: "1", refresh: "2" }).then(setState),
    signOut: () => {},
    main: () => getState().main,
    refresh: () => getState().refresh,
  }),
});

userName.on((value) => {});
userName.off(() => {});
userName.api.change.before.on((value) => {});
userName.api.change.before.off(() => {});
userName.api.change.call("Alise");
userName.getState();

user.on((value) => {});
user.off(() => {});
user.depends.name.api.change.call("Bob");
user.depends.age.api.change.call(10);
user.getState();

tokens.api.signIn.before.on((value) => {});
tokens.api.signIn.after.on(({ result }) =>
  result.then(({ main, refresh }) => {})
);
tokens.api.signIn.call().then(({ main, refresh }) => {});
