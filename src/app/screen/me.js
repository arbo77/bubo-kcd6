import React from "react";
import { NavLink } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

export const AppBar = (props) => {
  return (
    <header>
      <nav>
        <div>
          <NavLink exact to="/">
            <FiArrowLeft />
          </NavLink>
        </div>
        <div>
          <h3>{props.title}</h3>
        </div>
      </nav>
    </header>
  );
};
export const Me = (props) => {
  const { auth } = props;
  return (
    <div className="screen">
      <AppBar title="USER PROFILE" />
      <section>
        <img
          src={auth.user?.profile.photo_url}
          className="avatar large"
          alt=""
        />
        <div>
          <h2>{auth.user?.profile.display_name}</h2>
          <div>{auth.user?.profile.email}</div>
        </div>
        <div>
          <button onClick={auth.signOut}>Sign out</button>
        </div>
      </section>
    </div>
  );
};
