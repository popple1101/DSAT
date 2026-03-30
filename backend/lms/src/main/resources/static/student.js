const state = {
  token: "",
  user: null,
  assignments: [],
  currentAssignmentId: null,
  currentDetail: null,
};

const els = {
  loginForm: document.getElementById("student-login-form"),
  status: document.getElementById("student-status"),
  assignmentList: document.getElementById("assignment-list"),
  currentSummary: document.getElementById("current-summary"),
  questionPanel: document.getElementById("question-panel"),
  toast: document.getElementById("toast"),
  startModule1: document.getElementById("start-module-1"),
  startModule2: document.getElementById("start-module-2"),
  submitModule: document.getElementById("submit-module"),
};

document.getElementById("load-assignments").addEventListener("click", loadAssignments);

els.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(els.loginForm).entries());

  try {
    const result = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    state.token = result.accessToken;
    state.user = result;
    localStorage.setItem("dsat-student-token", state.token);
    localStorage.setItem("dsat-student-user", JSON.stringify(result));
    updateStatus(`${result.name} (${result.loginId})`);
    toast("학생 로그인 완료");
    await loadAssignments();
  } catch (error) {
    toast(error.message, true);
  }
});

els.startModule1.addEventListener("click", async () => {
  if (!state.currentAssignmentId) {
    toast("먼저 시험을 선택하세요.", true);
    return;
  }

  try {
    state.currentDetail = await api(`/api/student/exams/assignments/${state.currentAssignmentId}/start`, {
      method: "POST",
    });
    renderCurrentDetail();
    toast("Module 1을 시작했습니다.");
  } catch (error) {
    toast(error.message, true);
  }
});

els.startModule2.addEventListener("click", async () => {
  if (!state.currentAssignmentId) {
    toast("먼저 시험을 선택하세요.", true);
    return;
  }

  try {
    state.currentDetail = await api(`/api/student/exams/assignments/${state.currentAssignmentId}/module-2/start`, {
      method: "POST",
    });
    renderCurrentDetail();
    toast("Module 2를 시작했습니다.");
  } catch (error) {
    toast(error.message, true);
  }
});

els.submitModule.addEventListener("click", async () => {
  if (!state.currentAssignmentId || !state.currentDetail) {
    toast("제출할 시험이 없습니다.", true);
    return;
  }

  const payload = {
    durationSeconds: estimateDuration(state.currentDetail.currentModuleType),
  };

  try {
    const endpoint =
      state.currentDetail.currentModuleType === "MODULE_1"
        ? `/api/student/exams/assignments/${state.currentAssignmentId}/module-1/submit`
        : `/api/student/exams/assignments/${state.currentAssignmentId}/submit`;

    const result = await api(endpoint, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (state.currentDetail.currentModuleType === "MODULE_1") {
      toast(`Module 1 제출 완료. 분기: ${result.routeType}`);
      await loadAssignmentDetail(state.currentAssignmentId);
      return;
    }

    toast(`최종 제출 완료. 결과표로 이동합니다.`);
    await loadAssignments();
    window.location.href = `/result.html?assignmentId=${state.currentAssignmentId}`;
  } catch (error) {
    toast(error.message, true);
  }
});

async function loadAssignments() {
  if (!state.user?.id) {
    toast("먼저 로그인하세요.", true);
    return;
  }

  try {
    state.assignments = await api(`/api/student/exams?studentId=${state.user.id}`);
    renderAssignments();
  } catch (error) {
    toast(error.message, true);
  }
}

async function loadAssignmentDetail(assignmentId) {
  try {
    state.currentAssignmentId = assignmentId;
    state.currentDetail = await api(`/api/student/exams/assignments/${assignmentId}`);
    renderCurrentDetail();
  } catch (error) {
    toast(error.message, true);
  }
}

function renderAssignments() {
  if (!state.assignments.length) {
    els.assignmentList.className = "list empty";
    els.assignmentList.textContent = "배정된 시험이 없습니다.";
    return;
  }

  els.assignmentList.className = "list";
  els.assignmentList.innerHTML = state.assignments
    .map(
      (assignment) => `
        <article class="item">
          <div class="item-title">${escapeHtml(assignment.examTitle)} (${escapeHtml(assignment.versionName)})</div>
          <div class="item-meta">상태: ${assignment.submissionStatus} | 분기: ${assignment.routeType || "대기"}</div>
          <button type="button" data-assignment-id="${assignment.assignmentId}">시험 선택</button>
        </article>
      `
    )
    .join("");

  els.assignmentList.querySelectorAll("button[data-assignment-id]").forEach((button) => {
    button.addEventListener("click", () => loadAssignmentDetail(button.dataset.assignmentId));
  });
}

function renderCurrentDetail() {
  if (!state.currentDetail) {
    els.currentSummary.className = "list empty";
    els.currentSummary.textContent = "시험을 선택하면 현재 상태가 표시됩니다.";
    els.questionPanel.className = "list empty";
    els.questionPanel.textContent = "시험을 선택하면 문제를 볼 수 있습니다.";
    return;
  }

  els.currentSummary.className = "summary-grid";
  els.currentSummary.innerHTML = `
    <div class="summary-box">
      <strong>${escapeHtml(state.currentDetail.examTitle)} (${escapeHtml(state.currentDetail.versionName)})</strong>
      <div class="item-meta">상태: ${state.currentDetail.submissionStatus}</div>
    </div>
    <div class="summary-box">
      <strong>${state.currentDetail.currentModuleType} / ${state.currentDetail.currentRouteType}</strong>
      <div class="item-meta">M1 시간: ${state.currentDetail.module1DurationSeconds ?? 0}s | M2 시간: ${state.currentDetail.module2DurationSeconds ?? 0}s</div>
    </div>
  `;

  if (!state.currentDetail.questions.length) {
    els.questionPanel.className = "list empty";
    els.questionPanel.textContent = "현재 모듈 문제를 불러오지 못했습니다.";
    return;
  }

  els.questionPanel.className = "list";
  els.questionPanel.innerHTML = state.currentDetail.questions
    .map(
      (question) => `
        <article class="question-card">
          <div class="question-header">
            <div>
              <h3>${question.questionOrder}. ${escapeHtml(question.title)}</h3>
              <div class="item-meta">문항 ID: ${question.questionId}</div>
            </div>
            <span class="badge">${state.currentDetail.currentModuleType}</span>
          </div>
          <div class="question-body">
            ${question.passageText ? `<div>${nl2br(escapeHtml(question.passageText))}</div>` : ""}
            ${question.assetImagePath ? `<div class="asset-preview">자료 이미지 경로: ${escapeHtml(question.assetImagePath)}</div>` : ""}
            <div><strong>${escapeHtml(question.questionText)}</strong></div>
            <div class="choices">
              ${choiceButton(question, "A", question.choiceA)}
              ${choiceButton(question, "B", question.choiceB)}
              ${choiceButton(question, "C", question.choiceC)}
              ${choiceButton(question, "D", question.choiceD)}
            </div>
          </div>
        </article>
      `
    )
    .join("");

  els.questionPanel.querySelectorAll(".choice-button").forEach((button) => {
    button.addEventListener("click", async () => {
      const questionId = Number(button.dataset.questionId);
      const selectedAnswer = button.dataset.answer;
      await saveAnswer(questionId, selectedAnswer);
    });
  });
}

async function saveAnswer(questionId, selectedAnswer) {
  try {
    state.currentDetail = await api(`/api/student/exams/assignments/${state.currentAssignmentId}/answers`, {
      method: "POST",
      body: JSON.stringify({
        questionId,
        moduleType: state.currentDetail.currentModuleType,
        routeType: state.currentDetail.currentRouteType,
        selectedAnswer,
      }),
    });
    renderCurrentDetail();
    toast(`답안 ${selectedAnswer} 저장`);
  } catch (error) {
    toast(error.message, true);
  }
}

function choiceButton(question, answer, text) {
  const active = question.selectedAnswer === answer ? "active" : "";
  return `
    <button type="button" class="choice-button ${active}" data-question-id="${question.questionId}" data-answer="${answer}">
      <strong>${answer}</strong> ${escapeHtml(text)}
    </button>
  `;
}

function updateStatus(text) {
  els.status.textContent = text;
}

function estimateDuration(moduleType) {
  const startedAt = moduleType === "MODULE_1" ? 32 * 60 : 31 * 60;
  return startedAt;
}

function nl2br(text) {
  return text.replaceAll("\n", "<br>");
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
  els.toast.style.background = isError ? "#b91c1c" : "#111827";
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
  state.token = localStorage.getItem("dsat-student-token") || "";
  const savedUser = localStorage.getItem("dsat-student-user");
  state.user = savedUser ? JSON.parse(savedUser) : null;
  if (state.user) {
    updateStatus(`${state.user.name} (${state.user.loginId})`);
  }
}

hydrateSession();
