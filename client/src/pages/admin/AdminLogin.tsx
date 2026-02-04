import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { useAuth } from "../../context/auth";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, logout, token, isAdmin } = useAuth();

  const [email, setEmail] = useState("maheshrana9520@gmail.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setError(null);
  }, [email, password]);

  if (token && isAdmin) {
    return <Navigate to="/admin/projects" replace />;
  }

  return (
    <section className="min-h-screen flex items-center bg-gray-50">
      <div className="max-w-md w-full mx-auto px-6">
        <div className="border border-gray-200 rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
          <p className="mt-2 text-sm text-gray-600">
            This area is only for{" "}
            <span className="font-semibold">Mahesh</span>.
          </p>

          <form
            className="mt-8 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              const result = await login({ email, password });
              setLoading(false);

              if (!result.ok) {
                setError(result.message);
                return;
              }

              if (!result.isAdmin) {
                await logout();
                setError("This account is not allowed to access admin.");
                return;
              }

              navigate("/admin/projects");
            }}
          >
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-800">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-800">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            {error ? (
              <div className="text-sm text-red-600">{error}</div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-5 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default AdminLogin;
