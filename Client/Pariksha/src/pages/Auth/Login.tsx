import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import api from "../../api/axios";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      
      // Update global auth state
      login(res.data.accessToken, res.data.user);

      // Route based on role
      if (res.data.user.role === "teacher") {
        navigate("/ecp/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to login. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-black text-2xl leading-none">A</span>
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome back</h2>
        <p className="mt-2 text-sm text-slate-500">
          Don't have an account? <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-500">Sign up</Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg border border-red-100 text-center font-medium">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
              <input
                id="email"
                name="email"
                title="Email Address"
                placeholder="you@example.com"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm text-slate-800 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Password</label>
              <input
                id="password"
                name="password"
                title="Password"
                placeholder="Enter your password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm text-slate-800 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all active:scale-95 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in to AssessOS"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;