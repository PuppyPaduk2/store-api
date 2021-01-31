import { context, attachStore, attachDepend } from "./src/context";
import { store } from "./src/store";
import { depend } from "./src/depend";
import { contractStores, contractDepends } from "./src/contract/v2";

const stringApi = store({
  init: "",
  api: ({ setState, reset }) => ({
    set: (value: string) => setState(value),
    reset,
  }),
});

const numberApi = store({
  init: 0,
  api: ({ getState, setState, reset }) => ({
    set: (value: number) => setState(value),
    inc: () => setState(getState() + 1),
    dec: () => setState(prev => prev - 1),
    reset,
  }),
});

const appContractStores = contractStores({
  name: stringApi,
  age: numberApi,
});

const appContractDepends = contractDepends({
  initName: depend({
    stores: appContractStores.config(["name"]),
    handler: ({ name }) => name.api.set("Bob"),
  }),
  initAge: depend({
    stores: { age: appContractStores.config().age },
    handler: ({ age }) => age.api.set(10),
  }),
  initAlise: depend({
    stores: appContractStores.config(),
    handler: ({ name, age }) => ({
      name: name.api.set("Alise"),
      age: age.api.set(5),
    }),
  }),
});

const app = context();

app(appContractDepends.depends());
app(appContractStores.stores());
