const state = {
  token: "",
  role: "",
  questions: [],
  exams: [],
  students: [],
};

const els = {
  loginForm: document.getElementById("login-form"),
  loginStatus: document.getElementById("login-status"),
  questionForm: document.getElementById("question-form"),
  questionList: document.getElementById("question-list"),
  examForm: document.getElementById("exam-form"),
  questionLinkRows: document.getElementById("question-link-rows"),
  examList: document.getElementById("exam-list"),
  assignmentForm: document.getElementById("assignment-form"),
  assignmentExam: document.getElementById("assignment-exam"),
  assignmentStudent: document.getElementById("assignment-student"),
  studentList: document.getElementById("student-list"),
  toast: document.getElementById("toast"),
};

document.getElementById("load-questions").addEventListener("click", loadQuestions);
document.getElementById("load-exams").addEventListener("click", loadExams);
document.getElementById("load-students").addEventListener("click", loadStudents);
document.getElementById("add-link-row").addEventListener("click", () => addQuestionLinkRow());
document.getElementById("refresh-all").addEventListener("click", async () => {
  await Promise.all([loadQuestions(), loadExams(), loadStudents()]);
});

els.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(els.loginForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    const result = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    state.token = result.accessToken;
    state.role = result.role;
    localStorage.setItem("dsat-admin-token", state.token);
    localStorage.setItem("dsat-admin-role", state.role);
    updateLoginStatus(`${result.name} (${result.role})`);
    toast("로그인 완료");
  } catch (error) {
    toast(error.message, true);
  }
});

els.questionForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(els.questionForm).entries());

  try {
    await api("/api/admin/questions", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    els.questionForm.reset();
    toast("문제가 저장되었습니다.");
    await loadQuestions();
  } catch (error) {
    toast(error.message, true);
  }
});

els.examForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const base = Object.fromEntries(new FormData(els.examForm).entries());
  const questions = [...els.questionLinkRows.querySelectorAll(".builder-row")].map((row) => ({
    questionId: Number(row.querySelector("[name='questionId']").value),
    moduleType: row.querySelector("[name='moduleType']").value,
    routeType: row.querySelector("[name='routeType']").value,
    questionOrder: Number(row.querySelector("[name='questionOrder']").value),
  }));

  try {
    await api("/api/admin/exams", {
      method: "POST",
      body: JSON.stringify({ ...base, questions }),
    });
    els.examForm.reset();
    els.questionLinkRows.innerHTML = "";
    addQuestionLinkRow();
    toast("시험 세트가 생성되었습니다.");
    await loadExams();
  } catch (error) {
    toast(error.message, true);
  }
});

els.assignmentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const base = Object.fromEntries(new FormData(els.assignmentForm).entries());
  const payload = {
    examId: Number(base.examId),
    studentId: Number(base.studentId),
    dueAt: base.dueAt || null,
  };

  try {
    await api("/api/admin/exams/assignments", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    els.assignmentForm.reset();
    toast("학생에게 시험을 배정했습니다.");
  } catch (error) {
    toast(error.message, true);
  }
});

function updateLoginStatus(text) {
  els.loginStatus.textContent = text;
}

async function loadQuestions() {
  try {
    state.questions = await api("/api/admin/questions");
    renderQuestions();
    rebuildQuestionLinkRows();
  } catch (error) {
    toast(error.message, true);
  }
}

async function loadExams() {
  try {
    state.exams = await api("/api/admin/exams");
    renderExams();
    fillExamSelect();
  } catch (error) {
    toast(error.message, true);
  }
}

async function loadStudents() {
  try {
    state.students = await api("/api/admin/students");
    renderStudents();
    fillStudentSelect();
  } catch (error) {
    toast(error.message, true);
  }
}

function renderQuestions() {
  if (!state.questions.length) {
    els.questionList.className = "list empty";
    els.questionList.textContent = "등록된 문제가 없습니다.";
    return;
  }

  els.questionList.className = "list";
  els.questionList.innerHTML = state.questions
    .map(
      (question) => `
        <article class="item">
          <div class="item-title">#${question.id} ${escapeHtml(question.title)}</div>
          <div class="item-meta">정답: ${question.correctAnswer} | 이미지: ${question.assetImagePath || "없음"}</div>
        </article>
      `
    )
    .join("");
}

function renderExams() {
  if (!state.exams.length) {
    els.examList.className = "list empty";
    els.examList.textContent = "등록된 시험 세트가 없습니다.";
    return;
  }

  els.examList.className = "list";
  els.examList.innerHTML = state.exams
    .map(
      (exam) => `
        <article class="item">
          <div class="item-title">${escapeHtml(exam.title)} (${escapeHtml(exam.versionName)})</div>
          <div class="item-meta">문항 수: ${exam.questions.length} | 점수표: ${escapeHtml(exam.scoreTableId)}</div>
        </article>
      `
    )
    .join("");
}

function renderStudents() {
  if (!state.students.length) {
    els.studentList.className = "list empty";
    els.studentList.textContent = "학생 계정이 없습니다. 회원가입 후 다시 불러오세요.";
    return;
  }

  els.studentList.className = "list";
  els.studentList.innerHTML = state.students
    .map(
      (student) => `
        <article class="item">
          <div class="item-title">${escapeHtml(student.name)}</div>
          <div class="item-meta">ID: ${student.id} | 로그인 아이디: ${escapeHtml(student.loginId)}</div>
        </article>
      `
    )
    .join("");
}

function fillExamSelect() {
  els.assignmentExam.innerHTML = state.exams
    .map((exam) => `<option value="${exam.id}">${escapeHtml(exam.title)} (${escapeHtml(exam.versionName)})</option>`)
    .join("");
}

function fillStudentSelect() {
  els.assignmentStudent.innerHTML = state.students
    .map((student) => `<option value="${student.id}">${escapeHtml(student.name)} (#${student.id})</option>`)
    .join("");
}

function addQuestionLinkRow(prefill = {}) {
  const row = document.createElement("div");
  row.className = "builder-row";
  row.innerHTML = `
    <label>문제
      <select name="questionId" required>${questionOptions(prefill.questionId)}</select>
    </label>
    <label>모듈
      <select name="moduleType">
        <option value="MODULE_1" ${prefill.moduleType === "MODULE_1" ? "selected" : ""}>MODULE_1</option>
        <option value="MODULE_2" ${prefill.moduleType === "MODULE_2" ? "selected" : ""}>MODULE_2</option>
      </select>
    </label>
    <label>트랙
      <select name="routeType">
        <option value="COMMON" ${prefill.routeType === "COMMON" ? "selected" : ""}>COMMON</option>
        <option value="UPPER" ${prefill.routeType === "UPPER" ? "selected" : ""}>UPPER</option>
        <option value="LOWER" ${prefill.routeType === "LOWER" ? "selected" : ""}>LOWER</option>
      </select>
    </label>
    <label>순서
      <input name="questionOrder" type="number" min="1" value="${prefill.questionOrder || 1}" required>
    </label>
    <button type="button" class="danger">삭제</button>
  `;

  row.querySelector(".danger").addEventListener("click", () => row.remove());
  els.questionLinkRows.appendChild(row);
}

function rebuildQuestionLinkRows() {
  if (!els.questionLinkRows.children.length) {
    addQuestionLinkRow();
    return;
  }

  const rows = [...els.questionLinkRows.querySelectorAll(".builder-row")];
  const values = rows.map((row) => ({
    questionId: Number(row.querySelector("[name='questionId']").value),
    moduleType: row.querySelector("[name='moduleType']").value,
    routeType: row.querySelector("[name='routeType']").value,
    questionOrder: Number(row.querySelector("[name='questionOrder']").value),
  }));

  els.questionLinkRows.innerHTML = "";
  values.forEach((value) => addQuestionLinkRow(value));
}

function questionOptions(selectedId) {
  if (!state.questions.length) {
    return `<option value="">문제 먼저 불러오기</option>`;
  }

  return state.questions
    .map(
      (question) =>
        `<option value="${question.id}" ${question.id === selectedId ? "selected" : ""}>#${question.id} ${escapeHtml(question.title)}</option>`
    )
    .join("");
}

async function api(url, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "요청 처리 중 오류가 발생했습니다.");
  }
  return data;
}

function toast(message, isError = false) {
  els.toast.hidden = false;
  els.toast.textContent = message;
  els.toast.style.background = isError ? "#b91c1c" : "#0f172a";
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    els.toast.hidden = true;
  }, 2600);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function hydrateSession() {
  state.token = localStorage.getItem("dsat-admin-token") || "";
  state.role = localStorage.getItem("dsat-admin-role") || "";
  if (state.token && state.role) {
    updateLoginStatus(`저장된 세션 (${state.role})`);
  }
}

hydrateSession();
addQuestionLinkRow();
