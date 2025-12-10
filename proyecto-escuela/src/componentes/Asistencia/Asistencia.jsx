import { useState, useEffect } from "react";
import attendanceService from "../../services/attendanceService";
import groupService from "../../services/groupService";
import enrollmentService from "../../services/enrollmentService";
import "./Asistencia.css";

const emptyStats = { present: 0, absent: 0, late: 0, excused: 0, total: 0 };

export default function Asistencia() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [enrollments, setEnrollments] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await groupService.getGroups();
        const groupList = response.data || [];
        setGroups(groupList);
        if (groupList.length > 0) {
          setSelectedGroup(groupList[0]._id);
        }
        setError(null);
      } catch (err) {
        console.error('Error al cargar grupos:', err);
        setError('No se pudieron cargar los grupos. Verifica que el backend esté corriendo.');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  useEffect(() => {
    if (!selectedGroup) return;

    const fetchStudentsAndAttendance = async () => {
      try {
        const enrollmentsPromise = enrollmentService
          .getEnrollments({ groupId: selectedGroup })
          .catch(() => ({ data: [] }));

        const attendancePromise = attendanceService
          .getAttendance({ groupId: selectedGroup })
          .catch(() => ({ data: [] }));

        const [enrollmentsResponse, attendanceResponse] = await Promise.all([
          enrollmentsPromise,
          attendancePromise,
        ]);

        const enrollmentsData = enrollmentsResponse.data || [];
        const attendanceData = attendanceResponse.data || [];

        const summary = {};
        attendanceData.forEach((session) => {
          (session.records || []).forEach((record) => {
            const studentId = record.student?._id || record.student;
            const status = (record.status || 'PRESENT').toUpperCase();
            if (!summary[studentId]) {
              summary[studentId] = { ...emptyStats };
            }
            if (status === 'PRESENT') summary[studentId].present += 1;
            if (status === 'ABSENT') summary[studentId].absent += 1;
            if (status === 'LATE') summary[studentId].late += 1;
            if (status === 'EXCUSED') summary[studentId].excused += 1;
            summary[studentId].total += 1;
          });
        });

        setEnrollments(enrollmentsData);
        setAttendanceSummary(summary);
        setError(null);
      } catch (err) {
        console.error('Error al cargar asistencia:', err);
        setError('Error al cargar datos de asistencia.');
      }
    };

    fetchStudentsAndAttendance();
  }, [selectedGroup]);

  const renderStudentRow = (enrollment) => {
    const student = enrollment.student;
    const studentId = student?._id || student;
    const studentName = student?.firstName && student?.lastName
      ? `${student.firstName} ${student.lastName}`
      : student?.studentCode || "Estudiante";

    const stats = attendanceSummary[studentId] || emptyStats;
    const totalAbsences = stats.absent + stats.excused;
    const percentage = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : 0;

    return (
      <tr key={studentId}>
        <td>{studentName}</td>
        <td style={{ textAlign: 'center' }}>{stats.present}</td>
        <td style={{ textAlign: 'center' }}>{totalAbsences}</td>
        <td style={{ textAlign: 'center' }}>{percentage}%</td>
      </tr>
    );
  };

  return (
    <>
      <h2 className="title">Asistencia</h2>

      {error && (
        <div style={{ padding: '10px', backgroundColor: '#fee', marginBottom: '10px', borderRadius: '4px' }}>
          <p style={{ color: '#c00', margin: 0 }}>{error}</p>
        </div>
      )}

      <select
        className="select"
        value={selectedGroup}
        onChange={(e) => setSelectedGroup(e.target.value)}
        disabled={loading || groups.length === 0}
      >
        {groups.length > 0 ? (
          groups.map((group) => (
            <option key={group._id} value={group._id}>
              {group.name || `Grado ${group.gradeLevel} ${group.section || ''}`}
            </option>
          ))
        ) : (
          <option value="">No hay grupos disponibles</option>
        )}
      </select>

      <table className="tabla">
        <thead>
          <tr>
            <th>Alumno</th>
            <th>Total Asistencias</th>
            <th>Total Faltas</th>
            <th>Porcentaje</th>
          </tr>
        </thead>

        <tbody>
          {enrollments.length > 0 ? (
            enrollments.map(renderStudentRow)
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center' }}>
                {loading ? "Cargando..." : "No hay estudiantes inscritos en este grupo"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
