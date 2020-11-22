import React, { useCallback } from "react";
import { useStore, purgeStore, useAuth } from "./utils/store";
import { Date } from "./utils/date";
import { Other } from "./other";
import { Empty, Login, Main } from "./app/screen";
import { JadwalList, JadwalForm } from "./app/screen/lms";
import { Route, Switch } from "react-router-dom";
import { Me } from "./app/screen/me";
import { useRemote } from "./worker";

export const Detail = () => {
  const [store] = useStore("sample");
  return (
    <div>
      {Object.entries(store).map((el, idx) => (
        <div key={idx}>
          {el[0]}: {JSON.stringify(el[1])}
        </div>
      ))}
    </div>
  );
};

const workerMateri = new Worker("/worker.js");
const workerJadwal = new Worker("/worker.js");

export function App() {
  const [store, setStore] = useStore("sample");
  const [, setSecond] = useStore("second");

  const setValue = useCallback(() => {
    setStore({
      type: "xxx",
      day: Date().day(),
      date: Date().date(),
      clock: Date().clock(),
      when: Date().history(),
      complex: {
        unix: Date().unix(),
        field: {
          name: "Poiu",
          sibling: "Kian"
        },
        activity: [
          { id: 1, log: "Logger 1" },
          { id: 2, log: "Logger 2" },
          { id: 3, log: "Logger 3" },
          { id: 4, log: "Logger 4" }
        ]
      }
    }).then((store) => {
      setSecond({
        ...store.complex,
        type: "yyy"
      });
    });
  }, [setSecond, setStore]);

  const cleanUp = () => {
    purgeStore();
  };

  return (
    <div className="App">
      <Detail />
      <h2>Start editing {store.date} to see some magic happen!</h2>
      <button onClick={setValue}>Set</button>
      <button onClick={cleanUp}>Clean up</button>
      <Other />
    </div>
  );
}

export const Router = ({ auth, ...props }) => {
  const remoteMateri = useRemote("materi", workerMateri);
  const remoteJadwal = useRemote("jadwal", workerJadwal);

  return (
    <Switch>
      <Route
        exact
        path="/"
        render={(props) => <Main auth={auth} {...props} />}
      />
      {auth.state === 1 && (
        <>
          <Route
            exact
            path="/gallery"
            render={(props) => <Main auth={auth} {...props} />}
          />
          <Route
            exact
            path="/interaktif"
            render={(props) => <Main auth={auth} {...props} />}
          />
          <Route
            exact
            path="/jadwal"
            render={(props) => (
              <JadwalList remoteJadwal={remoteJadwal} auth={auth} {...props} />
            )}
          />
          <Route
            exact
            path="/new/jadwal/:kid/:rid"
            render={(props) => (
              <JadwalForm remoteJadwal={remoteJadwal} auth={auth} {...props} />
            )}
          />
          <Route path="/me" render={(props) => <Me auth={auth} {...props} />} />
        </>
      )}
    </Switch>
  );
};

export const Home = () => {
  const auth = useAuth({
    apiKey: "AIzaSyAXZpSaDTqgRFYP16WpRJKvlRgT3e-OQIE",
    authDomain: "app.bubo.id",
    databaseURL: "https://bubokcd6.firebaseio.com",
    projectId: "bubokcd6",
    storageBucket: "bubokcd6.appspot.com",
    messagingSenderId: "929887876776",
    appId: "1:929887876776:web:048335f8df690a059af49d",
    measurementId: "G-5CGHPVV7NZ",
    messagingApiKey:
      "BLjb8wsz19C1DGKnupEAp_zpXW3QVQxfhBYoJItxcZBbAsbYcXaPeWMH3N0QX3GY3UAv77Ydw_7bvNkxk8wFgcI"
  });

  return (
    <>
      {auth.state === -1 && <Empty auth={auth} />}
      {auth.state === 0 && <Login auth={auth} />}
      {auth.state === 1 && <Router auth={auth} />}
    </>
  );
};

export default Home;
