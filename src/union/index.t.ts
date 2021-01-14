import { union } from "./index";
import { store } from "../store";

const strApi = store({
  init: "",
  api: ({ getState, setState }) => ({
    getValue: getState,
    setValue: setState,
  }),
});

const numApi = store({
  init: 0,
  api: ({ getState, setState }) => ({
    getValue: getState,
    setValue: setState,
  }),
});

const userApi = union({
  depends: { name: strApi, age: numApi },
});

const user = userApi({ name: "user", init: { name: "", age: 0 } });

user.depends.name.on((setValue) => {});
user.depends.name.off(() => {});
user.depends.name.api.setValue.before.on(({ params }) => {});
user.depends.name.api.setValue.before.off(() => {});
user.depends.name.api.setValue.after.on(({ params }) => {});
user.depends.name.api.setValue.after.off(() => {});
user.depends.name.api.setValue.call("Bob");
user.depends.name.getState();
user.on((value) => {});
user.off(() => {});
user.getState();
