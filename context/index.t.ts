import { createContext } from "./index";

const app = createContext();

const appStores = app(() => {
  return {
    test: 1,
    test2: 2,
  };
});

const user = app.addStore({
  name: "user",
  init: { name: "", age: 0 },
  api: () => ({}),
});

const userName = app.addStore({
  name: "user-name",
  init: "",
  api: () => ({
    setValue: (value: string) => {},
    getValue: () => {},
  }),
});

const userAge = app.addStore({
  name: "user-age",
  init: 0,
  api: () => ({
    setValue: (value: number) => {},
    getValue: () => {},
  }),
});

const userCombined = app.addCombine({
  name: "user-combined",
  init: { name: "", age: 0 },
  depends: { name: userName, age: userAge },
  api: () => ({}),
});

userCombined.use.name.use.setValue("Bob");
userCombined.use.age.use.setValue(10);

userCombined.listen.on((value) => {
  console.log(value);
});
