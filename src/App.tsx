
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Extension from "./pages/Extension";
import Manage from "./pages/Manage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/extension" element={<Extension />} />
      <Route path="/manage" element={<Manage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
