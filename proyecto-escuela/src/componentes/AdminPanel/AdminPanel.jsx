import { useEffect, useMemo, useState } from 'react';
import authService from '../../services/authService';
import userService from '../../services/userService';
import studentService from '../../services/studentService';
import groupService from '../../services/groupService';
import subjectService from '../../services/subjectService';
import enrollmentService from '../../services/enrollmentService';
import taskService from '../../services/taskService';
import taskSubmissionService from '../../services/taskSubmissionService';
import attendanceService from '../../services/attendanceService';
import './AdminPanel.css';

const attendanceStatuses = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];
const submissionStatuses = ['SUBMITTED', 'GRADED', 'MISSING'];
const studentStatuses = ['ACTIVE', 'INACTIVE', 'GRADUATED'];
const taskStatuses = ['ASSIGNED', 'CLOSED'];

const getErrorMessage = (err) => {
  if (!err) return 'Ocurrio un error inesperado';
  if (typeof err === 'string') return err;
  if (err.message) return err.message;
  return 'No se pudo completar la operacion';
};

const useInput = (initialValue = '') => {
  const [value, setValue] = useState(initialValue);
  return { value, setValue, bind: { value, onChange: (e) => setValue(e.target.value) } };
};

export default function AdminPanel() {
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === 'ADMIN';
  const canManageStaff = isAdmin || currentUser?.role === 'DIRECTION';

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState('');
  const [success, setSuccess] = useState('');

  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [attendanceEnrollments, setAttendanceEnrollments] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});

  const [gradeEnrollments, setGradeEnrollments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [gradeEdits, setGradeEdits] = useState({});

  const [showStudentsList, setShowStudentsList] = useState(false);
  const [showGroupsList, setShowGroupsList] = useState(false);

  const [filterGroup, setFilterGroup] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');

  const [selectedStudentEdit, setSelectedStudentEdit] = useState('');

  const { value: userFullName, bind: bindUserFullName, setValue: setUserFullName } = useInput('');
  const { value: userEmail, bind: bindUserEmail, setValue: setUserEmail } = useInput('');
  const { value: userPassword, bind: bindUserPassword, setValue: setUserPassword } = useInput('');
  const { value: userRole, bind: bindUserRole, setValue: setUserRole } = useInput('TEACHER');
  const [editUserId, setEditUserId] = useState('');
  const [editUserRole, setEditUserRole] = useState('TEACHER');
  const [editUserPassword, setEditUserPassword] = useState('');
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');

  const { value: studentFirstName, bind: bindStudentFirstName, setValue: setStudentFirstName } = useInput('');
  const { value: studentLastName, bind: bindStudentLastName, setValue: setStudentLastName } = useInput('');
  const { value: studentCode, bind: bindStudentCode, setValue: setStudentCode } = useInput('');

  const [editStudentFirst, setEditStudentFirst] = useState('');
  const [editStudentLast, setEditStudentLast] = useState('');
  const [editStudentCode, setEditStudentCode] = useState('');
  const [editStudentStatus, setEditStudentStatus] = useState('ACTIVE');

  const { value: groupName, bind: bindGroupName, setValue: setGroupName } = useInput('');
  const { value: groupGrade, bind: bindGroupGrade, setValue: setGroupGrade } = useInput('1');
  const { value: groupSection, bind: bindGroupSection, setValue: setGroupSection } = useInput('');
  const { value: groupYear, bind: bindGroupYear, setValue: setGroupYear } = useInput('2024-2025');
  const { value: groupTutor, bind: bindGroupTutor, setValue: setGroupTutor } = useInput('');

  const { value: tutorGroup, bind: bindTutorGroup, setValue: setTutorGroup } = useInput('');
  const { value: tutorTeacher, bind: bindTutorTeacher, setValue: setTutorTeacher } = useInput('');

  const { value: subjectName, bind: bindSubjectName, setValue: setSubjectName } = useInput('');
  const { value: subjectCode, bind: bindSubjectCode, setValue: setSubjectCode } = useInput('');
  const { value: subjectGrade, bind: bindSubjectGrade, setValue: setSubjectGrade } = useInput('');
  const { value: subjectTeacher, bind: bindSubjectTeacher, setValue: setSubjectTeacher } = useInput('');

  const { value: enrollmentStudent, bind: bindEnrollmentStudent, setValue: setEnrollmentStudent } = useInput('');
  const { value: enrollmentGroup, bind: bindEnrollmentGroup, setValue: setEnrollmentGroup } = useInput('');

  const { value: taskTitle, bind: bindTaskTitle, setValue: setTaskTitle } = useInput('');
  const { value: taskDesc, bind: bindTaskDesc, setValue: setTaskDesc } = useInput('');
  const { value: taskGroup, bind: bindTaskGroup, setValue: setTaskGroup } = useInput('');
  const { value: taskSubject, bind: bindTaskSubject, setValue: setTaskSubject } = useInput('');
  const { value: taskDueDate, bind: bindTaskDueDate, setValue: setTaskDueDate } = useInput('');

  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskDueDate, setEditTaskDueDate] = useState('');
  const [editTaskStatus, setEditTaskStatus] = useState('ASSIGNED');

  const { value: attendanceGroup, bind: bindAttendanceGroup, setValue: setAttendanceGroup } = useInput('');

  const teacherUsers = useMemo(() => users.filter((u) => u.role === 'TEACHER'), [users]);
  const filteredTasks = useMemo(
    () =>
      tasks.filter((t) => {
        const groupId = t.group?._id || t.group;
        const subjectId = t.subject?._id || t.subject;
        const matchesGroup = !filterGroup || groupId === filterGroup;
        const matchesSubject = !filterSubject || subjectId === filterSubject;
        return matchesGroup && matchesSubject;
      }),
    [tasks, filterGroup, filterSubject],
  );

  const currentUserId = currentUser?._id || currentUser?.id;
  const selectableGroups = useMemo(() => {
    if (currentUser?.role === 'TEACHER' && currentUserId) {
      return groups.filter((g) => {
        const tutorId = g.tutor?._id || g.tutor;
        return tutorId === currentUserId;
      });
    }
    return groups;
  }, [groups, currentUser, currentUserId]);

  const resetMessages = () => {
    setErrors('');
    setSuccess('');
  };

  const showError = (err, context = 'operacion') => {
    const message = getErrorMessage(err);
    const statusText = err?.status ? ` (HTTP ${err.status})` : '';
    const details = err?.details ? JSON.stringify(err.details) : '';
    console.error(`Error en ${context}${statusText}`, err);
    alert(`Error: ${message}${statusText}${details ? '\n' + details : ''}`);
    setErrors(`${message}${statusText}`);
  };

  const showSuccess = (message) => {
    setErrors('');
    setSuccess(message);
    alert(message);
  };

  const loadTasks = async ({ keepSelection = false, incomingFilters = null } = {}) => {
    try {
      const query = {};
      const groupId = incomingFilters?.groupId || filterGroup;
      const subjectId = incomingFilters?.subjectId || filterSubject;
      if (groupId) query.group = groupId;
      if (subjectId) query.subject = subjectId;
      const resp = await taskService.getTasks(query);
      const data = resp?.data || [];
      setTasks(data);
      if (!keepSelection) {
        setSelectedTaskId('');
        setSubmissions([]);
        setGradeEdits({});
      }
    } catch (err) {
      setTasks([]);
      showError(err, 'cargar tareas');
    }
  };

  const loadCatalogs = async () => {
    setLoading(true);
    try {
      const [studentsRes, groupsRes, subjectsRes, usersRes] = await Promise.all([
        studentService.getStudents(),
        groupService.getGroups(),
        subjectService.getSubjects(),
        canManageStaff ? userService.getUsers() : Promise.resolve({ data: [] }),
      ]);

      const studentData = studentsRes?.data || [];
      const groupData = groupsRes?.data || [];
      const subjectData = subjectsRes?.data || [];
      const userData = usersRes?.data || [];

      setStudents(studentData);
      setGroups(groupData);
      setSubjects(subjectData);
      setUsers(userData);

      const teacherList = userData.filter((u) => u.role === 'TEACHER');
      const teacherGroupList =
        currentUser?.role === 'TEACHER' && currentUserId
          ? groupData.filter((g) => (g.tutor?._id || g.tutor) === currentUserId)
          : groupData;

      if (!enrollmentGroup && teacherGroupList[0]?._id) setEnrollmentGroup(teacherGroupList[0]._id);
      if (!attendanceGroup && teacherGroupList[0]?._id) setAttendanceGroup(teacherGroupList[0]._id);
      if (!taskGroup && teacherGroupList[0]?._id) setTaskGroup(teacherGroupList[0]._id);
      if (!tutorGroup && teacherGroupList[0]?._id) setTutorGroup(teacherGroupList[0]._id);
      if (!filterGroup && teacherGroupList[0]?._id) setFilterGroup(teacherGroupList[0]._id);

      if (!taskSubject && subjectData[0]?._id) setTaskSubject(subjectData[0]._id);
      if (!filterSubject && subjectData[0]?._id) setFilterSubject(subjectData[0]._id);

      if (!enrollmentStudent && studentData[0]?._id) setEnrollmentStudent(studentData[0]._id);
      if (!groupTutor && teacherList[0]?._id) setGroupTutor(teacherList[0]._id);
      if (!tutorTeacher && teacherList[0]?._id) setTutorTeacher(teacherList[0]._id);
      if (!editUserId && userData[0]?._id) {
        setEditUserId(userData[0]._id);
        setEditUserRole(userData[0].role || 'TEACHER');
        setEditUserName(userData[0].fullName || '');
        setEditUserEmail(userData[0].email || '');
      }

      await loadTasks({
        keepSelection: true,
        incomingFilters: {
          groupId: filterGroup || groupData[0]?._id,
          subjectId: filterSubject || subjectData[0]?._id,
        },
      });
    } catch (err) {
      showError(err, 'cargar catalogos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalogs();
  }, []);

  useEffect(() => {
    loadTasks();
  }, [filterGroup, filterSubject]);

  useEffect(() => {
    if (!editUserId) {
      setEditUserName('');
      setEditUserEmail('');
      setEditUserRole('TEACHER');
      return;
    }
    const u = users.find((usr) => usr._id === editUserId);
    if (u) {
      setEditUserName(u.fullName || '');
      setEditUserEmail(u.email || '');
      setEditUserRole(u.role || 'TEACHER');
    }
  }, [editUserId, users]);

  const loadAttendanceEnrollments = async (groupId) => {
    if (!groupId) {
      setAttendanceEnrollments([]);
      setAttendanceRecords({});
      return;
    }
    try {
      const resp = await enrollmentService.getEnrollments({ groupId });
      const data = resp?.data || [];
      setAttendanceEnrollments(data);
      const defaults = {};
      data.forEach((en) => {
        const studentId = en.student?._id || en.student;
        defaults[studentId] = attendanceStatuses[0];
      });
      setAttendanceRecords(defaults);
    } catch (err) {
      setAttendanceEnrollments([]);
      showError(err, 'cargar inscripciones del grupo');
    }
  };

  useEffect(() => {
    loadAttendanceEnrollments(attendanceGroup);
  }, [attendanceGroup]);

  const loadSubmissionsForTask = async (taskId, taskInfo) => {
    if (!taskId) return;
    const task = taskInfo || tasks.find((t) => t._id === taskId);
    const groupId = task?.group?._id || task?.group;
    if (!groupId) return;
    try {
      const [enrollRes, subsRes] = await Promise.all([
        enrollmentService.getEnrollments({ groupId }),
        taskSubmissionService.getSubmissions({ taskId }),
      ]);
      const enrollData = enrollRes?.data || [];
      const subs = subsRes?.data || [];
      setGradeEnrollments(enrollData);
      setSubmissions(subs);
      const initial = {};
      enrollData.forEach((en) => {
        const studentId = en.student?._id || en.student;
        const match = subs.find((s) => (s.student?._id || s.student) === studentId);
        initial[studentId] = {
          submissionId: match?._id,
          status: match?.status || 'MISSING',
          score: match?.score ?? '',
          feedback: match?.feedback || '',
        };
      });
      setGradeEdits(initial);
    } catch (err) {
      setGradeEnrollments([]);
      setSubmissions([]);
      showError(err, 'cargar entregas de la tarea');
    }
  };

  const handleSelectTask = async (taskId) => {
    setSelectedTaskId(taskId);
    const task = tasks.find((t) => t._id === taskId);
    if (task) {
      setEditTaskTitle(task.title || '');
      setEditTaskStatus(task.status || 'ASSIGNED');
      setEditTaskDueDate(task.dueDate ? task.dueDate.substring(0, 10) : '');
      await loadSubmissionsForTask(taskId, task);
    }
  };

  useEffect(() => {
    if (filteredTasks.length && !selectedTaskId) {
      handleSelectTask(filteredTasks[0]._id);
    }
    if (selectedTaskId && !filteredTasks.some((t) => t._id === selectedTaskId)) {
      setSelectedTaskId('');
      setSubmissions([]);
      setGradeEdits({});
    }
  }, [filteredTasks, selectedTaskId]);

  useEffect(() => {
    if (!selectedStudentEdit) {
      setEditStudentFirst('');
      setEditStudentLast('');
      setEditStudentCode('');
      setEditStudentStatus('ACTIVE');
      return;
    }
    const student = students.find((s) => s._id === selectedStudentEdit);
    if (student) {
      setEditStudentFirst(student.firstName || '');
      setEditStudentLast(student.lastName || '');
      setEditStudentCode(student.studentCode || '');
      setEditStudentStatus(student.status || 'ACTIVE');
    }
  }, [selectedStudentEdit, students]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    resetMessages();
    try {
      await userService.createUser({
        fullName: userFullName,
        email: userEmail,
        password: userPassword,
        role: userRole,
      });
      showSuccess('Usuario creado correctamente');
      setUserFullName('');
      setUserEmail('');
      setUserPassword('');
      setUserRole('TEACHER');
      await loadCatalogs();
    } catch (err) {
      showError(err, 'crear usuario');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    resetMessages();
    if (!editUserId) {
      showError('Selecciona un usuario', 'actualizar usuario');
      return;
    }
    try {
      const payload = {
        fullName: editUserName,
        email: editUserEmail,
        role: editUserRole,
      };
      if (editUserPassword) payload.password = editUserPassword;
      await userService.updateUser(editUserId, payload);
      showSuccess('Usuario actualizado');
      setEditUserPassword('');
      await loadCatalogs();
    } catch (err) {
      showError(err, 'actualizar usuario');
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
      const createdId = created?.data?._id;
      showSuccess('Alumno creado correctamente');
      setStudentFirstName('');
      setStudentLastName('');
      setStudentCode('');
      await loadCatalogs();
      if (createdId) {
        setEnrollmentStudent(createdId);
      }
    } catch (err) {
      showError(err, 'crear alumno');
    }
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    resetMessages();
    if (!selectedStudentEdit) {
      showError('Selecciona un alumno', 'editar alumno');
      return;
    }
    try {
      const payload = {
        firstName: editStudentFirst,
        lastName: editStudentLast,
        status: editStudentStatus,
      };
      if (editStudentCode || editStudentCode === '') {
        payload.studentCode = editStudentCode || undefined;
      }
      await studentService.updateStudent(selectedStudentEdit, payload);
      showSuccess('Alumno actualizado');
      await loadCatalogs();
    } catch (err) {
      showError(err, 'actualizar alumno');
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    resetMessages();
    try {
      await groupService.createGroup({
        name: groupName,
        gradeLevel: Number(groupGrade),
        section: groupSection,
        schoolYear: groupYear,
        tutor: groupTutor || undefined,
      });
      showSuccess('Grupo creado correctamente');
      setGroupName('');
      setGroupSection('');
      await loadCatalogs();
    } catch (err) {
      showError(err, 'crear grupo');
    }
  };

  const handleAssignTutor = async (e) => {
    e.preventDefault();
    resetMessages();
    try {
      await groupService.updateGroup(tutorGroup, { tutor: tutorTeacher });
      showSuccess('Tutor asignado al grupo');
      await loadCatalogs();
    } catch (err) {
      showError(err, 'asignar tutor');
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
      showSuccess('Materia creada correctamente');
      setSubjectName('');
      setSubjectCode('');
      setSubjectGrade('');
      await loadCatalogs();
    } catch (err) {
      showError(err, 'crear materia');
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
      showSuccess('Inscripcion creada');
      await loadAttendanceEnrollments(enrollmentGroup);
      if (selectedTaskId) {
        await loadSubmissionsForTask(selectedTaskId);
      }
    } catch (err) {
      showError(err, 'crear inscripcion');
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
      showSuccess('Tarea creada');
      setTaskTitle('');
      setTaskDesc('');
      await loadTasks();
    } catch (err) {
      showError(err, 'crear tarea');
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    resetMessages();
    if (!selectedTaskId) {
      showError('Selecciona una tarea', 'editar tarea');
      return;
    }
    try {
      const payload = {
        title: editTaskTitle,
        status: editTaskStatus,
        dueDate: editTaskDueDate,
      };
      await taskService.updateTask(selectedTaskId, payload);
      showSuccess('Tarea actualizada');
      await loadTasks({ keepSelection: true });
      await loadSubmissionsForTask(selectedTaskId);
    } catch (err) {
      showError(err, 'actualizar tarea');
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
        showError('No hay alumnos inscritos en el grupo seleccionado', 'registrar asistencia');
        return;
      }
      await attendanceService.saveAttendance({
        groupId: attendanceGroup,
        records,
      });
      showSuccess('Asistencia registrada');
    } catch (err) {
      showError(err, 'registrar asistencia');
    }
  };

  const handleGradeEdit = (studentId, field, value) => {
    setGradeEdits((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [field]: field === 'score' && value !== '' ? Number(value) : value,
      },
    }));
  };

  const persistGrades = async (e) => {
    e.preventDefault();
    resetMessages();
    if (!selectedTaskId) {
      showError('Selecciona una tarea', 'calificar');
      return;
    }
    const entries = Object.entries(gradeEdits);
    if (!entries.length) {
      showError('No hay alumnos para calificar', 'calificar');
      return;
    }
    try {
      for (const [studentId, edit] of entries) {
        const submissionId = edit.submissionId;
        if (!submissionId) {
          const created = await taskSubmissionService.createSubmission({
            taskId: selectedTaskId,
            studentId,
            content: '',
          });
          const newId = created?.data?._id;
          if (newId && (edit.status || edit.score !== undefined || edit.feedback)) {
            await taskSubmissionService.updateSubmission(newId, {
              status: edit.status,
              score: edit.score === '' ? undefined : edit.score,
              feedback: edit.feedback,
            });
          }
        } else {
          await taskSubmissionService.updateSubmission(submissionId, {
            status: edit.status,
            score: edit.score === '' ? undefined : edit.score,
            feedback: edit.feedback,
          });
        }
      }
      showSuccess('Calificaciones guardadas');
      await loadSubmissionsForTask(selectedTaskId);
    } catch (err) {
      showError(err, 'calificar tarea');
    }
  };

  if (loading) {
    return <p style={{ color: 'white' }}>Cargando datos del panel...</p>;
  }

  if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'DIRECTION' && currentUser.role !== 'TEACHER')) {
    return <p style={{ color: 'white' }}>Solo usuarios autorizados pueden usar este panel.</p>;
  }

  return (
    <div className="admin-panel">
      <div className="toolbar">
        <div>
          <p className="eyebrow">Panel administrador</p>
          <h2>Control escolar</h2>
        </div>
        <div className="toolbar-actions">
          <button className="secondary" onClick={loadCatalogs}>Refrescar</button>
          <span className="muted">Alumnos: {students.length} | Grupos: {groups.length} | Materias: {subjects.length}</span>
        </div>
      </div>

      {(errors || success) && (
        <div className={`banner ${errors ? 'error' : 'success'}`}>
          {errors || success}
        </div>
      )}

      <div className="section-grid">
        {canManageStaff && (
          <section className="card">
            <div className="card-head">
              <h3>Usuarios</h3>
              <span className="chip">Admin</span>
            </div>
            <form className="form" onSubmit={handleCreateUser}>
              <label>Nombre completo</label>
              <input type="text" required {...bindUserFullName} />
              <label>Email</label>
              <input type="email" required {...bindUserEmail} />
              <label>Password</label>
              <input type="password" required {...bindUserPassword} />
              <label>Rol</label>
              <select {...bindUserRole}>
                <option value="TEACHER">Docente</option>
                <option value="ADMIN">Admin</option>
                <option value="DIRECTION">Direccion</option>
              </select>
              <button type="submit">Crear usuario</button>
            </form>

            <div className="divider" />
            <form className="form" onSubmit={handleUpdateUser}>
              <label>Editar usuario</label>
              <select value={editUserId} onChange={(e) => setEditUserId(e.target.value)}>
                <option value="">Selecciona usuario</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>{u.fullName} ({u.role})</option>
                ))}
              </select>
              <label>Nombre</label>
              <input type="text" value={editUserName} onChange={(e) => setEditUserName(e.target.value)} />
              <label>Correo</label>
              <input type="email" value={editUserEmail} onChange={(e) => setEditUserEmail(e.target.value)} />
              <label>Nuevo rol</label>
              <select value={editUserRole} onChange={(e) => setEditUserRole(e.target.value)}>
                <option value="TEACHER">Docente</option>
                <option value="ADMIN">Admin</option>
                <option value="DIRECTION">Direccion</option>
              </select>
              <label>Reset password (opcional)</label>
              <input type="password" value={editUserPassword} onChange={(e) => setEditUserPassword(e.target.value)} />
              <button type="submit">Actualizar usuario</button>
            </form>
          </section>
        )}

        <section className="card">
          <div className="card-head">
            <h3>Alumno nuevo</h3>
            <span className="chip">Codigo opcional</span>
          </div>
          <form className="form" onSubmit={handleCreateStudent}>
            <label>Nombre</label>
            <input type="text" required {...bindStudentFirstName} />
            <label>Apellidos</label>
            <input type="text" required {...bindStudentLastName} />
            <label>Codigo (opcional)</label>
            <input type="text" placeholder="Dejar vacio para autogenerar" {...bindStudentCode} />
            <button type="submit">Crear alumno</button>
          </form>
        </section>

        <section className="card">
          <div className="card-head">
            <h3>Editar alumno</h3>
            <span className="chip">Rapido</span>
          </div>
          <form className="form" onSubmit={handleUpdateStudent}>
            <label>Alumno</label>
            <select value={selectedStudentEdit} onChange={(e) => setSelectedStudentEdit(e.target.value)}>
              <option value="">Selecciona alumno</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>{`${s.firstName} ${s.lastName}`}</option>
              ))}
            </select>
            <label>Nombre</label>
            <input type="text" value={editStudentFirst} onChange={(e) => setEditStudentFirst(e.target.value)} />
            <label>Apellidos</label>
            <input type="text" value={editStudentLast} onChange={(e) => setEditStudentLast(e.target.value)} />
            <label>Codigo (opcional)</label>
            <input
              type="text"
              value={editStudentCode}
              onChange={(e) => setEditStudentCode(e.target.value)}
              placeholder="Dejar vacio para mantener/generar"
            />
            <label>Estado</label>
            <select value={editStudentStatus} onChange={(e) => setEditStudentStatus(e.target.value)}>
              {studentStatuses.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
            <button type="submit">Guardar cambios</button>
          </form>
        </section>

        <section className="card">
          <div className="card-head">
            <h3>Grupo</h3>
            <span className="chip">Estructura</span>
          </div>
          <form className="form" onSubmit={handleCreateGroup}>
            <label>Nombre</label>
            <input type="text" required {...bindGroupName} />
            <label>Grado (1-6)</label>
            <input type="number" min="1" max="6" required {...bindGroupGrade} />
            <label>Seccion</label>
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

        {canManageStaff && (
          <section className="card">
            <div className="card-head">
              <h3>Asignar tutor</h3>
              <span className="chip">Grupos</span>
            </div>
            <form className="form" onSubmit={handleAssignTutor}>
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
              <button type="submit">Asignar</button>
            </form>
          </section>
        )}

        <section className="card">
          <div className="card-head">
            <h3>Materia</h3>
            <span className="chip">Docente y grado</span>
          </div>
          <form className="form" onSubmit={handleCreateSubject}>
            <label>Nombre</label>
            <input type="text" required {...bindSubjectName} />
            <label>Codigo</label>
            <input type="text" required {...bindSubjectCode} />
            <label>Grado (opcional)</label>
            <input type="number" min="1" max="6" {...bindSubjectGrade} />
            <label>Docente (opcional)</label>
            <select {...bindSubjectTeacher}>
              <option value="">Sin docente</option>
              {teacherUsers.map((t) => (
                <option key={t._id} value={t._id}>{t.fullName}</option>
              ))}
            </select>
            <button type="submit">Crear materia</button>
          </form>
        </section>

        <section className="card">
          <div className="card-head">
            <h3>Inscripcion</h3>
            <span className="chip">Alumno a grupo</span>
          </div>
          <form className="form" onSubmit={handleCreateEnrollment}>
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
              {selectableGroups.map((g) => (
                <option key={g._id} value={g._id}>{g.name}</option>
              ))}
            </select>
            <button type="submit">Inscribir</button>
          </form>
        </section>

        <section className="card">
          <div className="card-head">
            <h3>Tarea</h3>
            <span className="chip">Alta rapida</span>
          </div>
          <form className="form" onSubmit={handleCreateTask}>
            <label>Titulo</label>
            <input type="text" required {...bindTaskTitle} />
            <label>Descripcion</label>
            <textarea rows={2} {...bindTaskDesc} />
            <label>Grupo</label>
            <select {...bindTaskGroup} required>
              <option value="">Selecciona grupo</option>
              {selectableGroups.map((g) => (
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

        <section className="card">
          <div className="card-head">
            <h3>Editar tarea</h3>
            <span className="chip">Ajustes</span>
          </div>
          <form className="form" onSubmit={handleUpdateTask}>
            <label>Tarea</label>
            <select value={selectedTaskId} onChange={(e) => handleSelectTask(e.target.value)}>
              <option value="">Filtra y elige una tarea</option>
              {filteredTasks.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.title} ({t.group?.name || t.group})
                </option>
              ))}
            </select>
            <label>Titulo</label>
            <input type="text" value={editTaskTitle} onChange={(e) => setEditTaskTitle(e.target.value)} />
            <label>Estatus</label>
            <select value={editTaskStatus} onChange={(e) => setEditTaskStatus(e.target.value)}>
              {taskStatuses.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
            <label>Fecha entrega</label>
            <input type="date" value={editTaskDueDate} onChange={(e) => setEditTaskDueDate(e.target.value)} />
            <button type="submit">Actualizar tarea</button>
          </form>
        </section>

        <section className="card wide">
          <div className="card-head">
            <h3>Asistencia</h3>
            <span className="chip">Diario</span>
          </div>
          <form onSubmit={handleSubmitAttendance}>
            <div className="attendance-header">
              <div className="inline-field">
                <label>Grupo</label>
                <select {...bindAttendanceGroup} required>
                  <option value="">Selecciona grupo</option>
                  {selectableGroups.map((g) => (
                    <option key={g._id} value={g._id}>{g.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit">Guardar asistencia</button>
            </div>

            {attendanceEnrollments.length === 0 ? (
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
                  {attendanceEnrollments.map((en) => {
                    const student = en.student;
                    const studentId = student?._id || en.student;
                    const studentName = student?.firstName ? `${student.firstName} ${student.lastName}` : studentId;
                    return (
                      <tr key={studentId}>
                        <td>{studentName}</td>
                        <td>
                          <select
                            value={attendanceRecords[studentId] || 'PRESENT'}
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
          <div className="card-head">
            <h3>Calificar tareas</h3>
            <span className="chip">Filtros</span>
          </div>

          <div className="inline-filters">
            <div>
              <label>Grupo</label>
              <select value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)}>
                <option value="">Todos</option>
                {selectableGroups.map((g) => (
                  <option key={g._id} value={g._id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Materia</label>
              <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
                <option value="">Todas</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Tarea</label>
              <select value={selectedTaskId} onChange={(e) => handleSelectTask(e.target.value)}>
                <option value="">Selecciona</option>
                {filteredTasks.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.title} ({t.group?.name || t.group})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedTaskId && (
            <form onSubmit={persistGrades}>
              {gradeEnrollments.length === 0 ? (
                <p className="muted">No hay alumnos inscritos para esta tarea.</p>
              ) : (
                <table className="tabla">
                  <thead>
                    <tr>
                      <th>Alumno</th>
                      <th>Estatus</th>
                      <th>Puntuacion</th>
                      <th>Retroalimentacion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gradeEnrollments.map((en) => {
                      const student = en.student;
                      const studentId = student?._id || en.student;
                      const studentName = student?.firstName ? `${student.firstName} ${student.lastName}` : studentId;
                      const edit = gradeEdits[studentId] || {};
                      return (
                        <tr key={studentId}>
                          <td>{studentName}</td>
                          <td>
                            <select
                              value={edit.status || 'MISSING'}
                              onChange={(e) => handleGradeEdit(studentId, 'status', e.target.value)}
                            >
                              {submissionStatuses.map((st) => (
                                <option key={st} value={st}>{st}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={edit.score === undefined ? '' : edit.score}
                              onChange={(e) => handleGradeEdit(studentId, 'score', e.target.value === '' ? '' : Number(e.target.value))}
                              placeholder="0-100"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={edit.feedback || ''}
                              onChange={(e) => handleGradeEdit(studentId, 'feedback', e.target.value)}
                              placeholder="Comentarios"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
              <div className="actions">
                <button type="submit">Guardar calificaciones</button>
              </div>
            </form>
          )}
        </section>

        <section className="card wide">
          <div className="list-header">
            <div>
              <h3>Alumnos registrados ({students.length})</h3>
              <p className="muted">La lista completa se muestra solo cuando se solicita.</p>
            </div>
            <button className="secondary" onClick={() => setShowStudentsList((s) => !s)}>
              {showStudentsList ? 'Ocultar' : 'Ver lista'}
            </button>
          </div>
          {showStudentsList && (
            <div className="list-container">
              {students.length === 0 ? (
                <p className="muted">Sin alumnos aun</p>
              ) : (
                <ul className="simple-list">
                  {students.map((s) => (
                    <li key={s._id}>
                      <div className="list-title">{s.firstName} {s.lastName}</div>
                      <div className="list-sub">Codigo: {s.studentCode || 'Pendiente'} | Estado: {s.status || 'N/D'}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>

        <section className="card wide">
          <div className="list-header">
            <div>
              <h3>Grupos registrados ({groups.length})</h3>
              <p className="muted">Incluye grado, seccion y tutor si existe.</p>
            </div>
            <button className="secondary" onClick={() => setShowGroupsList((s) => !s)}>
              {showGroupsList ? 'Ocultar' : 'Ver lista'}
            </button>
          </div>
          {showGroupsList && (
            <div className="list-container">
              {groups.length === 0 ? (
                <p className="muted">Sin grupos aun</p>
              ) : (
                <ul className="simple-list">
                  {groups.map((g) => (
                    <li key={g._id}>
                      <div className="list-title">{g.name}</div>
                      <div className="list-sub">
                        Grado {g.gradeLevel || '-'} {g.section || ''} | Tutor: {g.tutor?.fullName || g.tutor || 'Sin asignar'}
                      </div>
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
