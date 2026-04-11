import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider.jsx";
import toast from "react-hot-toast";

function Logout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      logout();
      toast.success("Logout successfully");
      navigate("/", { replace: true });
    } catch (error) {
      toast.error("Error: " + (error?.message || error));
    }
  };

  return (
    <div>
      <button
        className="app-nav-button rounded-xl px-4 py-2 text-sm font-semibold"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
}

export default Logout;
