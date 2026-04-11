import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Login from "./Login";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthProvider.jsx";
import AppShell from "./layout/AppShell.jsx";

function Signup() {
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || "/";
  const { signup } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const userInfo = {
      name: data.name,
      email: data.email,
      password: data.password,
    };

    try {
      const res = await signup(userInfo);
      if (res?.user) {
        toast.success("Signup Successfully");
        navigate(from, { replace: true });
      }
    } catch (err) {
      if (err.response) {
        console.log(err);
        toast.error("Error: " + err.response.data.message);
      } else {
        toast.error("Unable to signup right now");
      }
    }
  };

  return (
    <AppShell withNavbar={false} contentClassName="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-xl">
        <div className="app-card-strong rounded-[32px] p-8">
          <form onSubmit={handleSubmit(onSubmit)} method="dialog">
            <Link
              to="/"
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              ✕
            </Link>
            <h3 className="app-heading text-lg font-bold">Signup</h3>
            <div className="mt-4 space-y-2">
              <span className="dashboard-muted">Name</span>
              <br />
              <input
                type="text"
                placeholder="Enter your name"
                className="app-input w-full rounded-xl px-3 py-2 outline-none"
                {...register("name", { required: true })}
              />
              <br />
              {errors.name && (
                <span className="text-sm text-red-500">
                  This field is required
                </span>
              )}
            </div>
            {/* Email */}
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
            {/* Password */}
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
            {/* Button */}
            <div className="flex justify-around mt-4">
              <button
                type="submit"
                className="app-button-primary rounded-xl px-4 py-2"
              >
                Signup
              </button>
              <p className="dashboard-muted text-lg">
                Have an account?{" "}
                <button
                  className="cursor-pointer underline text-cyan-500 dark:text-cyan-300"
                  onClick={() => document.getElementById("my_modal_3").showModal()}
                >
                  Login
                </button>{" "}
                <Login />
              </p>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}

export default Signup;
