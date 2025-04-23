import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, deleteField
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBR7AMsGD3P0lUfjvRHCHjMG3XmK12K4IU",
  authDomain: "miyakozuka-89982.firebaseapp.com",
  projectId: "miyakozuka-89982",
  storageBucket: "miyakozuka-89982.appspot.com",
  messagingSenderId: "80890323227",
  appId: "1:80890323227:web:f5d79ddbddbe480f8a33be"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const calendar = document.getElementById("calendar");
const currentMonthEl = document.getElementById("currentMonth");
const nameInput = document.getElementById("nameInput");
const amBtn = document.getElementById("amBtn");
const pmBtn = document.getElementById("pmBtn");
const amDeleteBtn = document.getElementById("amDeleteBtn");
const pmDeleteBtn = document.getElementById("pmDeleteBtn");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");
const todayBtn = document.getElementById("todayBtn");

let today = new Date();
let selectedDate = new Date(today);
let currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

const holidayAPI = "https://holidays-jp.github.io/api/v1/date.json";
let holidayMap = {};

async function fetchHolidays() {
  try {
    const res = await fetch(holidayAPI);
    const json = await res.json();
    holidayMap = json;
  } catch (e) {
    console.warn("祝日の取得に失敗しました", e);
  }
}

function formatDate(date) {
  const d = new Date(date);
  d.setHours(d.getHours() + 9); // UTC→JST
  return d.toISOString().split("T")[0];
}

function isSameDate(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

function renderCalendar() {
  calendar.innerHTML = "";
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  currentMonthEl.textContent = `${year}年${month + 1}月`;

  const firstDay = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0).getDate();
  const startDay = firstDay.getDay();

  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const headerRow = document.createElement("div");
  headerRow.className = "calendar-row header small";

  weekdays.forEach((day, idx) => {
    const cell = document.createElement("div");
    cell.className = "calendar-cell weekday";
    if (idx === 0) cell.classList.add("sunday");
    if (idx === 6) cell.classList.add("saturday");
    cell.textContent = day;
    headerRow.appendChild(cell);
  });
  calendar.appendChild(headerRow);

  let date = 1 - startDay;
  for (let i = 0; i < 6; i++) {
    const row = document.createElement("div");
    row.className = "calendar-row";

    for (let j = 0; j < 7; j++) {
      const cellDate = new Date(year, month, date);
      const cell = document.createElement("div");
      cell.className = "calendar-cell";
      const dateStr = formatDate(cellDate);

      if (cellDate.getMonth() === month) {
        const isToday = isSameDate(cellDate, today);
        const isSelected = isSameDate(cellDate, selectedDate);
        if (isToday) cell.classList.add("today");
        if (isSelected) cell.classList.add("selected");

        if (j === 0) cell.classList.add("sunday");
        if (j === 6) cell.classList.add("saturday");
        if (holidayMap[dateStr]) cell.classList.add("holiday");

        const dayNum = document.createElement("div");
        dayNum.className = "date-number";
        dayNum.textContent = cellDate.getDate();
        cell.appendChild(dayNum);

        const amDiv = document.createElement("div");
        amDiv.className = "record am";
        amDiv.id = `${dateStr}-am`;

        const pmDiv = document.createElement("div");
        pmDiv.className = "record pm";
        pmDiv.id = `${dateStr}-pm`;

        cell.appendChild(amDiv);
        cell.appendChild(pmDiv);

        cell.addEventListener("click", () => {
          selectedDate = new Date(cellDate);
          renderCalendar();
          renderDayData(selectedDate);
        });
      } else {
        cell.classList.add("disabled");
      }
      row.appendChild(cell);
      date++;
    }
    calendar.appendChild(row);
  }

  renderDayData(selectedDate);
}

async function renderDayData(dateObj) {
  const dateStr = formatDate(dateObj);
  const docRef = doc(db, "water-records", dateStr);
  const docSnap = await getDoc(docRef);

  const amDiv = document.getElementById(`${dateStr}-am`);
  const pmDiv = document.getElementById(`${dateStr}-pm`);

  if (!amDiv || !pmDiv) return;

  amDiv.textContent = "";
  pmDiv.textContent = "";

  if (docSnap.exists()) {
    const data = docSnap.data();
    if (data.time1) {
      amDiv.textContent = data.time1;
    } else if (data.am) {
      amDiv.textContent = `AM:${data.am}`;
    }

    if (data.time2) {
      pmDiv.textContent = data.time2;
    } else if (data.pm) {
      pmDiv.textContent = `PM:${data.pm}`;
    }
  }
}

async function updateRecord(type) {
  const name = nameInput.value.trim();
  if (!name) return alert("名前を入力してください");

  const dateStr = formatDate(selectedDate);
  const docRef = doc(db, "water-records", dateStr);
  await setDoc(docRef, { [type]: name }, { merge: true });
  renderDayData(selectedDate);
}

async function deleteRecord(type) {
  const dateStr = formatDate(selectedDate);
  const docRef = doc(db, "water-records", dateStr);
  await updateDoc(docRef, { [type]: deleteField() });
  renderDayData(selectedDate);
}

amBtn.addEventListener("click", () => updateRecord("am"));
pmBtn.addEventListener("click", () => updateRecord("pm"));
amDeleteBtn.addEventListener("click", () => deleteRecord("am"));
pmDeleteBtn.addEventListener("click", () => deleteRecord("pm"));

prevMonthBtn.addEventListener("click", () => {
  currentMonth.setMonth(currentMonth.getMonth() - 1);
  renderCalendar();
});
nextMonthBtn.addEventListener("click", () => {
  currentMonth.setMonth(currentMonth.getMonth() + 1);
  renderCalendar();
});
todayBtn.addEventListener("click", () => {
  selectedDate = new Date();
  currentMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  renderCalendar();
});

window.addEventListener("DOMContentLoaded", async () => {
  await fetchHolidays();
  renderCalendar();
});
