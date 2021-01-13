import { store } from "./index";

const userApi = store({
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

const user = userApi({ name: "user" });

user.setName("Bob");
user.setAge(10).then(() => {});
user.setAge.on.after(({ result }) => {
  result.then((res) => {});
});

const $user = user();

$user.on((value) => console.log(value));
$user.getState();
