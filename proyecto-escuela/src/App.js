import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./componentes/Login/Login";
import Dashboard from "./componentes/Dashboard/Dashboard";
import Asistencia from "./componentes/Asistencia/Asistencia";
import TareasCalificaciones from "./componentes/TareasCalificaciones/TareasCalificaciones";
import LayoutPrincipal from "./componentes/LayoutPrincipal/LayoutPrincipal";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route path="/" element={<Login />} />

        {/* Diseño principal con menú */}
        <Route element={<LayoutPrincipal />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/asistencia" element={<Asistencia />} />
          <Route path="/tareas" element={<TareasCalificaciones />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
