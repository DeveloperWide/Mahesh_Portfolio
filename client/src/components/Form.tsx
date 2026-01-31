import { TextField } from "@mui/material";

type FormProps = { type: "login" } | { type: "signup" };

const Form = (props: FormProps) => {
  return (
    <form className="flex flex-col items-center gap-5">
      <h1>{props.type === "signup" ? "Signup Here" : "Login here"}</h1>
      <div className="name">
        <TextField
          id="outlined-password-input"
          label="Name"
          type="text"
          autoComplete="current-password"
        />
      </div>

      <div className="email">
        <TextField
          id="outlined-email-input"
          label="Email"
          type="email"
          autoComplete="current-email"
        />
      </div>

      <div className="password">
        <TextField
          id="outlined-password-input"
          label="Password"
          type="password"
          autoComplete="current-password"
        />
      </div>
    </form>
  );
};

export default Form;
