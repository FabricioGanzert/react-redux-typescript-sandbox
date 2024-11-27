import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { AppDispatch, RootState } from "./store/store";
import axios from "axios";
import { fetchUsers } from "./store/slices/addUserSlice";
import { setLoginStatus, setUserData, logout } from "./store/slices/authSlice";
import AddUserPage from "./pages/AddUserPage";
import Login from "./pages/LoginPage";
import "./styles.css"; // Import the global CSS file

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>(); // Use the correct dispatch type
  const { isLoggedIn, userData } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    const checkLoginStatus = async () => {
      const url_verify = import.meta.env.VITE_VERIFY_TOKEN_URL as string;

      try {
        // No need to get the token from localStorage since it's stored in the cookie
        const response = await axios.get(url_verify, {
          withCredentials: true, // This sends the cookie automatically
        });

        // Token is valid
        dispatch(setLoginStatus(true));
        dispatch(setUserData(response.data.user));

        // Fetch users only if the token is valid
        dispatch(fetchUsers());
      } catch (error) {
        console.error("Token verification failed:", error);
        dispatch(setLoginStatus(false));
        dispatch(setUserData(null)); // Clear user data if the token is invalid
      }
    };

    checkLoginStatus();
  }, [dispatch]);

  return (
    <Router>
      <div className="app-container">
        {" "}
        {/* Container for layout */}
        <nav style={{ marginBottom: "20px" }}>
          <Link to="/" style={{ marginRight: "10px" }}>
            Home
          </Link>{" "}
          {!isLoggedIn ? (
            <span>
              | <Link to="/login">Login</Link>
            </span>
          ) : (
            <span>
              | <Link to="/addnewuser">Add New User</Link> |{" "}
              <span
                onClick={() => {
                  dispatch(logout()); // Dispatch logout action to clear Redux state
                }}
                style={{
                  cursor: "pointer",
                  color: "blue",
                  textDecoration: "underline",
                }}
              >
                Logout
              </span>
            </span>
          )}
        </nav>
        <Routes>
          <Route
            path="/"
            element={
              <div>
                <h1>Welcome to the Redux App</h1>
                {isLoggedIn ? (
                  <div>
                    <h2>Welcome back, {userData?.name || "User"}!</h2>
                  </div>
                ) : (
                  <h2>Please log in to see your users.</h2>
                )}
              </div>
            }
          />

          <Route path="/addnewuser" element={<AddUserPage />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;