import React from "react";
import Navbar from "../Navbar.jsx";

function AppShell({ children, contentClassName = "", withNavbar = true }) {
  return (
    <div className="app-shell">
      {withNavbar ? <Navbar /> : null}
      <main className="app-main">
        <div className={`app-page ${contentClassName}`.trim()}>{children}</div>
      </main>
    </div>
  );
}

export default AppShell;
