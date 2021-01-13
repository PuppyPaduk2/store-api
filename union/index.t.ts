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

user.depends.name.setValue("Bob");
user.depends.age.setValue(12);
user.depends.name().on((value) => {});
user.depends.age().on((value) => {});
user.on((value) => {});
