import React, {
  FC,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Button, Input, Space } from "antd";
import { Store, StoreApi, StoreCreator, context, store } from "store-api";
import { signIn } from "api/v2/auth";

const pendingApi = store({
  init: false,
  api: ({ setState }) => ({
    on: () => setState(true),
    off: () => setState(false),
  }),
});

const authFormApi = store({
  init: { username: "", password: "", pin: "" },
  api: ({ setState, getState, reset }) => ({
    setUsername: (username: string) => setState({ ...getState(), username }),
    setPassword: (password: string) => setState({ ...getState(), password }),
    setPin: (pin: string) => setState({ ...getState(), pin }),
    submit: async () => {
      try {
        await signIn(getState());
        reset();
      } catch (error) {
        console.log(error.message);
      }
    },
  }),
});

// Form for root-context
const pending = pendingApi({ name: "pending" });
const authForm = authFormApi({ name: "auth-form" });

authForm.api.submit.before.on(pending.api.on.call);
authForm.api.submit.after.on(({ result }) =>
  result.finally(pending.api.off.call)
);

const Context = createContext<any>(null);

function useStoreState<State, Api extends StoreApi<State>>(
  store: Store<State, Api>
) {
  const [state, setState] = useState<State>(store.getState());

  useEffect(() => {
    store.on(setState);

    return () => {
      store.off(setState);
    };
  }, [store]);

  return state;
}

function useContextStore<State, Api extends StoreApi<State>>(
  storeCreator: StoreCreator<State, Api>,
  payload: { name: string; init?: State }
): Store<State, Api> {
  const scope = useContext(Context);
  return scope(() => storeCreator(payload));
}

// PAGE

const form1 = context();
const form2 = context();

export const PageAuth: FC = () => {
  return (
    <Space direction="vertical">
      <Context.Provider value={form1}>
        <PageAuthFormByContext />
      </Context.Provider>
      <Context.Provider value={form2}>
        <PageAuthFormByContext />
      </Context.Provider>
    </Space>
  );
};

export const PageAuthFormByContext: FC = () => {
  const authForm = useContextStore(authFormApi, { name: "auth-form" });
  const pending = useContextStore(pendingApi, { name: "peding" });

  useEffect(() => {
    console.log(authForm);
    authForm.on(console.log);
  }, [authForm]);

  const form = useStoreState(authForm);
  const pendingValue = useStoreState(pending);

  return (
    <Space>
      <Input
        placeholder="Username"
        value={form.username}
        onChange={(event) =>
          authForm.api.setUsername.call(event.currentTarget.value)
        }
      />
      <Input
        placeholder="Password"
        type="password"
        value={form.password}
        onChange={(event) =>
          authForm.api.setPassword.call(event.currentTarget.value)
        }
      />
      <Input
        placeholder="Pin"
        value={form.pin}
        onChange={(event) =>
          authForm.api.setPin.call(event.currentTarget.value)
        }
      />
      <Button loading={pendingValue} onClick={authForm.api.submit.call}>
        Send
      </Button>
    </Space>
  );
};

export const PageAuthForm: FC = () => {
  const form = useStoreState(authForm);
  const pendingValue = useStoreState(pending);

  return (
    <Space>
      <Input
        placeholder="Username"
        value={form.username}
        onChange={(event) =>
          authForm.api.setUsername.call(event.currentTarget.value)
        }
      />
      <Input
        placeholder="Password"
        type="password"
        value={form.password}
        onChange={(event) =>
          authForm.api.setPassword.call(event.currentTarget.value)
        }
      />
      <Input
        placeholder="Pin"
        value={form.pin}
        onChange={(event) =>
          authForm.api.setPin.call(event.currentTarget.value)
        }
      />
      <Button loading={pendingValue} onClick={authForm.api.submit.call}>
        Send
      </Button>
    </Space>
  );
};
