import { store } from "./index";

const user = store({
  init: { name: "", age: 10 },
  api: () => ({
    setName: (name: string) => {},
    getName: () => {},
    setAge: async (age: number) => {
      return age;
    },
    getAge: () => {},
  }),
});

user.setName("Bob");
user.setAge(10).then(() => {});
user.setAge.on.after(({ result }) => {
  result.then((res) => {});
});

const $user = user();

$user.on((value) => console.log(value));
