import { BrowserRouter, Routes, Route } from "react-router-dom";
import SpotDetail from "./pages/spotDetail";


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/spotDetail" element={<SpotDetail />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
