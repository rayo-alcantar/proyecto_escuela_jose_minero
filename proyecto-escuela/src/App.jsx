import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./componentes/Login/Login";
import Dashboard from "./componentes/Dashboard/Dashboard";
import Asistencia from "./componentes/Asistencia/Asistencia";
import TareasCalificaciones from "./componentes/TareasCalificaciones/TareasCalificaciones";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Página de inicio */}
        <Route path="/" element={<Login />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Asistencia */}
        <Route path="/asistencia" element={<Asistencia />} />

        {/* Tareas y calificaciones */}
        <Route path="/calificaciones" element={<TareasCalificaciones />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
