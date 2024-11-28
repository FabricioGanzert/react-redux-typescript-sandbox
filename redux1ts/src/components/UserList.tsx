import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { fetchUsers, updateCurrentPage } from "../store/slices/addUserSlice";

const UserList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const loading = useSelector((state: RootState) => state.addUser.loading);
  const UsersList = useSelector((state: RootState) => state.addUser.users);
  const currentPage = useSelector(
    (state: RootState) => state.addUser.currentPage
  );
  const totalPages = useSelector(
    (state: RootState) => state.addUser.totalPages
  );
  const isFetching = useRef(false); // Track if an API call is active

  const handlePageChange = (page: number) => {
    if (page !== currentPage && page > 0 && page <= totalPages) {
      dispatch(updateCurrentPage(page)); // Always update the page
    }
  };

  // Fetch users when currentPage changes
  useEffect(() => {
    if (!isFetching.current) {
      isFetching.current = true;
      dispatch(fetchUsers(currentPage))
        .unwrap()
        .finally(() => {
          isFetching.current = false; // Reset after fetch completes
        });
    }
  }, [dispatch, currentPage]);

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div>
      <h1>User List:</h1>
      {UsersList.length === 0 ? (
        <p>No users to show</p>
      ) : (
        <ul>
          {UsersList.map((user) => (
            <li key={user.userId}>
              {user.name} {user.lastname}
            </li>
          ))}
        </ul>
      )}
      <button onClick={() => handlePageChange(1)}>First</button>
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Prev
      </button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages || totalPages <= 1}
      >
        Next
      </button>
      <button onClick={() => handlePageChange(totalPages)}>Last</button>
    </div>
  );
};

export default UserList;
