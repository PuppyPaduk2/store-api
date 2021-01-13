import { createContext } from "./index";

const app = createContext();

const appStores = app(() => {
  return {
    test: 1,
    test2: 2,
  };
});

const userName = app.addStore({
  name: "user-name",
  init: "",
  api: () => ({
    setValue: (value: string) => {},
    getValue: () => {},
  }),
});

userName.getState();

const userAge = app.addStore({
  name: "user-age",
  init: 0,
  api: () => ({
    setValue: (value: number) => {},
    getValue: () => {},
  }),
});

userAge.getState();

const user = app.addUnion({
  name: "user",
  depends: { name: userName, age: userAge },
});

user.depends.name.use.setValue("Bob");
user.depends.age.use.setValue(10);
user.listen.on((value) => {});
user.getState();
