import { storeApi } from "./index";

const userApi = storeApi({
  init: { name: "", age: 0 },
  api: ({ data, change }) => ({
    getData: () => {
      return data();
    },
    setName: (name: string, hard: boolean = false) => {
      change({ name, age: 10 });
      change((prev) => ({ ...prev, name }));
    },
    getName: () => {
      return data().name;
    },
    setAge: async (age: number) => {
      change({ ...data(), age });

      return data().age;
    },
    getAge: () => {
      return null;
    },
  }),
});

test("main", async () => {
  const user1 = userApi({ name: "user-1" });

  user1.use.setName("Bob");
  user1.use.getName();
  const user1data = user1.use.getData();
  console.log(user1data);

  const user2 = userApi({ name: "user-2", init: { name: "Alise", age: 10 } });
  const user2age = await user2.use.setAge(20);
});

test("on", () => {
  const user = userApi({ name: "user-1" });

  user.on.setName.before(({ params }) => {
    const [name, hard] = params;

    console.log("before", name, hard)
  });
  user.on.setName.after(({ params, result }) => {
    console.log("after", params, result)
  });
});

test("off", () => {
  const user = userApi({ name: "user-1" });

  user.on.setAge.before(({ params }) => {
    const [name] = params;

    console.log("before", name);
  });
  user.on.setAge.after(({ params, result }) => {
    result.then((value) => {
      console.log(value)
    })
  });

  user.off.setAge.before(({ params }) => {});
  user.off.setAge.after(() => {});
});