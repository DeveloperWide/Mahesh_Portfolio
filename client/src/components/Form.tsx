import { Button, TextField } from "@mui/material";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { getObj } from "../utils/helper";
import type { FormData } from "../types/formTypes";
import { instance } from "../utils/axiosInstance";
import { Link } from "react-router";

type FormProps = { type: "login" } | { type: "signup" };

const Form = (props: FormProps) => {
  const [formData, setFormData] = useState<FormData>(getObj(props.type));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (props.type == "signup") {
        const res = await instance.post("/auth/signup", formData);

        if (res.data.user) {
          setSuccess("Account created. You’re logged in.");
          setFormData({
            name: "",
            email: "",
            password: "",
          });
        }
      } else {
        const res = await instance.post("/auth/login", formData);
        if (res.data.user) {
          setSuccess("Logged in successfully.");
          setFormData({
            email: "",
            password: "",
          });
        }
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="flex flex-col gap-6 bg-white/80 backdrop-blur-md w-full max-w-md px-8 py-10 rounded-2xl shadow-md"
      onSubmit={onSubmitHandler}
    >
      <h1 className="text-3xl font-semibold text-center text-gray-800">
        {props.type === "signup" ? "Create Account" : "Welcome Back"}
      </h1>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {success}
        </div>
      ) : null}

      {props.type === "signup" && (
        <TextField
          label="Name"
          type="text"
          value={formData.name}
          name="name"
          className="w-full"
          onChange={onChangeHandler}
        />
      )}

      <TextField
        label="Email"
        type="email"
        name="email"
        className="w-full"
        value={formData.email}
        onChange={onChangeHandler}
      />

      <TextField
        label="Password"
        type="password"
        className="w-full"
        name="password"
        value={formData.password}
        onChange={onChangeHandler}
      />

      {props.type == "signup" ? (
        <p className="ps-2 tracking-wide">
          Already have an Account{" "}
          <Link to="/auth/login" className="ps-1 font-semibold text-blue-700">
            Login here
          </Link>
        </p>
      ) : (
        <p className="ps-2 tracking-wide">
          Don't have a Account{" "}
          <Link to="/auth/signup" className="ps-1 font-semibold text-blue-700">
            Create here
          </Link>
        </p>
      )}

      <Button
        variant="contained"
        size="large"
        type="submit"
        disabled={loading}
        className="w-full py-3! rounded-xl! font-semibold!"
      >
        {loading
          ? "Please wait…"
          : props.type === "signup"
            ? "Sign Up"
            : "Login"}
      </Button>
    </form>
  );
};

export default Form;
