import { NavLink } from "react-router-dom";

type NavBarProps = {
  userName?: string;
};

const LoginSection = ({ userName }: { userName?: string }) => {
  if (userName) {
    return (
      <NavLink to="/logout" style={{ float: "right" }}>
        {userName}
      </NavLink>
    );
  }

  return (
    <NavLink to="/login" style={{ float: "right" }}>
      Login
    </NavLink>
  );
};

const NavBar = ({ userName }: NavBarProps) => {
  return (
    <div className="navbar">
      <NavLink to={"/"}>Home</NavLink>
      {/* <NavLink to={"/profile"}>Profile</NavLink> */}
      {/* <NavLink to={"/books"}>Your Books</NavLink> */}
      <NavLink to={"/addBook"}>Add Book</NavLink>
      <LoginSection userName={userName} />
    </div>
  );
};

export default NavBar;
