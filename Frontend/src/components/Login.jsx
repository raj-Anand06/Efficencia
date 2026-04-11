// Login.jsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthProvider.jsx";

function Login() {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const userInfo = {
      email: data.email,
      password: data.password,
    };

    try {
      const res = await login(userInfo);
      if (res?.user) {
        toast.success("Logged in Successfully");
        document.getElementById("my_modal_3").close();
        const fromPath = location.state?.from || "/";
        navigate(fromPath, { replace: true, state: {} });
      }
    } catch (err) {
      if (err.response) {
        console.error(err);
        toast.error("Error: " + err.response.data.message);
      } else {
        toast.error("Unable to login right now");
      }
    }
  };

  return (
    <div>
      <dialog id="my_modal_3" className="modal">
        <div className="app-card-strong modal-box rounded-[28px] border p-8">
          <form onSubmit={handleSubmit(onSubmit)} method="dialog">
            <Link
              to="/"
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => document.getElementById("my_modal_3").close()}
            >
              ✕
            </Link>
            <h3 className="app-heading text-lg font-bold">Login</h3>
            <div className="mt-4 space-y-2">
              <span className="dashboard-muted">Email</span>
              <br />
              <input
                type="email"
                placeholder="Enter your email"
                className="app-input w-full rounded-xl px-3 py-2 outline-none"
                {...register("email", { required: true })}
              />
              <br />
              {errors.email && (
                <span className="text-sm text-red-500">
                  This field is required
                </span>
              )}
            </div>
            <div className="mt-4 space-y-2">
              <span className="dashboard-muted">Password</span>
              <br />
              <input
                type="password"
                placeholder="Enter your password"
                className="app-input w-full rounded-xl px-3 py-2 outline-none"
                {...register("password", { required: true })}
              />
              <br />
              {errors.password && (
                <span className="text-sm text-red-500">
                  This field is required
                </span>
              )}
            </div>
            <div className="flex justify-around mt-6">
              <button className="app-button-primary rounded-xl px-4 py-2">
                Login
              </button>
              <p className="dashboard-muted">
                Not registered?{" "}
                <Link
                  to="/signup"
                  className="cursor-pointer underline text-cyan-500 dark:text-cyan-300"
                >
                  Signup
                </Link>
              </p>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
}

export default Login;
