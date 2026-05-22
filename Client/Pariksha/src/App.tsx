import CreatePaper from "./pages/CreatePaper"
import AllPapers from "./pages/AllPapers"
import ExamAttempt from "./pages/AttemptExam/Examattempt";
import ExamEntry from "./pages/AttemptExam/Examentry";
import ExamResult from "./pages/AttemptExam/Examresult";
import CreateExam from "./pages/ECP/CreateExam";
import ExamDashboard from "./pages/ECP/ExamDashboard";
import ExamMonitor from "./pages/ECP/ExamMonitor";

import { Routes, Route, Link } from "react-router-dom";

function App() {
  

  return (
    <>
     <Routes>

        
         {/* QPB */}
        <Route path="/create" element={<CreatePaper/>} />
        <Route path="/viewpapers" element={<AllPapers/>} />

        {/* ECP */}
        <Route path="/ecp/dashboard" element={<ExamDashboard />} />
        <Route path="/ecp/create" element={<CreateExam />} />
        <Route path="/ecp/monitor/:examId" element={<ExamMonitor />} />

        {/* SEE */}
        <Route path="/exam/:examId"         element={<ExamEntry />} />
        <Route path="/exam/:examId/attempt" element={<ExamAttempt />} />
        <Route path="/exam/:examId/result"  element={<ExamResult />} />
      </Routes>
     
    </>
  )
}

export default App
