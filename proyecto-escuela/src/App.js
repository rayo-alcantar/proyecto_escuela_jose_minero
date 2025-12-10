import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./componentes/Login/Login";
import Dashboard from "./componentes/Dashboard/Dashboard";
import Asistencia from "./componentes/Asistencia/Asistencia";
import TareasCalificaciones from "./componentes/TareasCalificaciones/TareasCalificaciones";
import LayoutPrincipal from "./componentes/LayoutPrincipal/LayoutPrincipal";
import authService from "./services/authService";

const PrivateRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<PrivateRoute><LayoutPrincipal /></PrivateRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/asistencia" element={<Asistencia />} />
          <Route path="/calificaciones" element={<TareasCalificaciones />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
