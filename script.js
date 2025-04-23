import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteField,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBR7AMsGD3P0lUfjvRHCHjMG3XmK12K4IU",
  authDomain: "miyakozuka-89982.firebaseapp.com",
  projectId: "miyakozuka-89982",
  storageBucket: "miyakozuka-89982.appspot.com",
  messagingSenderId: "80890323227",
  appId: "1:80890323227:web:f5d79ddbddbe480f8a33be",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentDate = new Date();
let selectedDate = null;
let calendarDataCache = {};

const nameInput = document.getElementById("nameInput");
const amBtn = document.getElementById("amBtn");
const pmBtn = document.getElementById("pmBtn");
const amDeleteBtn = document.getElementById("amDeleteBtn");
const pmDeleteBtn = document.getElementById("pmDeleteBtn");

function getDateKey(date) {
  return date.toISOString().split("T")[0];
}

function renderCalendar(date) {
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  document.getElementById("currentMonth").textContent = `${year}年${month + 1}月`;

  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const header = document.createElement("div");
  header.className = "calendar-row header";
  weekdays.forEach((day, i) => {
    const cell = document.createElement("div");
    cell.className = `calendar-cell weekday ${i === 0 ? "sunday" : i === 6 ? "saturday" : ""}`;
    cell.textContent = day;
    header.appendChild(cell);
  });
  calendar.appendChild(header);

  let row = document.createElement("div");
  row.className = "calendar-row";

  for (let i = 0; i < startDay; i++) {
    const cell = document.createElement("div");
    cell.className = "calendar-cell empty";
    row.appendChild(cell);
  }

  for (let day = 1; day <= lastDate; day++) {
    if (row.children.length === 7) {
      calendar.appendChild(row);
      row = document.createElement("div");
      row.className = "calendar-row";
    }

    const cellDate = new Date(year, month, day);
    const cellKey = getDateKey(cellDate);
    const cell = document.createElement("div");
    cell.className = "calendar-cell";
    cell.dataset.date = cellKey;

    const weekday = cellDate.getDay();
    if (weekday === 0) cell.classList.add("sunday");
    if (weekday === 6) cell.classList.add("saturday");

    if (selectedDate === cellKey) cell.classList.add("selected");

    const dayEl = document.createElement("div");
    dayEl.textContent = day;
    dayEl.className = "day-number";
    cell.appendChild(dayEl);

    const am = document.createElement("div");
    const pm = document.createElement("div");

    if (calendarDataCache[cellKey]) {
      const data = calendarDataCache[cellKey];
      am.textContent = data.time1 ?? data.am ?? "";
      pm.textContent = data.time2 ?? data.pm ?? "";
    }

    am.className = "am-label";
    pm.className = "pm-label";
    cell.appendChild(am);
    cell.appendChild(pm);

    cell.addEventListener("click", () => {
      selectedDate = cellKey;
      document.querySelectorAll(".calendar-cell.selected").forEach(c => c.classList.remove("selected"));
      cell.classList.add("selected");
    });

    row.appendChild(cell);
  }

  calendar.appendChild(row);
}

async function loadCalendarData(year, month) {
  calendarDataCache = {};

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dates = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(year, month, i + 1);
    return getDateKey(date);
  });

  await Promise.all(dates.map(async (dateStr) => {
    const docRef = doc(db, "water-records", dateStr);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      calendarDataCache[dateStr] = docSnap.data();
    }
  }));

  renderCalendar(new Date(year, month));
}

async function updateFirestore(dateStr, field, value) {
  const docRef = doc(db, "water-records", dateStr);
  await setDoc(docRef, { [field]: value }, { merge: true });
  calendarDataCache[dateStr] = {
    ...(calendarDataCache[dateStr] || {}),
    [field]: value,
  };
  renderCalendar(currentDate);
}

async function deleteFieldFromFirestore(dateStr, field) {
  const docRef = doc(db, "water-records", dateStr);
  await updateDoc(docRef, { [field]: deleteField() });
  if (calendarDataCache[dateStr]) delete calendarDataCache[dateStr][field];
  renderCalendar(currentDate);
}

amBtn.addEventListener("click", () => {
  if (!selectedDate) return alert("日付を選択してください");
  const name = nameInput.value.trim();
  if (!name) return alert("名前を入力してください");
  updateFirestore(selectedDate, "am", name);
});

pmBtn.addEventListener("click", () => {
  if (!selectedDate) return alert("日付を選択してください");
  const name = nameInput.value.trim();
  if (!name) return alert("名前を入力してください");
  updateFirestore(selectedDate, "pm", name);
});

amDeleteBtn.addEventListener("click", () => {
  if (!selectedDate) return alert("日付を選択してください");
  deleteFieldFromFirestore(selectedDate, "am");
});

pmDeleteBtn.addEventListener("click", () => {
  if (!selectedDate) return alert("日付を選択してください");
  deleteFieldFromFirestore(selectedDate, "pm");
});

document.getElementById("prevMonth").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  loadCalendarData(currentDate.getFullYear(), currentDate.getMonth());
});

document.getElementById("nextMonth").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  loadCalendarData(currentDate.getFullYear(), currentDate.getMonth());
});

document.getElementById("todayBtn").addEventListener("click", () => {
  currentDate = new Date();
  selectedDate = getDateKey(currentDate);
  loadCalendarData(currentDate.getFullYear(), currentDate.getMonth());
});

loadCalendarData(currentDate.getFullYear(), currentDate.getMonth());
