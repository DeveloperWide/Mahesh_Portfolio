import { Outlet } from "react-router";
import Footer from "../layouts/Footer";
import Navbar from "../layouts/Navbar";

const Main = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
};

export default Main;
