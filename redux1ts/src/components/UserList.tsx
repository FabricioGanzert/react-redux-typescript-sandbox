import React, { useState, useEffect } from "react";
import { User } from "../models/User"; // Import the User model
import { useDispatch } from "react-redux";
import { removeUser } from "../store/slices/addUserSlice"; // Import the removeUser action
import { AppDispatch } from "../store/store";
import axios from "axios"; // Import axios to make API requests

interface UserListProps {
  users: User[];
}

const UserList: React.FC<UserListProps> = () => {
  const dispatch = useDispatch<AppDispatch>(); // This ensures dispatch is typed correctly

  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch users based on the current page
  const fetchUsers = async (page: number) => {
    try {
      const url_listusers = import.meta.env.VITE_APP_USERS_LIST as string;
      const response = await axios.get(
        `${url_listusers}?page=${page}&limit=5`,
        {
          withCredentials: true,
          headers: {
            "Cache-Control": "no-cache", // Disable caching
            Pragma: "no-cache", // Another header to control caching
            Expires: "0", // Make sure it's expired
          },
        }
      );

      if (
        response.status === 200 &&
        response.headers["content-type"]?.includes("application/json")
      ) {
        setUsers(response.data.users);
        setTotalPages(response.data.totalPages);
      } else {
        console.error("Expected JSON response, but got:", response.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const handleRemoveUser = async (userId: number) => {
    await dispatch(removeUser(userId));
    // After removing a user, reload the users list
    fetchUsers(currentPage);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h1>User List:</h1>
      {users.length === 0 ? (
        <p>No users to show</p>
      ) : (
        <>
          <ul style={{ textAlign: "left", paddingLeft: "20px" }}>
            {users.map((user, index) => (
              <li key={index} style={{ marginBottom: "10px" }}>
                {user.userId} | {user.name} {user.lastname}
                <button
                  onClick={() => handleRemoveUser(user.userId)}
                  style={{
                    marginLeft: "10px",
                    color: "white",
                    backgroundColor: "red",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          {/* Pagination */}
          <div>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <span style={{ margin: "0 10px" }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UserList;
