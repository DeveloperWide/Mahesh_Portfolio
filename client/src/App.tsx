import { Navigate, Route, Routes } from "react-router";
import Home from "./pages/main/Home";
import About from "./pages/main/About";
import Contact from "./pages/main/Contact";
import Main from "./pages/main/Main";
import NotFound from "./pages/error/NotFound";
import Work from "./pages/main/Work";
import ProjectDetails from "./pages/main/ProjectDetails";
import Auth from "./pages/auth/Auth";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import Courses from "./pages/main/Courses";
import Stats from "./pages/main/Stats";
import BookCall from "./pages/main/BookCall";
import Privacy from "./pages/legal/Privacy";
import Terms from "./pages/legal/Terms";
import Refunds from "./pages/legal/Refunds";
import Delivery from "./pages/legal/Delivery";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminCalls from "./pages/admin/AdminCalls";

const App = () => {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="projects" replace />} />
        <Route path="projects" element={<AdminProjects />} />
        <Route path="calls" element={<AdminCalls />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="/auth" element={<Auth />}>
        <Route path="signup" element={<Signup />} />
        <Route path="login" element={<Login />} />
      </Route>

      <Route path="/" element={<Main />}>
        <Route index element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/call" element={<BookCall />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/refunds" element={<Refunds />} />
        <Route path="/delivery" element={<Delivery />} />
        <Route path="/work" element={<Work />} />
        <Route path="/work/:slug" element={<ProjectDetails />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default App;
