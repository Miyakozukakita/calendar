// script.js
let currentDate = new Date();
let selectedDate = new Date();
let holidays = {};

const calendar = document.getElementById("calendar");
const currentMonth = document.getElementById("currentMonth");
const prevBtn = document.getElementById("prevMonth");
const nextBtn = document.getElementById("nextMonth");
const todayBtn = document.getElementById("todayBtn");
const nameInput = document.getElementById("nameInput");
const amBtn = document.getElementById("amBtn");
const pmBtn = document.getElementById("pmBtn");
const amDeleteBtn = document.getElementById("amDeleteBtn");
const pmDeleteBtn = document.getElementById("pmDeleteBtn");

function getDateKey(date) {
  return date.toISOString().split("T")[0];
}

const waterData = {};

async function fetchHolidays(year) {
  try {
    const res = await fetch(`https://holidays-jp.github.io/api/v1/${year}/date.json`);
    if (!res.ok) throw new Error("祝日データ取得失敗");
    holidays = await res.json();
    renderCalendar(currentDate);
  } catch (err) {
    console.error("祝日取得エラー:", err);
  }
}

function renderCalendar(baseDate) {
  calendar.innerHTML = "";
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  currentMonth.textContent = `${year}年${month + 1}月`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  for (let i = 0; i < 7; i++) {
    const weekday = document.createElement("div");
    weekday.textContent = weekdays[i];
    weekday.className = "weekday";
    if (i === 0) weekday.classList.add("sunday");
    if (i === 6) weekday.classList.add("saturday");
    calendar.appendChild(weekday);
  }

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.className = "day empty";
    calendar.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateKey = getDateKey(date);

    const cell = document.createElement("div");
    cell.className = "day";
    if (date.toDateString() === new Date().toDateString()) {
      cell.classList.add("today");
    }
    if (holidays[dateKey]) {
      cell.classList.add("holiday");
      cell.title = holidays[dateKey];
    } else if (date.getDay() === 0) {
      cell.classList.add("sunday");
    } else if (date.getDay() === 6) {
      cell.classList.add("saturday");
    }

    cell.textContent = day;
    cell.dataset.date = dateKey;
    cell.addEventListener("click", () => {
      selectedDate = date;
      renderCalendar(currentDate);
    });

    const record = waterData[dateKey];
    if (record) {
      const am = document.createElement("div");
      am.className = "am";
      am.textContent = record.am ? `AM: ${record.am}` : "";
      const pm = document.createElement("div");
      pm.className = "pm";
      pm.textContent = record.pm ? `PM: ${record.pm}` : "";
      cell.appendChild(am);
      cell.appendChild(pm);
    }

    calendar.appendChild(cell);
  }
}

function register(name, time) {
  const key = getDateKey(selectedDate);
  if (!waterData[key]) waterData[key] = {};
  waterData[key][time] = name;
  renderCalendar(currentDate);
}

function removeRecord(time) {
  const key = getDateKey(selectedDate);
  if (waterData[key]) {
    delete waterData[key][time];
    if (!waterData[key].am && !waterData[key].pm) delete waterData[key];
  }
  renderCalendar(currentDate);
}

amBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  if (name) register(name, "am");
});

pmBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  if (name) register(name, "pm");
});

amDeleteBtn.addEventListener("click", () => removeRecord("am"));
pmDeleteBtn.addEventListener("click", () => removeRecord("pm"));

prevBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  fetchHolidays(currentDate.getFullYear());
});

nextBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  fetchHolidays(currentDate.getFullYear());
});

todayBtn.addEventListener("click", () => {
  currentDate = new Date();
  fetchHolidays(currentDate.getFullYear());
});

fetchHolidays(currentDate.getFullYear());
