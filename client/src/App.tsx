import { Route, Routes } from "react-router";
import Home from "./pages/main/Home";
import About from "./pages/main/About";
import Contact from "./pages/main/Contact";
import Main from "./pages/main/Main";
import NotFound from "./pages/error/NotFound";
import Work from "./pages/main/Work";
import Auth from "./pages/auth/Auth";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";

const App = () => {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />}>
        <Route path="signup" element={<Signup />} />
        <Route path="login" element={<Login />} />
      </Route>

      <Route path="/" element={<Main />}>
        <Route index element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/work" element={<Work />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default App;
