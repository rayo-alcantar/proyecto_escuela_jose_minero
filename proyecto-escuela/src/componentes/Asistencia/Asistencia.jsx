import { useState, useEffect } from "react";
import apiService from "../../services/apiService";
import "./Asistencia.css";
import LayoutPrincipal from "../LayoutPrincipal/LayoutPrincipal";

export default function Asistencia() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await apiService.get('/api/groups');
        setGroups(response.data || []);
        if (response.data && response.data.length > 0) {
          setSelectedGroup(response.data[0]._id);
        }
      } catch (error) {
        console.error('Error al cargar grupos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  useEffect(() => {
    if (!selectedGroup) return;

    const fetchAttendance = async () => {
      try {
        const response = await apiService.get(`/api/attendance?group=${selectedGroup}`);
        setAttendance(response.data || []);
      } catch (error) {
        console.error('Error al cargar asistencia:', error);
      }
    };

    fetchAttendance();
  }, [selectedGroup]);

  return (
    <LayoutPrincipal>
      <h2 className="title">Asistencia</h2>

      <select
        className="select"
        value={selectedGroup}
        onChange={(e) => setSelectedGroup(e.target.value)}
        disabled={loading}
      >
        {groups.map((group) => (
          <option key={group._id} value={group._id}>
            {group.name || `${group.grade}° ${group.section}`}
          </option>
        ))}
      </select>

      <table className="tabla">
        <thead>
          <tr>
            <th>Alumno</th>
            <th>L</th><th>M</th><th>M</th><th>J</th><th>V</th>
          </tr>
        </thead>

        <tbody>
          {attendance.length > 0 ? (
            attendance.map((record, idx) => (
              <tr key={idx}>
                <td>{record.studentName || "Estudiante"}</td>
                <td>✓</td><td>✓</td><td>✗</td><td>✗</td><td>✓</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center' }}>
                {loading ? "Cargando..." : "No hay registros de asistencia"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </LayoutPrincipal>
  );
}
