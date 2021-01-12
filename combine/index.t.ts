import { combine } from "./index";
import { store } from "../store";

const name = store({
  init: "",
  api: ({ setState, getState }) => ({
    setValue: (value) => setState(value),
    getValue: () => getState(),
  }),
});

const age = store({
  init: 0,
  api: ({ setState, getState }) => ({
    setValue: (value) => setState(value),
    getValue: () => getState(),
  }),
});

const userApi = combine({
  api: { name, age },
  init: { name: "", age: 0 },
});

const user = userApi({ name: "user" });

user.name.setValue("");
user.age.setValue("");

const $user = user();

$user.on((value) => {});
$user.off(() => {});
