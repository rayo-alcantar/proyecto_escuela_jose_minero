import { useEffect, useMemo, useState } from "react";
import userService from "../../services/userService";
import studentService from "../../services/studentService";
import groupService from "../../services/groupService";
import subjectService from "../../services/subjectService";
import enrollmentService from "../../services/enrollmentService";
import taskService from "../../services/taskService";
import attendanceService from "../../services/attendanceService";
import authService from "../../services/authService";
import "./AdminPanel.css";

const attendanceStatuses = ["PRESENT", "ABSENT", "LATE", "EXCUSED"];

const getErrorMessage = (err) => {
  if (!err) return "Ocurrió un error inesperado";
  if (err.message) return err.message;
  if (typeof err === "string") return err;
  return "No se pudo completar la operación";
};

const useInput = (initialValue = "") => {
  const [value, setValue] = useState(initialValue);
  return { value, setValue, bind: { value, onChange: (e) => setValue(e.target.value) } };
};

export default function AdminPanel() {
  const currentUser = authService.getCurrentUser();
  const canManageUsers = currentUser?.role === "ADMIN";

  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [enrollmentsByGroup, setEnrollmentsByGroup] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState("");
  const [success, setSuccess] = useState("");
  const [showStudentsList, setShowStudentsList] = useState(false);
  const [showGroupsList, setShowGroupsList] = useState(false);

  const { value: userFullName, bind: bindUserFullName, setValue: setUserFullName } = useInput("");
  const { value: userEmail, bind: bindUserEmail, setValue: setUserEmail } = useInput("");
  const { value: userPassword, bind: bindUserPassword, setValue: setUserPassword } = useInput("");
  const { value: userRole, bind: bindUserRole, setValue: setUserRole } = useInput("TEACHER");

  const { value: studentFirstName, bind: bindStudentFirstName, setValue: setStudentFirstName } = useInput("");
  const { value: studentLastName, bind: bindStudentLastName, setValue: setStudentLastName } = useInput("");
  const { value: studentCode, bind: bindStudentCode, setValue: setStudentCode } = useInput("");

  const { value: groupName, bind: bindGroupName, setValue: setGroupName } = useInput("");
  const { value: groupGrade, bind: bindGroupGrade, setValue: setGroupGrade } = useInput("1");
  const { value: groupSection, bind: bindGroupSection, setValue: setGroupSection } = useInput("");
  const { value: groupYear, bind: bindGroupYear, setValue: setGroupYear } = useInput("2024-2025");
  const { value: groupTutor, bind: bindGroupTutor, setValue: setGroupTutor } = useInput("");

  const { value: tutorGroup, bind: bindTutorGroup, setValue: setTutorGroup } = useInput("");
  const { value: tutorTeacher, bind: bindTutorTeacher, setValue: setTutorTeacher } = useInput("");

  const { value: subjectName, bind: bindSubjectName, setValue: setSubjectName } = useInput("");
  const { value: subjectCode, bind: bindSubjectCode, setValue: setSubjectCode } = useInput("");
  const { value: subjectGrade, bind: bindSubjectGrade, setValue: setSubjectGrade } = useInput("");
  const { value: subjectTeacher, bind: bindSubjectTeacher, setValue: setSubjectTeacher } = useInput("");

  const { value: enrollmentStudent, bind: bindEnrollmentStudent, setValue: setEnrollmentStudent } = useInput("");
  const { value: enrollmentGroup, bind: bindEnrollmentGroup, setValue: setEnrollmentGroup } = useInput("");

  const { value: taskTitle, bind: bindTaskTitle, setValue: setTaskTitle } = useInput("");
  const { value: taskDesc, bind: bindTaskDesc, setValue: setTaskDesc } = useInput("");
  const { value: taskGroup, bind: bindTaskGroup, setValue: setTaskGroup } = useInput("");
  const { value: taskSubject, bind: bindTaskSubject, setValue: setTaskSubject } = useInput("");
  const { value: taskDueDate, bind: bindTaskDueDate, setValue: setTaskDueDate } = useInput("");

  const { value: attendanceGroup, bind: bindAttendanceGroup, setValue: setAttendanceGroup } = useInput("");

  const teacherUsers = useMemo(() => users.filter((u) => u.role === "TEACHER"), [users]);

  const resetMessages = () => {
    setErrors("");
    setSuccess("");
  };

  const showError = (err, context = "") => {
    const message = getErrorMessage(err);
    const statusText = err?.status ? ` (HTTP ${err.status})` : "";
    const details = err?.details ? JSON.stringify(err.details) : "";
    console.error(`Error en ${context || "operación"}${statusText}`, err);
    alert(`Error: ${message}${statusText}${details ? "\n" + details : ""}`);
    setErrors(`${message}${statusText}`);
  };

  const showSuccess = (message) => {
    setErrors("");
    setSuccess(message);
    alert(message);
  };

  const loadCatalogs = async () => {
    try {
      const [usersRes, studentsRes, groupsRes, subjectsRes] = await Promise.all([
        canManageUsers ? userService.getUsers().catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        studentService.getStudents().catch(() => ({ data: [] })),
        groupService.getGroups().catch(() => ({ data: [] })),
        subjectService.getSubjects().catch(() => ({ data: [] })),
      ]);

      setUsers(usersRes.data || []);
      setStudents(studentsRes.data || []);
      setGroups(groupsRes.data || []);
      setSubjects(subjectsRes.data || []);
      const firstGroup = groupsRes.data?.[0];
      if (firstGroup) {
        setGroupTutor(firstGroup.tutor?._id || "");
        setEnrollmentGroup(firstGroup._id);
        setTaskGroup(firstGroup._id);
        setAttendanceGroup(firstGroup._id);
        setTutorGroup(firstGroup._id);
      }
      const firstTeacher = teacherUsers?.[0];
      if (firstTeacher) {
        setTutorTeacher(firstTeacher._id);
      }
      if (subjectsRes.data?.length) {
        setTaskSubject(subjectsRes.data[0]._id);
      }
      if (studentsRes.data?.length) {
        setEnrollmentStudent(studentsRes.data[0]._id);
      }
    } catch (err) {
      showError(err, "cargar catálogos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalogs();
  }, []);

  const loadEnrollmentsForGroup = async (groupId) => {
    if (!groupId) return;
    try {
      const resp = await enrollmentService.getEnrollments({ groupId });
      const enrolls = resp.data || [];
      setEnrollmentsByGroup(enrolls);
      const defaults = {};
      enrolls.forEach((en) => {
        const id = en.student?._id || en.student;
        defaults[id] = attendanceStatuses[0];
      });
      setAttendanceRecords(defaults);
    } catch (err) {
      setEnrollmentsByGroup([]);
      showError(err, "cargar inscripciones");
    }
  };

  useEffect(() => {
    loadEnrollmentsForGroup(attendanceGroup);
  }, [attendanceGroup]);

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    resetMessages();
    try {
      const payload = {
        firstName: studentFirstName,
        lastName: studentLastName,
      };
      if (studentCode) payload.studentCode = studentCode;

      const created = await studentService.createStudent(payload);
      showSuccess("Alumno creado correctamente.");
      setStudentFirstName("");
      setStudentLastName("");
      setStudentCode("");
      const refreshed = await studentService.getStudents();
      setStudents(refreshed.data || []);
      const newId = created?.data?._id || refreshed.data?.[0]?._id;
      if (newId) setEnrollmentStudent(newId);
    } catch (err) {
      showError(err, "crear alumno");
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    resetMessages();
    try {
      const resp = await groupService.createGroup({
        name: groupName,
        gradeLevel: Number(groupGrade),
        section: groupSection,
        schoolYear: groupYear,
        tutor: groupTutor || undefined,
      });
      showSuccess("Grupo creado correctamente.");
      setGroupName("");
      setGroupSection("");
      const refreshed = await groupService.getGroups();
      setGroups(refreshed.data || []);
      const targetGroup = resp?.data?._id || refreshed.data?.[0]?._id;
      if (targetGroup) {
        setEnrollmentGroup(targetGroup);
        setTaskGroup(targetGroup);
        setAttendanceGroup(targetGroup);
        setTutorGroup(targetGroup);
        await loadEnrollmentsForGroup(targetGroup);
      }
    } catch (err) {
      showError(err, "crear grupo");
    }
  };

  const handleAssignTutor = async (e) => {
    e.preventDefault();
    resetMessages();
    try {
      await groupService.updateGroup(tutorGroup, { tutor: tutorTeacher });
      showSuccess("Tutor asignado al grupo.");
      const refreshed = await groupService.getGroups();
      setGroups(refreshed.data || []);
    } catch (err) {
      showError(err, "asignar tutor");
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    resetMessages();
    try {
      await subjectService.createSubject({
        name: subjectName,
        code: subjectCode,
        gradeLevel: subjectGrade ? Number(subjectGrade) : undefined,
        teacher: subjectTeacher || undefined,
      });
      showSuccess("Materia creada correctamente.");
      setSubjectName("");
      setSubjectCode("");
      setSubjectGrade("");
      const refreshed = await subjectService.getSubjects();
      setSubjects(refreshed.data || []);
      if (refreshed.data?.length) {
        setTaskSubject(refreshed.data[0]._id);
      }
    } catch (err) {
      showError(err, "crear materia");
    }
  };

  const handleCreateEnrollment = async (e) => {
    e.preventDefault();
    resetMessages();
    try {
      await enrollmentService.createEnrollment({
        studentId: enrollmentStudent,
        groupId: enrollmentGroup,
      });
      showSuccess("Inscripción creada correctamente.");
      await loadEnrollmentsForGroup(enrollmentGroup);
    } catch (err) {
      showError(err, "crear inscripción");
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    resetMessages();
    try {
      await taskService.createTask({
        title: taskTitle,
        description: taskDesc,
        groupId: taskGroup,
        subjectId: taskSubject,
        dueDate: taskDueDate,
      });
      showSuccess("Tarea creada correctamente.");
      setTaskTitle("");
      setTaskDesc("");
    } catch (err) {
      showError(err, "crear tarea");
    }
  };

  const handleSubmitAttendance = async (e) => {
    e.preventDefault();
    resetMessages();
    try {
      const records = Object.entries(attendanceRecords).map(([studentId, status]) => ({
        studentId,
        status,
      }));
      if (!records.length) {
        showError("No hay alumnos inscritos en el grupo seleccionado.", "registrar asistencia");
        return;
      }
      await attendanceService.saveAttendance({
        groupId: attendanceGroup,
        records,
      });
      showSuccess("Asistencia registrada correctamente.");
    } catch (err) {
      showError(err, "registrar asistencia");
    }
  };

  if (loading) {
    return <p style={{ color: "white" }}>Cargando datos del panel...</p>;
  }

  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "DIRECTION")) {
    return <p style={{ color: "white" }}>Solo usuarios con rol ADMIN o DIRECTION pueden usar este panel.</p>;
  }

  return (
    <div className="admin-panel">
      <h2>Panel Administrador</h2>

      {(errors || success) && (
        <div className={`banner ${errors ? "error" : "success"}`}>
          {errors || success}
        </div>
      )}

      <div className="toolbar">
        <button className="secondary" onClick={loadCatalogs}>Refrescar datos</button>
        <span className="muted">Alumnos: {students.length} | Grupos: {groups.length} | Materias: {subjects.length}</span>
      </div>

      <div className="grid">
        <section className="card">
          <h3>Crear alumno</h3>
          <form onSubmit={handleCreateStudent} className="form">
            <label>Nombre</label>
            <input type="text" required {...bindStudentFirstName} />
            <label>Apellidos</label>
            <input type="text" required {...bindStudentLastName} />
            <label>Código (opcional)</label>
            <input type="text" placeholder="Dejar vacío para generar uno" {...bindStudentCode} />
            <button type="submit">Crear alumno</button>
          </form>
        </section>

        <section className="card">
          <h3>Crear grupo</h3>
          <form onSubmit={handleCreateGroup} className="form">
            <label>Nombre</label>
            <input type="text" required {...bindGroupName} />
            <label>Grado (1-6)</label>
            <input type="number" min="1" max="6" required {...bindGroupGrade} />
            <label>Sección</label>
            <input type="text" {...bindGroupSection} />
            <label>Ciclo escolar</label>
            <input type="text" required {...bindGroupYear} />
            <label>Tutor (opcional)</label>
            <select {...bindGroupTutor}>
              <option value="">Sin tutor</option>
              {teacherUsers.map((t) => (
                <option key={t._id} value={t._id}>{t.fullName}</option>
              ))}
            </select>
            <button type="submit">Crear grupo</button>
          </form>
        </section>

        <section className="card">
          <h3>Asignar tutor a grupo</h3>
          <form onSubmit={handleAssignTutor} className="form">
            <label>Grupo</label>
            <select {...bindTutorGroup} required>
              <option value="">Selecciona grupo</option>
              {groups.map((g) => (
                <option key={g._id} value={g._id}>{g.name}</option>
              ))}
            </select>
            <label>Docente</label>
            <select {...bindTutorTeacher} required>
              <option value="">Selecciona docente</option>
              {teacherUsers.map((t) => (
                <option key={t._id} value={t._id}>{t.fullName}</option>
              ))}
            </select>
            <button type="submit">Asignar tutor</button>
          </form>
        </section>

        <section className="card">
          <h3>Crear materia</h3>
          <form onSubmit={handleCreateSubject} className="form">
            <label>Nombre</label>
            <input type="text" required {...bindSubjectName} />
            <label>Código</label>
            <input type="text" required {...bindSubjectCode} />
            <label>Grado (opcional)</label>
            <input type="number" min="1" max="6" {...bindSubjectGrade} />
            <label>Docente (opcional)</label>
            <select {...bindSubjectTeacher}>
              <option value="">Sin docente asignado</option>
              {teacherUsers.map((t) => (
                <option key={t._id} value={t._id}>{t.fullName}</option>
              ))}
            </select>
            <button type="submit">Crear materia</button>
          </form>
        </section>

        <section className="card">
          <h3>Inscripción</h3>
          <form onSubmit={handleCreateEnrollment} className="form">
            <label>Alumno</label>
            <select {...bindEnrollmentStudent} required>
              <option value="">Selecciona alumno</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>{`${s.firstName} ${s.lastName}`}</option>
              ))}
            </select>
            <label>Grupo</label>
            <select {...bindEnrollmentGroup} required>
              <option value="">Selecciona grupo</option>
              {groups.map((g) => (
                <option key={g._id} value={g._id}>{g.name}</option>
              ))}
            </select>
            <button type="submit">Inscribir</button>
          </form>
        </section>

        <section className="card">
          <h3>Crear tarea</h3>
          <form onSubmit={handleCreateTask} className="form">
            <label>Título</label>
            <input type="text" required {...bindTaskTitle} />
            <label>Descripción</label>
            <textarea rows={2} {...bindTaskDesc} />
            <label>Grupo</label>
            <select {...bindTaskGroup} required>
              <option value="">Selecciona grupo</option>
              {groups.map((g) => (
                <option key={g._id} value={g._id}>{g.name}</option>
              ))}
            </select>
            <label>Materia</label>
            <select {...bindTaskSubject} required>
              <option value="">Selecciona materia</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
            <label>Fecha de entrega</label>
            <input type="date" required {...bindTaskDueDate} />
            <button type="submit">Crear tarea</button>
          </form>
        </section>

        <section className="card wide">
          <h3>Asistencia</h3>
          <form onSubmit={handleSubmitAttendance}>
            <div className="attendance-header">
              <div>
                <label>Grupo</label>
                <select {...bindAttendanceGroup} required>
                  <option value="">Selecciona grupo</option>
                  {groups.map((g) => (
                    <option key={g._id} value={g._id}>{g.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit">Guardar asistencia</button>
            </div>

            {enrollmentsByGroup.length === 0 ? (
              <p className="muted">No hay alumnos inscritos en este grupo.</p>
            ) : (
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Alumno</th>
                    <th>Estatus</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollmentsByGroup.map((en) => {
                    const student = en.student;
                    const studentId = student?._id || en.student;
                    const studentName = student?.firstName
                      ? `${student.firstName} ${student.lastName}`
                      : studentId;
                    return (
                      <tr key={studentId}>
                        <td>{studentName}</td>
                        <td>
                          <select
                            value={attendanceRecords[studentId] || "PRESENT"}
                            onChange={(e) =>
                              setAttendanceRecords((prev) => ({
                                ...prev,
                                [studentId]: e.target.value,
                              }))
                            }
                          >
                            {attendanceStatuses.map((st) => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </form>
        </section>

        <section className="card wide">
          <div className="list-header">
            <h3>Alumnos registrados ({students.length})</h3>
            <button className="secondary" onClick={() => setShowStudentsList((s) => !s)}>
              {showStudentsList ? "Ocultar" : "Ver lista"}
            </button>
          </div>
          {showStudentsList && (
            <div className="list-container">
              {students.length === 0 ? (
                <p className="muted">Sin alumnos aún</p>
              ) : (
                <ul className="simple-list">
                  {students.map((s) => (
                    <li key={s._id}>
                      <div className="list-title">{s.firstName} {s.lastName}</div>
                      <div className="list-sub">{s.studentCode ? `Código: ${s.studentCode}` : "Sin código"}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>

        <section className="card wide">
          <div className="list-header">
            <h3>Grupos registrados ({groups.length})</h3>
            <button className="secondary" onClick={() => setShowGroupsList((s) => !s)}>
              {showGroupsList ? "Ocultar" : "Ver lista"}
            </button>
          </div>
          {showGroupsList && (
            <div className="list-container">
              {groups.length === 0 ? (
                <p className="muted">Sin grupos aún</p>
              ) : (
                <ul className="simple-list">
                  {groups.map((g) => (
                    <li key={g._id}>
                      <div className="list-title">{g.name}</div>
                      <div className="list-sub">Grado {g.gradeLevel} {g.section || ""}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
