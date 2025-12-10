import { useState, useEffect } from "react";
import taskService from "../../services/taskService";
import subjectService from "../../services/subjectService";
import taskSubmissionService from "../../services/taskSubmissionService";
import "./TareasCalificaciones.css";

export default function TareasCalificaciones() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [tasksWithGrades, setTasksWithGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await subjectService.getSubjects();
        const list = response.data || [];
        setSubjects(list);
        if (list.length > 0) {
          setSelectedSubject(list[0]._id);
        }
        setError(null);
      } catch (err) {
        console.error('Error al cargar materias:', err);
        setError('No se pudieron cargar las materias. Verifica que el backend esté corriendo.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  useEffect(() => {
    if (!selectedSubject) return;

    const fetchTasksAndGrades = async () => {
      try {
        const tasksResponse = await taskService.getTasks({ subjectId: selectedSubject });
        const fetchedTasks = tasksResponse.data || [];

        const tasksWithData = await Promise.all(
          fetchedTasks.map(async (task) => {
            try {
              const submissionsResponse = await taskSubmissionService.getSubmissions({ taskId: task._id });
              const submissions = submissionsResponse.data || [];

              const totalSubmissions = submissions.length;
              const gradedSubmissions = submissions.filter(s => typeof s.score === 'number');
              const averageScore = gradedSubmissions.length > 0
                ? gradedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / gradedSubmissions.length
                : null;

              return {
                ...task,
                totalSubmissions,
                gradedSubmissions: gradedSubmissions.length,
                averageGrade: averageScore != null ? averageScore.toFixed(1) : null,
              };
            } catch (err) {
              console.error(`Error al cargar datos de tarea ${task._id}:`, err);
              return {
                ...task,
                totalSubmissions: 0,
                gradedSubmissions: 0,
                averageGrade: null,
              };
            }
          })
        );

        setTasksWithGrades(tasksWithData);
        setError(null);
      } catch (err) {
        console.error('Error al cargar tareas:', err);
        setError('Error al cargar tareas.');
      }
    };

    fetchTasksAndGrades();
  }, [selectedSubject]);

  return (
    <>
      <h2 className="title">Tareas y calificaciones</h2>

      {error && (
        <div style={{ padding: '10px', backgroundColor: '#fee', marginBottom: '10px', borderRadius: '4px' }}>
          <p style={{ color: '#c00', margin: 0 }}>{error}</p>
        </div>
      )}

      <select
        className="select"
        value={selectedSubject}
        onChange={(e) => setSelectedSubject(e.target.value)}
        disabled={loading || subjects.length === 0}
      >
        {subjects.length > 0 ? (
          subjects.map((subject) => (
            <option key={subject._id} value={subject._id}>
              {subject.name}
            </option>
          ))
        ) : (
          <option value="">No hay materias disponibles</option>
        )}
      </select>

      <table className="tabla">
        <thead>
          <tr>
            <th>Tarea</th>
            <th>Entregas</th>
            <th>Calificadas</th>
            <th>Promedio</th>
          </tr>
        </thead>
        <tbody>
          {tasksWithGrades.length > 0 ? (
            tasksWithGrades.map((task) => (
              <tr key={task._id}>
                <td>{task.title || task.name || task.description}</td>
                <td style={{ textAlign: 'center' }}>{task.totalSubmissions}</td>
                <td style={{ textAlign: 'center' }}>{task.gradedSubmissions}</td>
                <td style={{ textAlign: 'center' }}>
                  {task.averageGrade != null ? task.averageGrade : "-"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center' }}>
                {loading ? "Cargando..." : "No hay tareas registradas para esta materia"}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <button className="register-btn">Registrar Nueva Tarea</button>
    </>
  );
}
