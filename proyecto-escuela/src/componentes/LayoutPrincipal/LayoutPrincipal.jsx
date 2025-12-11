import { Outlet, Link } from "react-router-dom";
import authService from "../../services/authService";
import "./LayoutPrincipal.css";

function LayoutPrincipal() {
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === "ADMIN" || currentUser?.role === "DIRECTION";
  const isTeacher = currentUser?.role === "TEACHER";
  const showAdminLink = isAdmin || isTeacher;
  const adminLabel = isAdmin ? "Panel admin" : "Mi grupo";

  return (
    <div className="layout-container">
      <nav className="sidebar">
        <h2>Menú</h2>
        <ul>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/asistencia">Asistencia</Link></li>
          <li><Link to="/calificaciones">Tareas y calificaciones</Link></li>
          {showAdminLink && <li><Link to="/admin">{adminLabel}</Link></li>}
        </ul>
      </nav>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export default LayoutPrincipal;
