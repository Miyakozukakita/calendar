const calendar = document.getElementById("calendar");
const nameInput = document.getElementById("nameInput");
const amBtn = document.getElementById("amBtn");
const pmBtn = document.getElementById("pmBtn");
const amDeleteBtn = document.getElementById("amDeleteBtn");
const pmDeleteBtn = document.getElementById("pmDeleteBtn");
const prevBtn = document.getElementById("prevMonth");
const nextBtn = document.getElementById("nextMonth");
const currentMonthLabel = document.getElementById("currentMonth");
const todayBtn = document.getElementById("todayBtn");

const today = new Date();
let selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
const wateringRecords = new Map();

// 固定祝日マップ（必要に応じて追加）
const holidays = {
  "1-1": "元日",
  "2-11": "建国記念日",
  "4-29": "昭和の日",
  "5-3": "憲法記念日",
  "5-4": "みどりの日",
  "5-5": "こどもの日",
  "11-3": "文化の日",
  "11-23": "勤労感謝の日",
};

function updateHeader(date) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  currentMonthLabel.textContent = `${y}年${m}月`;
}

function renderCalendar(targetDate) {
  calendar.innerHTML = "";
  const y = targetDate.getFullYear();
  const m = targetDate.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();

  for (let i = 1; i <= daysInMonth; i++) {
    const thisDate = new Date(y, m, i);
    const key = thisDate.toDateString();
    const record = wateringRecords.get(key);
    const holidayKey = `${m + 1}-${i}`;

    const day = document.createElement("div");
    day.classList.add("day");
    if (holidayKey in holidays) day.classList.add("holiday");

    let content = `${i}`;
    if (record) {
      if (record.am) content += `<br><span class="am">AM: ${record.am}</span>`;
      if (record.pm) content += `<br><span class="pm">PM: ${record.pm}</span>`;
    }

    if (
      thisDate.getDate() === selectedDate.getDate() &&
      thisDate.getMonth() === selectedDate.getMonth() &&
      thisDate.getFullYear() === selectedDate.getFullYear()
    ) {
      day.classList.add("selected");
    }

    day.innerHTML = content;
    day.addEventListener("click", () => {
      selectedDate = thisDate;
      renderCalendar(selectedDate);
    });

    calendar.appendChild(day);
  }

  updateHeader(targetDate);
}

function handleWatering(time) {
  const name = nameInput.value.trim();
  if (name === "") {
    alert("名前を入力してください！");
    return;
  }

  const key = selectedDate.toDateString();
  const record = wateringRecords.get(key) || {};
  record[time] = name;
  wateringRecords.set(key, record);
  renderCalendar(selectedDate);
}

function handleDelete(time) {
  const key = selectedDate.toDateString();
  const record = wateringRecords.get(key);
  if (record && record[time]) {
    delete record[time];
    if (!record.am && !record.pm) {
      wateringRecords.delete(key);
    } else {
      wateringRecords.set(key, record);
    }
    renderCalendar(selectedDate);
  }
}

// ボタンイベント
amBtn.addEventListener("click", () => handleWatering("am"));
pmBtn.addEventListener("click", () => handleWatering("pm"));
amDeleteBtn.addEventListener("click", () => handleDelete("am"));
pmDeleteBtn.addEventListener("click", () => handleDelete("pm"));

prevBtn.addEventListener("click", () => {
  selectedDate.setMonth(selectedDate.getMonth() - 1);
  renderCalendar(selectedDate);
});

nextBtn.addEventListener("click", () => {
  selectedDate.setMonth(selectedDate.getMonth() + 1);
  renderCalendar(selectedDate);
});

todayBtn.addEventListener("click", () => {
  selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  renderCalendar(selectedDate);
});

// 初期表示
renderCalendar(selectedDate);
