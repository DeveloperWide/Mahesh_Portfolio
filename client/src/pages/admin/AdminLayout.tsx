import { Link, Navigate, Outlet } from "react-router";
import { useAuth } from "../../context/auth";

const AdminLayout = () => {
  const { token, isAdmin, user, logout } = useAuth();

  if (!token || !isAdmin) return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="font-bold text-gray-900 hover:text-amber-600"
            >
              Portfolio
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-semibold text-gray-700">Admin</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">
              {user?.email ?? "admin"}
            </div>
            <button
              type="button"
              onClick={logout}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-10">
        <aside className="border border-gray-200 bg-white rounded-2xl p-4 h-fit">
          <nav className="flex flex-col gap-2">
            <Link
              to="/admin/dashboard"
              className="px-3 py-2 rounded-lg text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              Dashboard
            </Link>
            <Link
              to="/admin/messages"
              className="px-3 py-2 rounded-lg text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              Messages
            </Link>
            <Link
              to="/admin/email"
              className="px-3 py-2 rounded-lg text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              Email
            </Link>
            <Link
              to="/admin/projects"
              className="px-3 py-2 rounded-lg text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              Projects
            </Link>
            <Link
              to="/admin/calls"
              className="px-3 py-2 rounded-lg text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              Calls
            </Link>
            <Link
              to="/admin/refunds"
              className="px-3 py-2 rounded-lg text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              Refunds
            </Link>
            <Link
              to="/admin/settings"
              className="px-3 py-2 rounded-lg text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              Settings
            </Link>
          </nav>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
