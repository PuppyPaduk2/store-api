import { store } from "./index";

const str = store({
  init: "",
  api: ({ getState, setState }) => ({ setValue: setState, getValue: getState }),
});

const num = store({
  init: 0,
  api: ({ getState, setState }) => ({ setValue: setState, getValue: getState }),
});

const user = store({
  init: { name: "", age: 0 },
  api: ({ getState, setState }) => ({
    setName: (name: string) => setState({ ...getState(), name }),
    setAge: (age: number) => setState({ ...getState(), age }),
  }),
});

const name = str({ name: "name" });

const age = num({ name: "age" });

const currentUser = user({ name: "current-user" });

name.api.setValue.before.on(({ params }) => {});
name.api.setValue.before.off(() => {});
name.api.setValue.after.on(({ params }) => {});
name.api.setValue.after.off(() => {});
name.api.setValue.call("Bob");
name.on((setValue) => {});
name.off(() => {});
name.getState();

age.api.setValue.before.on(({ params }) => {});
age.api.setValue.before.off(() => {});
age.api.setValue.after.on(({ params }) => {});
age.api.setValue.after.off(() => {});
age.api.setValue.call(10);
age.on((setValue) => {});
age.off(() => {});
age.getState();

currentUser.api.setName.before.on(({ params }) => {});
currentUser.api.setName.before.off(() => {});
currentUser.api.setName.after.on(({ params }) => {});
currentUser.api.setName.after.off(() => {});
currentUser.api.setName.call("Bob");
currentUser.api.setAge.call(10);
currentUser.on((setValue) => {});
currentUser.off(() => {});
currentUser.getState();
