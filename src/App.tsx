
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Extension from "./pages/Extension";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/extension" element={<Extension />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
