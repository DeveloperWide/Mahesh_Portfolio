import { Outlet } from "react-router";
import SignupImage from "../../assets/Signup.jpg";

const Auth = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
      {/* Left Side Image */}
      <img
        src={SignupImage}
        alt="Signup"
        className="hidden md:block w-full h-full object-cover"
      />

      {/* Right Side Auth Form */}
      <Outlet />
    </div>
  );
};

export default Auth;
