import React from "react";
import { NavLink } from "react-router-dom";
import { BuboLogo } from "./component/bubo";
import { FiHome, FiGrid, FiMessageSquare } from "react-icons/fi";

const Screen = {
  isMobile: () => {
    return window.matchMedia("(max-width: 600px)");
  }
};

export const Main = (props) => {
  const { auth } = props;
  return (
    <main>
      <header>
        <nav>
          <div>
            <NavLink exact to="/">
              <BuboLogo />
            </NavLink>
          </div>
          <div>
            {!Screen.isMobile() && (
              <nav>
                <NavLink exact to="/">
                  Home
                </NavLink>
                <NavLink to="/">Galeri</NavLink>
                <NavLink to="/">Interaktif</NavLink>
              </nav>
            )}
          </div>
          <div>
            <NavLink to="/me">
              <img
                src={auth.user?.profile.photo_url}
                alt=""
                className="avatar"
              />
            </NavLink>
          </div>
        </nav>
      </header>
      <div>{props.children}</div>
      {Screen.isMobile() && (
        <footer>
          <nav>
            <NavLink exact to="/">
              <FiHome />
              <small>Home</small>
            </NavLink>
            <NavLink to="/gallery">
              <FiGrid />
              <small>Galeri</small>
            </NavLink>
            <NavLink to="/interaktif">
              <FiMessageSquare />
              <small>Interaktif</small>
            </NavLink>
          </nav>
        </footer>
      )}
    </main>
  );
};

export const Login = ({ auth, ...props }) => {
  return (
    <main>
      <div>
        <h1>Hello</h1>
        {auth.state === 0 && <button onClick={auth.signIn}>Signin</button>}
      </div>
    </main>
  );
};

export const Empty = ({ auth, ...props }) => {
  return (
    <main className="middle">
      <div className="loading">
        <BuboLogo height="4rem" />
      </div>
    </main>
  );
};
