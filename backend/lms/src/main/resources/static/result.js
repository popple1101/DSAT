const params = new URLSearchParams(window.location.search);
const assignmentId = params.get("assignmentId");
const toastEl = document.getElementById("toast");

document.getElementById("reload-result").addEventListener("click", loadResult);

async function loadResult() {
  if (!assignmentId) {
    renderEmpty("assignmentId가 없습니다.");
    return;
  }

  const token = localStorage.getItem("dsat-student-token") || "";

  try {
    const response = await fetch(`/api/student/results/${assignmentId}`, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "결과 조회 중 오류가 발생했습니다.");
    }
    renderResult(data);
  } catch (error) {
    renderEmpty(error.message);
    toast(error.message, true);
  }
}

function renderResult(result) {
  document.getElementById("result-status").textContent = `제출 완료 / ${result.routeType}`;
  document.getElementById("route-badge").textContent = result.routeType;
  document.getElementById("total-score").textContent = result.totalScore;
  document.getElementById("section-score").textContent = `Section Score ${result.sectionScore}`;
  document.getElementById("exam-name").textContent = `${result.examTitle} (${result.versionName})`;
  document.getElementById("module1-time").textContent = formatSeconds(result.module1DurationSeconds);
  document.getElementById("module2-time").textContent = formatSeconds(result.module2DurationSeconds);
  document.getElementById("module1-correct").textContent = `정답 수 ${result.module1CorrectCount}`;
  document.getElementById("module2-correct").textContent = `정답 수 ${result.module2CorrectCount}`;

  const table = `
    <table>
      <thead>
        <tr>
          <th>모듈</th>
          <th>트랙</th>
          <th>No.</th>
          <th>문제 제목</th>
          <th>정답</th>
          <th>학생답</th>
          <th>채점</th>
        </tr>
      </thead>
      <tbody>
        ${result.questionResults
          .map(
            (row) => `
              <tr class="${row.correct ? "correct" : "wrong"}">
                <td>${row.moduleType}</td>
                <td>${row.routeType}</td>
                <td>${row.questionOrder}</td>
                <td>${escapeHtml(row.title)}</td>
                <td>${row.correctAnswer ?? "-"}</td>
                <td>${row.selectedAnswer ?? "-"}</td>
                <td>${row.correct ? "정답" : "오답"}</td>
              </tr>
            `
          )
          .join("")}
      </tbody>
    </table>
  `;

  document.getElementById("result-table").className = "";
  document.getElementById("result-table").innerHTML = table;
}

function renderEmpty(message) {
  document.getElementById("result-table").className = "list empty";
  document.getElementById("result-table").textContent = message;
}

function formatSeconds(seconds) {
  const safe = Number(seconds || 0);
  const minutes = Math.floor(safe / 60);
  const remain = safe % 60;
  return `${minutes}분 ${remain}초`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toast(message, isError = false) {
  toastEl.hidden = false;
  toastEl.textContent = message;
  toastEl.style.background = isError ? "#b91c1c" : "#111827";
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    toastEl.hidden = true;
  }, 2600);
}

loadResult();
