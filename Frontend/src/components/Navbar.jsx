import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Login from "./Login";
import Logout from "./Logout";
import { useAuth } from "../context/AuthProvider.jsx";

function getInitialTheme() {
  if (typeof window === "undefined") {
    return "dark";
  }

  const storedTheme = localStorage.getItem("theme");
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function Navbar() {
  // ⬇️ useAuth returns an object, not an array
  const { user: authUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboardPage = location.pathname === "/profile";
  const [theme, setTheme] = useState(getInitialTheme);

  const navRoutes = [
    { to: "/", label: "Home", isProtected: false, end: true },
    { to: "/notes", label: "Notes", isProtected: true },
    { to: "/efficiency", label: "Efficiency", isProtected: true },
    { to: "/profile", label: "Profile", isProtected: true },
  ];

  const navLinkClass = ({ isActive }) => `app-nav-link ${isActive ? "active" : ""}`;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (location.state?.openLogin) {
      document.getElementById("my_modal_3")?.showModal();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  const handleToggle = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  const openLoginModal = (fromPath = location.pathname) => {
    document.activeElement?.blur?.();
    navigate("/", {
      state: {
        openLogin: true,
        from: fromPath,
      },
    });
  };

  const handleNavClick = (event, item) => {
    if (item.isProtected && !authUser) {
      event.preventDefault();
      openLoginModal(item.to);
    }
  };

  const renderNavItems = () =>
    navRoutes.map((item) => (
      <li key={item.to}>
        <NavLink
          end={item.end}
          to={item.to}
          className={navLinkClass}
          onClick={(event) => handleNavClick(event, item)}
        >
          {item.label}
        </NavLink>
      </li>
    ));

  return (
    <div className={`app-navbar-shell relative z-[70] ${isDashboardPage ? "sticky top-0" : ""}`}>
      <div className="mx-auto max-w-screen-2xl px-4 pt-4 md:px-8">
        <div className="app-navbar navbar w-full overflow-visible rounded-[28px] px-3 md:px-5">
          <div className="navbar-start w-full">
            <div className="dropdown">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost mt-2 border-0 bg-transparent lg:hidden"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h8m-8 6h16"
                  />
                </svg>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dashboard-surface dropdown-content mt-3 z-[90] w-56 rounded-2xl p-2 shadow-xl"
              >
                {renderNavItems()}
                <li className="mt-2 border-t border-[var(--dashboard-border)] pt-2 lg:hidden">
                  {authUser ? (
                    <div className="px-1">
                      <Logout />
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="app-nav-button w-full rounded-xl px-4 py-3 text-sm font-semibold"
                      onClick={() => openLoginModal(location.pathname)}
                    >
                      Login
                    </button>
                  )}
                </li>
              </ul>
            </div>
            <span className="gradient-text mr-6 mt-2 cursor-pointer text-3xl font-bold md:text-5xl">
              efficiEncia
            </span>
          </div>

          <div className="navbar-end md:w-full">
            <div className="hidden lg:flex">
              <ul className="menu menu-horizontal px-3 py-2 text-base font-semibold md:w-full xl:text-lg">
                {renderNavItems()}
              </ul>
            </div>
          </div>

          <label className="app-theme-toggle swap swap-rotate mr-2">
            <input
              type="checkbox"
              onChange={handleToggle}
              checked={theme === "light"}
            />
            <svg
              className="swap-off h-10 w-10 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,1,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
            </svg>
            <svg
              className="swap-on h-8 w-8 fill-current md:h-10 md:w-10"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
            </svg>
          </label>

          {authUser ? (
            <Logout />
          ) : (
            <>
              <div className="hidden lg:flex">
                <button
                  className="app-nav-button ml-2 mr-3 h-12 rounded-xl px-4 py-2 text-sm font-semibold md:mr-1 md:h-11 md:text-base lg:ml-3"
                  onClick={() => openLoginModal(location.pathname)}
                >
                  Login
                </button>
              </div>
              <Login />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
