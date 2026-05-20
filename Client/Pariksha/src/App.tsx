import CreatePaper from "./pages/CreatePaper"
import AllPapers from "./pages/AllPapers"
import ExamAttempt from "./pages/AttemptExam/Examattempt";
import ExamEntry from "./pages/AttemptExam/Examentry";
import ExamResult from "./pages/AttemptExam/Examresult";
import { Routes, Route, Link } from "react-router-dom";

function App() {
  

  return (
    <>
     <Routes>
        <Route path="/create" element={<CreatePaper/>} />
        <Route path="/viewpapers" element={<AllPapers/>} />


        <Route path="/exam/:examId"         element={<ExamEntry />} />
        <Route path="/exam/:examId/attempt" element={<ExamAttempt />} />
        <Route path="/exam/:examId/result"  element={<ExamResult />} />
      </Routes>
     
    </>
  )
}

export default App
