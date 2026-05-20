import CreatePaper from "./pages/CreatePaper"
import AllPapers from "./pages/AllPapers"
import { Routes, Route, Link } from "react-router-dom";

function App() {
  

  return (
    <>
     <Routes>
        <Route path="/create" element={<CreatePaper/>} />
        <Route path="/viewpapers" element={<AllPapers/>} />
      </Routes>
     
    </>
  )
}

export default App
