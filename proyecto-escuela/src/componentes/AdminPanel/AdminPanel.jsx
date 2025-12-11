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

function useInput(initialValue = "") {
  const [value, setValue] = useState(initialValue);
  return { value, setValue, bind: { value, onChange: (e) => setValue(e.target.value) } };
}

const getErrorMessage = (err) => {
  if (!err) return "Ocurrió un error inesperado";
  if (err.message) return err.message;
  if (typeof err === "string") return err;
  return "No se pudo completar la operación";
};

export default function AdminPanel() {
  const currentUser = authService.getCurrentUser();
  const canManageUsers = currentUser?.role === "ADMIN";
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [enrollmentsByGroup, setEnrollmentsByGroup] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState("");
  const [success, setSuccess] = useState("");

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
  const [attendanceRecords, setAttendanceRecords] = useState({});

  const teacherUsers = useMemo(() => users.filter((u) => u.role === "TEACHER"), [users]);
  const studentsCount = students.length;
  const groupsCount = groups.length;
  const subjectsCount = subjects.length;

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
    alert(message);
    setSuccess(message);
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
      if (groupsRes.data?.length) {
        setGroupTutor(groupsRes.data[0].tutor?._id || "");
        setEnrollmentGroup(groupsRes.data[0]._id);
        setTaskGroup(groupsRes.data[0]._id);
        setAttendanceGroup(groupsRes.data[0]._id);
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

  const handleCreateUser = async (e) => {
    e.preventDefault();
    resetMessages();
    try {
      if (!canManageUsers) {
        showError("Solo ADMIN puede crear usuarios.", "crear usuario");
        return;
      }
      await userService.createUser({
        fullName: userFullName,
        email: userEmail,
        password: userPassword,
        role: userRole,
      });
      showSuccess("Usuario creado correctamente.");
      setUserFullName("");
      setUserEmail("");
      setUserPassword("");
      setUserRole("TEACHER");
      const refreshed = await userService.getUsers();
      setUsers(refreshed.data || []);
    } catch (err) {
      showError(err, "crear usuario");
    }
  };

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
      if (newId) {
        setEnrollmentStudent(newId);
      }
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
        await loadEnrollmentsForGroup(targetGroup);
      }
    } catch (err) {
      showError(err, "crear grupo");
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

      <div className="grid">
        <section className="card wide">
          <h3>Resumen rápido</h3>
          <div className="summary">
            <div>
              <strong>Alumnos ({studentsCount}):</strong>
              <ul>
                {students.slice(0, 5).map((s) => (
                  <li key={s._id}>{s.firstName} {s.lastName}</li>
                ))}
                {students.length === 0 && <li className="muted">Sin alumnos aún</li>}
              </ul>
            </div>
            <div>
              <strong>Grupos ({groupsCount}):</strong>
              <ul>
                {groups.slice(0, 5).map((g) => (
                  <li key={g._id}>{g.name} (Grado {g.gradeLevel})</li>
                ))}
                {groups.length === 0 && <li className="muted">Sin grupos aún</li>}
              </ul>
            </div>
            <div>
              <strong>Materias ({subjectsCount}):</strong>
              <ul>
                {subjects.slice(0, 5).map((s) => (
                  <li key={s._id}>{s.name}</li>
                ))}
                {subjects.length === 0 && <li className="muted">Sin materias aún</li>}
              </ul>
            </div>
          </div>
        </section>

        <section className="card">
          <h3>Crear usuario</h3>
          <form onSubmit={handleCreateUser} className="form">
            {!canManageUsers && <p className="muted">Solo ADMIN puede gestionar usuarios.</p>}
            <input type="text" placeholder="Nombre completo" required disabled={!canManageUsers} {...bindUserFullName} />
            <input type="email" placeholder="Email" required disabled={!canManageUsers} {...bindUserEmail} />
            <input type="password" placeholder="Contraseña" required disabled={!canManageUsers} {...bindUserPassword} />
            <select disabled={!canManageUsers} {...bindUserRole}>
              <option value="ADMIN">ADMIN</option>
              <option value="DIRECTION">DIRECTION</option>
              <option value="TEACHER">TEACHER</option>
            </select>
            <button type="submit" disabled={!canManageUsers}>Crear usuario</button>
          </form>
        </section>

        <section className="card">
          <h3>Crear alumno</h3>
          <form onSubmit={handleCreateStudent} className="form">
            <input type="text" placeholder="Nombre" required {...bindStudentFirstName} />
            <input type="text" placeholder="Apellidos" required {...bindStudentLastName} />
            <input type="text" placeholder="Código (opcional)" {...bindStudentCode} />
            <button type="submit">Crear alumno</button>
          </form>
        </section>

        <section className="card">
          <h3>Crear grupo</h3>
          <form onSubmit={handleCreateGroup} className="form">
            <input type="text" placeholder="Nombre" required {...bindGroupName} />
            <input type="number" min="1" max="6" placeholder="Grado" required {...bindGroupGrade} />
            <input type="text" placeholder="Sección" {...bindGroupSection} />
            <input type="text" placeholder="Ciclo escolar" required {...bindGroupYear} />
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
          <h3>Crear materia</h3>
          <form onSubmit={handleCreateSubject} className="form">
            <input type="text" placeholder="Nombre" required {...bindSubjectName} />
            <input type="text" placeholder="Código" required {...bindSubjectCode} />
            <input type="number" min="1" max="6" placeholder="Grado (opcional)" {...bindSubjectGrade} />
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
          <h3>Crear inscripción</h3>
          <form onSubmit={handleCreateEnrollment} className="form">
            <select {...bindEnrollmentStudent} required>
              <option value="">Selecciona alumno</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>{`${s.firstName} ${s.lastName}`}</option>
              ))}
            </select>
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
            <input type="text" placeholder="Título" required {...bindTaskTitle} />
            <textarea placeholder="Descripción" rows={2} {...bindTaskDesc} />
            <select {...bindTaskGroup} required>
              <option value="">Selecciona grupo</option>
              {groups.map((g) => (
                <option key={g._id} value={g._id}>{g.name}</option>
              ))}
            </select>
            <select {...bindTaskSubject} required>
              <option value="">Selecciona materia</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
            <input type="date" required {...bindTaskDueDate} />
            <button type="submit">Crear tarea</button>
          </form>
        </section>

        <section className="card wide">
          <h3>Alumnos registrados ({studentsCount})</h3>
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
        </section>

        <section className="card wide">
          <h3>Grupos registrados ({groupsCount})</h3>
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
        </section>

        <section className="card wide">
          <h3>Registrar asistencia</h3>
          <form onSubmit={handleSubmitAttendance}>
            <div className="attendance-header">
              <select {...bindAttendanceGroup} required>
                <option value="">Selecciona grupo</option>
                {groups.map((g) => (
                  <option key={g._id} value={g._id}>{g.name}</option>
                ))}
              </select>
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
      </div>
    </div>
  );
}
