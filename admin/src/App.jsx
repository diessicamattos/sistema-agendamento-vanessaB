import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ServicesManage from "./pages/ServicesManage";
import Finance from "./pages/Finance";
import Login from "./pages/Login";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/services" element={<ServicesManage />} />
      <Route path="/finance" element={<Finance />} />
      {/* fallback */}
      <Route path="*" element={<Dashboard />} />
    </Routes>
  );
}
