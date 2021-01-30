import { store, StoreInstanceByApi } from "../store";

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

const nameApi = stringApi(({ api }) => api);
const ageApi = numberApi(({ api }) => api);

type StringApi = StoreInstanceByApi<typeof stringApi>;
