//QPB
import CreatePaper from "./pages/QPB/CreatePaper"
import AllPapers from "./pages/QPB/AllPapers"

//SEE
import ExamAttempt from "./pages/AttemptExam/Examattempt";
import ExamEntry from "./pages/AttemptExam/Examentry";
import ExamResult from "./pages/AttemptExam/Examresult";

//ECP
import CreateExam from "./pages/ECP/CreateExam";
import ExamDashboard from "./pages/ECP/ExamDashboard";
import ExamMonitor from "./pages/ECP/ExamMonitor";
import { AuthProvider } from "./Context/AuthContext";
import ProtectedRoute from "./Components/ProtectedRoute";

//pages
import Homepage from "./pages/Homepage";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

import {BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  

  return (
  <>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── PUBLIC ROUTES ── */}
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        
           {/* QPB */}
           {/* ── TEACHER ROUTES (Protected) ── */}
          <Route path="/create" element={<CreatePaper/>} />   
          <Route path="/viewpapers" element={<AllPapers/>} />

           {/* ECP */}
           {/* ── TEACHER ROUTES (Protected) ── */}
           <Route path="/ecp/dashboard" element={<ExamDashboard />} />
           <Route path="/ecp/create" element={<CreateExam />} />
           <Route path="/ecp/monitor/:examId" element={<ExamMonitor />} />

           {/* SEE */}
           {/* ── STUDENT ROUTES (Protected) ── */}
           <Route path="/exam/:examId"         element={<ExamEntry />} />
           <Route path="/exam/:examId/attempt" element={<ExamAttempt />} />
           <Route path="/exam/:examId/result"  element={<ExamResult />} />
        </Routes>
      </AuthProvider>
     </BrowserRouter>
  </>
  )
}

export default App
