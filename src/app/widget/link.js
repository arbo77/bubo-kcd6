import React from "react";
import { Link } from "react-router-dom";

export default ({ to, modal, ...props }) => {
  return <Link to={to}>{props.children}</Link>;
};
