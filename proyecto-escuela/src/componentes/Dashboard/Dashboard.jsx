import { useState, useEffect } from "react";
import apiService from "../../services/apiService";
import "./Dashboard.css";
import LayoutPrincipal from "../LayoutPrincipal/LayoutPrincipal";

export default function Dashboard() {
  const [stats, setStats] = useState({
    tareas: 0,
    alumnos: 0,
    proximos: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Obtener datos de diferentes endpoints
        const [tasksResponse, studentsResponse] = await Promise.all([
          apiService.get('/api/tasks'),
          apiService.get('/api/students'),
        ]);

        setStats({
          tareas: tasksResponse.data?.length || 0,
          alumnos: studentsResponse.data?.length || 0,
          proximos: 12, // Esto podría venir de otro endpoint
        });
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <LayoutPrincipal>
      <h2 className="title">Resumen</h2>

      <div className="cards">
        <div className="card">
          <h3>{loading ? "..." : stats.tareas}</h3>
          <p>Tareas</p>
        </div>
        <div className="card">
          <h3>{loading ? "..." : stats.alumnos}</h3>
          <p>Alumnos</p>
        </div>
        <div className="card">
          <h3>{loading ? "..." : stats.proximos}</h3>
          <p>Próximos</p>
        </div>
      </div>

      <h2 className="title">Reportes</h2>

      <div className="report-box">
        <p>Calificaciones</p>
        <button className="report-btn">Generar reporte</button>
      </div>
    </LayoutPrincipal>
  );
}
