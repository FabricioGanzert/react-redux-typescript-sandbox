import React from "react";
import { Link } from "react-router-dom";
import Logout from "./Logout";

type NavBarProps = {
  isLoggedIn: boolean;
};

const NavBar: React.FC<NavBarProps> = ({ isLoggedIn }) => {
  return (
    <>
      {" "}
      {/* Container for layout */}
      <nav
        style={{
          marginBottom: "20px",
        }}
      >
        <Link
          to="/"
          style={{
            marginRight: "10px",
          }}
        >
          Home
        </Link>{" "}
        {!isLoggedIn ? (
          <span>
            | <Link to="/login">Login</Link>
          </span>
        ) : (
          <span>
            | <Link to="/listusers">List Users</Link> |{" "}
            <Link to="/addnewuser">Add New User</Link> | <Logout />
          </span>
        )}
      </nav>
    </>
  );
};

export default NavBar;
