import { useState, useEffect } from "react";
import taskService from "../../services/taskService";
import studentService from "../../services/studentService";
import groupService from "../../services/groupService";
import subjectService from "../../services/subjectService";
import reportService from "../../services/reportService";
import "./Dashboard.css";

export default function Dashboard() {
  const [stats, setStats] = useState({
    tareas: '-',
    alumnos: '-',
    grupos: '-',
    materias: '-',
  });
  const [defaultGroupId, setDefaultGroupId] = useState("");
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const tasksPromise = taskService.getTasks().catch(() => ({ data: [] }));
        const studentsPromise = studentService.getStudents().catch(() => ({ data: [] }));
        const groupsPromise = groupService.getGroups().catch(() => ({ data: [] }));
        const subjectsPromise = subjectService.getSubjects().catch(() => ({ data: [] }));

        const [tasksResponse, studentsResponse, groupsResponse, subjectsResponse] = await Promise.all([
          tasksPromise,
          studentsPromise,
          groupsPromise,
          subjectsPromise,
        ]);

        const groupsData = groupsResponse.data || [];
        if (groupsData.length > 0) {
          setDefaultGroupId(groupsData[0]._id);
        }

        setStats({
          tareas: tasksResponse.data?.length || 0,
          alumnos: studentsResponse.data?.length || 0,
          grupos: groupsData.length,
          materias: subjectsResponse.data?.length || 0,
        });
      } catch (err) {
        console.error('Error al cargar estadísticas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleGenerateReport = async () => {
    if (!defaultGroupId) {
      alert('Primero crea al menos un grupo para generar reportes.');
      return;
    }

    setGeneratingReport(true);
    try {
      const [attendanceSummary, gradesSummary, participationSummary] = await Promise.all([
        reportService.getAttendanceSummary({ groupId: defaultGroupId }).catch(() => ({ data: {} })),
        reportService.getGradesSummary({ groupId: defaultGroupId }).catch(() => ({ data: {} })),
        reportService.getParticipationSummary({ groupId: defaultGroupId }).catch(() => ({ data: {} }))
      ]);

      console.log('=== REPORTE GENERAL DEL SISTEMA ===');
      console.log('\nEstadísticas actuales:');
      console.log(`   - Tareas: ${stats.tareas}`);
      console.log(`   - Alumnos: ${stats.alumnos}`);
      console.log(`   - Grupos: ${stats.grupos}`);
      console.log(`   - Materias: ${stats.materias}`);
      console.log(`   - Grupo base para reportes: ${defaultGroupId}`);

      console.log('\nResumen de Asistencia:', attendanceSummary.data);
      console.log('\nResumen de Calificaciones:', gradesSummary.data);
      console.log('\nResumen de Participación:', participationSummary.data);
      console.log('\n=====================================');

      alert('Reporte generado. Revisa la consola del navegador (F12) para ver los detalles completos.');
    } catch (err) {
      console.error('Error al generar reporte:', err);
      alert('Error al generar reporte: ' + (err.message || 'Error desconocido'));
    } finally {
      setGeneratingReport(false);
    }
  };

  return (
    <>
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
          <h3>{loading ? "..." : stats.grupos}</h3>
          <p>Grupos</p>
        </div>
        <div className="card">
          <h3>{loading ? "..." : stats.materias}</h3>
          <p>Materias</p>
        </div>
      </div>

      <h2 className="title">Reportes</h2>

      <div className="report-box">
        <p>Calificaciones</p>
        <button
          className="report-btn"
          onClick={handleGenerateReport}
          disabled={generatingReport}
        >
          {generatingReport ? 'Generando...' : 'Generar reporte'}
        </button>
      </div>
    </>
  );
}
