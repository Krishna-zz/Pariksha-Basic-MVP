import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const Homepage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [examId, setExamId] = useState("");

  const handleJoin = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (examId.trim()) {
      navigate(`/exam/${examId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-indigo-100">
      {/* ── SMART NAVIGATION BAR ── */}
      <nav className="flex items-center justify-between px-8 py-5 bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-black text-xl leading-none">A</span>
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900">
            Assess<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">OS</span>
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          {/* Show Teacher Links only if logged in as teacher */}
          {user?.role === "teacher" && (
            <>
              <Link to="/viewpapers" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition">Paper Library</Link>
              <Link to="/ecp/dashboard" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition">Conduct Panel</Link>
            </>
          )}

          {/* Auth Buttons */}
          {user ? (
            <div className="flex items-center gap-4 border-l border-slate-200 pl-8">
              <span className="text-sm font-semibold text-slate-600">
                Hi, {user.name.split(" ")[0]} 
                <span className="ml-2 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500">
                  {user.role}
                </span>
              </span>
              <button 
                onClick={logout}
                className="text-sm font-bold text-red-500 hover:text-red-600 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition">Sign In</Link>
              <Link to="/register" className="px-5 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white text-sm font-bold rounded-xl transition shadow-md">
                Create Account
              </Link>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-16 md:py-24 relative">
        {/* Decorative Background Blob */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />

        {/* ── HERO SECTION ── */}
        <div className="text-center max-w-4xl mx-auto mb-24 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            System Online & Secure
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-8">
            The standard for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500">
              technical assessments.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-500 mb-12 leading-relaxed max-w-2xl mx-auto font-medium">
            From basic quizzes to intense coding competitions. Whether evaluating HashMaps and Sliding Window techniques or running campus-wide Hackathons, deploy secure exam sessions in seconds.
          </p>

          {/* ── DYNAMIC CALL TO ACTION ── */}
          {!user || user.role === "student" ? (
            <div className="bg-white p-2.5 rounded-2xl shadow-xl border border-slate-200 max-w-xl mx-auto flex items-center focus-within:ring-4 focus-within:ring-indigo-500/20 transition-all">
              <form onSubmit={handleJoin} className="flex w-full">
                <span className="pl-5 pr-3 py-4 text-slate-400 text-xl">🔗</span>
                <input
                  type="text"
                  placeholder="Paste your Exam ID to begin..."
                  value={examId}
                  onChange={(e) => setExamId(e.target.value)}
                  className="flex-1 text-slate-700 placeholder-slate-400 bg-transparent border-none outline-none text-lg font-semibold"
                />
                <button
                  type="submit"
                  disabled={!examId.trim()}
                  className="bg-slate-900 hover:bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-sm transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  Join Session
                </button>
              </form>
            </div>
          ) : (
            <div className="flex justify-center gap-4">
              <Link to="/ecp/dashboard" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-lg shadow-indigo-600/20 active:scale-95">
                Open Command Center
              </Link>
              <Link to="/create" className="px-8 py-4 bg-white border border-slate-200 text-slate-700 hover:border-slate-300 font-bold rounded-xl transition shadow-sm active:scale-95">
                + Create Blueprint
              </Link>
            </div>
          )}
        </div>

        {/* ── THREE PILLAR ARCHITECTURE ── */}
        <div className="grid md:grid-cols-3 gap-8 relative z-10">
          
          {/* QPB */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 text-2xl mb-6">
              📄
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-3">Paper Builder</h3>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Design complex blueprints. Add questions, manage options, and set distinct marking schemes in a clean, reusable workspace.
            </p>
          </div>

          {/* ECP */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 text-2xl mb-6">
              ⚡
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-3">Conduct Panel</h3>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Transform blueprints into live sessions. Enforce strict anti-cheat protocols, control durations, and monitor attempts instantly.
            </p>
          </div>

          {/* SEE */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/20 blur-3xl rounded-full pointer-events-none" />
            
            <div className="w-14 h-14 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center text-blue-400 text-2xl mb-6 relative z-10">
              💻
            </div>
            <h3 className="text-xl font-black text-white mb-3 relative z-10">Secure Client</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-medium relative z-10">
              A distraction-free testing environment locked behind fullscreen enforcement and tab-switching detection protocols.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Homepage;