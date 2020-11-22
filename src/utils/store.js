import { useEffect, useState } from "react";
import Axios from "axios";
import firebase from "firebase/app";
import "firebase/auth";

const Bubo = Axios.create({
  baseURL: "https://api.bubo.id",
  headers: {
    "Content-Type": "application/json",
    Authorization:
      "Bearer AG8BCncaaB87gxICZMADlCFE7oHbhYjUHvHvDKVxZ4bu95koAHj3Ir_TPaeooFDDPLHtHkhbdGfIxSkA_BO860PfAEtUu1e0E0jVTMQd5ZgFcWEcBvtK8g1P5ToqBKoEecAYsyYNcIOUT9f08w0GCRy-ejU57pqbttu1XS8K9cTuIwWGVxRL1H-WBIrPuVP1BhMHR4Ms6ZyGRHZFfXJWc07nbHXzjNRGGGGAo9xFW0TClWF1mkoqbO_xHPC5LBwcN05CyZ27KL_Hj6Y2FU7XFMHlo9SSZE3Vc9Zk_wLKmOSF1NKidXGM6cXgUqCZKqCebDU4wITDwretOkEj87wECN6xqj3z1L2JIhvlMru_bcioG0jNEnrM9-eoYKfk8xDLmU0NkDfrBMyOFT96nQY3NCWaaPiG3oImxw"
  }
});

const State = {};

const AsyncStorageFactory = () => {
  const storage = window.localStorage;

  const getItem = (key) => {
    return new Promise((resolve, reject) => {
      const item = storage.getItem(key);
      resolve(JSON.parse(item || null));
    });
  };
  const setItem = (key, value) => {
    return new Promise((resolve, reject) => {
      storage.setItem(key, JSON.stringify(value));
      resolve(getItem(key));
    });
  };
  const removeItem = (key) => {
    return new Promise((resolve, reject) => {
      storage.removeItem(key);
      resolve(null);
    });
  };
  return {
    getItem: getItem,
    setItem: setItem,
    removeItem: removeItem
  };
};

export const AsyncStorage = AsyncStorageFactory();

const store = (options) => {
  State[options.key] = {
    key: options.key,
    value: options.default,
    type: options.type,
    subscribers: [],
    get() {
      return {
        ...this.value,
        clear: () => {
          this.set(null);
          AsyncStorage.removeItem(this.key);
        }
      };
    },
    applyChange(resp) {
      if (resp.id) {
        this.value = { ...this.value, ...resp };
        AsyncStorage.setItem(options.key, this.value);
        this.subscribers.forEach((s) => s(this.value));
      }
    },
    set(newValue) {
      if (newValue !== null) {
        this.value = { ...this.value, ...newValue };
        AsyncStorage.setItem(options.key, this.value).then((data) => {
          !data.id &&
            Bubo.put("/", data)
              .then((resp) => resp.data)
              .then((resp) => this.applyChange(resp))
              .catch((err) => {
                console.error(err);
              });
          data.id &&
            Bubo.patch(`/${data.id}`, data)
              .then((resp) => resp.data)
              .then((resp) => this.applyChange(resp))
              .catch((err) => {
                console.error(err);
              });
        });
      } else {
        this.value = newValue;
      }
      this.subscribers.forEach((s) => s(this.value));
    },
    subscribe(callback) {
      this.subscribers.push(callback);
    },
    unsubscribe(callback) {
      this.subscribers = this.subscribers.filter((s) => s !== callback);
    }
  };
  (async () => {
    const value = await AsyncStorage.getItem(options.key);
    if (value) {
      State[options.key].set(value);
      if (value.id) {
        Bubo.get(`/${value.id}`)
          .then((resp) => resp.data)
          .then((resp) => State[options.key].applyChange(resp));
      }
    }
  })();
};

export function useStore(key, options) {
  if (!key) {
    throw Error("Missing key argument");
  }
  if (!State[key]) {
    store(Object.assign(options || {}, { key: key }));
  }
  const state = State[key];
  const [, setBridgeValue] = useState(state.get());

  useEffect(() => {
    const subscription = (updatedValue) => {
      setBridgeValue(updatedValue);
    };
    state.subscribe(subscription);
    return () => {
      state.unsubscribe(subscription);
    };
  }, [state]);

  return [
    state.get(),
    (newValue) => {
      return new Promise((resolve, reject) => {
        state.set(newValue);
        resolve(state.get());
      });
    }
  ];
}

export function purgeStore() {
  for (const s in State) {
    State[s].get().clear();
  }
}

export function useAuth(config) {
  const AUTH_WAIT = -1;
  const AUTH_FAIL = 0;
  const AUTH_SUCCESS = 1;
  const provider = new firebase.auth.GoogleAuthProvider();

  const [load, setLoad] = useState(false);
  const [state, setLogged] = useState(AUTH_WAIT);
  const [user, setUser] = useStore("me");

  try {
    firebase.initializeApp(config);
  } catch (ex) {
  } finally {
    try {
      if (!load) {
        setLoad(true);
        firebase.auth().onAuthStateChanged((user) => {
          if (user) {
            const me = {
              type: "account",
              token: user.refreshToken,
              uid: user.uid,
              profile: {
                email: user.email,
                display_name: user.displayName,
                photo_url: user.photoURL,
                phone_number: user.phoneNumber
              },
              auth_provider: {
                id: user.providerData[0].providerId,
                creation_time: user.metadata.a,
                creation: user.metadata.creationTime,
                last_signin_time: user.metadata.b,
                last_signin: user.metadata.lastSignInTime,
                app_name: user.o
              },
              firebase: user
            };
            setLogged(AUTH_SUCCESS);
            setUser(me);
            //window.history.pushState('','','/')
          } else {
            setLogged(AUTH_FAIL);
            firebase
              .auth()
              .getRedirectResult()
              .then((result) => {
                if (result === null) {
                  setLogged(AUTH_FAIL);
                }
              })
              .catch(function (error) {
                console.error(error);
              });
          }
        });
      }
    } catch (ex) {
      console.log(JSON.stringify(ex));
    }
  }

  return {
    state: state,
    user: state === AUTH_SUCCESS ? user : undefined,
    signIn: () => {
      firebase
        .auth()
        .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(() => firebase.auth().signInWithRedirect(provider))
        .catch((err) => {
          console.log(err);
        });
    },
    signOut: () => {
      firebase
        .auth()
        .signOut()
        .then(() => {
          purgeStore();
          window.location.replace("/");
        });
    }
  };
}
