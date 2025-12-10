import { Outlet, Link } from "react-router-dom";
import "./LayoutPrincipal.css";

function LayoutPrincipal() {
  return (
    <div className="layout-container">

      <nav className="sidebar">
        <h2>Menú</h2>
        <ul>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/asistencia">Asistencia</Link></li>
          <li><Link to="/tareas">Tareas y calificaciones</Link></li>
        </ul>
      </nav>

      <main className="content">
        {/* Aquí es donde React Router carga el componente hijo */}
        <Outlet />
      </main>

    </div>
  );
}

export default LayoutPrincipal;
