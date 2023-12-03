import "./App.css";
import {
  Outlet,
  RouterProvider,
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
import NavBar from "./components/NavBar";
import { useState } from "react";
import AuthComponent from "./components/Auth/AuthComponent";
import { AuthService } from "./services/AuthService";
import { DataService } from "./services/DataService";
import AddBook from "./components/Book/AddBook";
// import Spaces from "./components/Spaces";

const authService = new AuthService();
const dataService = new DataService(authService);

function App() {
  const [userName, setUserName] = useState<string | undefined>(undefined);

  const router = createBrowserRouter([
    {
      element: (
        <>
          <NavBar userName={userName} />
          <Outlet />
        </>
      ),
      children: [
        {
          path: "/",
          element: (
            <h1 className="welcome-msg">{`Welcome to the Book club ${
              userName ?? ""
            }`}</h1>
          ),
        },
        {
          path: "/login",
          element: !userName ? (
            <AuthComponent
              authService={authService}
              setUserNameCb={setUserName}
            />
          ) : (
            <Navigate to="/" replace={true} />
          ),
        },
        // {
        //   path: "/profile",
        //   element: <div>Profile page</div>,
        // },
        {
          path: "/addBook",
          element: !userName ? (
            <Navigate to="/login" replace={true} />
          ) : (
            <AddBook dataService={dataService} />
          ),
        },
        // {
        //   path: "/books",
        //   element: <Spaces dataService={dataService} />,
        // },
      ],
    },
  ]);

  return (
    <div className="wrapper">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
