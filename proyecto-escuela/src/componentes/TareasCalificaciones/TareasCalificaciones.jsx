import { useState, useEffect } from "react";
import apiService from "../../services/apiService";
import "./TareasCalificaciones.css";
import LayoutPrincipal from "../LayoutPrincipal/LayoutPrincipal";

export default function TareasCalificaciones() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await apiService.get('/api/subjects');
        setSubjects(response.data || []);
        if (response.data && response.data.length > 0) {
          setSelectedSubject(response.data[0]._id);
        }
      } catch (error) {
        console.error('Error al cargar materias:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  useEffect(() => {
    if (!selectedSubject) return;

    const fetchTasks = async () => {
      try {
        const response = await apiService.get(`/api/tasks?subject=${selectedSubject}`);
        setTasks(response.data || []);
      } catch (error) {
        console.error('Error al cargar tareas:', error);
      }
    };

    fetchTasks();
  }, [selectedSubject]);

  return (
    <LayoutPrincipal>
      <h2 className="title">Tareas y calificaciones</h2>

      <select
        className="select"
        value={selectedSubject}
        onChange={(e) => setSelectedSubject(e.target.value)}
        disabled={loading}
      >
        {subjects.map((subject) => (
          <option key={subject._id} value={subject._id}>
            {subject.name}
          </option>
        ))}
      </select>

      <table className="tabla">
        <thead>
          <tr>
            <th>Tarea</th>
            <th>Calificación</th>
          </tr>
        </thead>
        <tbody>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <tr key={task._id}>
                <td>{task.title || task.name}</td>
                <td>{task.grade || "-"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2" style={{ textAlign: 'center' }}>
                {loading ? "Cargando..." : "No hay tareas registradas"}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <button className="register-btn">Registrar</button>
    </LayoutPrincipal>
  );
}
