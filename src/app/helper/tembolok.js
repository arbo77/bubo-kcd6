/**
 * @arbo77
 */

import { useEffect, useState } from "react";
import firebase from "firebase/app";
import "firebase/auth";
import { useHistory } from "react-router-dom";

const State = {};

const AsyncStorage = window.localStorage;

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
    set(newValue) {
      if (newValue !== null) {
        this.value = { ...this.value, ...newValue };
        AsyncStorage.setItem(options.key, JSON.stringify(this.value));
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
      State[options.key].set(JSON.parse(value));
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
  const history = useHistory();
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
              }
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
          history.replace("/");
        });
    }
  };
}
