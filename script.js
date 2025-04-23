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

let selectedDate = new Date();
let monthlyDataCache = {};

const nameInput = document.getElementById("nameInput");
const calendar = document.getElementById("calendar");

function getDateStr(date) {
  return date.toISOString().split("T")[0];
}

function updateHeader(date) {
  const header = document.getElementById("currentMonth");
  header.textContent = `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

async function fetchMonthData(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  if (monthlyDataCache[`${year}-${month}`]) {
    return;
  }

  const promises = [];
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);

  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    const dateStr = getDateStr(d);
    const ref = doc(db, "water-records", dateStr);
    promises.push(getDoc(ref).then(docSnap => {
      monthlyDataCache[dateStr] = docSnap.exists() ? docSnap.data() : {};
    }));
  }

  await Promise.all(promises);
}

function renderCalendar(baseDate) {
  calendar.innerHTML = "";

  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  const weekDays = ["日", "月", "火", "水", "木", "金", "土"];
  weekDays.forEach((w, i) => {
    const el = document.createElement("div");
    el.className = "day";
    el.textContent = w;
    if (i === 0) el.classList.add("sunday");
    if (i === 6) el.classList.add("saturday");
    calendar.appendChild(el);
  });

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.className = "day";
    calendar.appendChild(empty);
  }

  for (let date = 1; date <= lastDate; date++) {
    const cellDate = new Date(year, month, date);
    const dateStr = getDateStr(cellDate);
    const data = monthlyDataCache[dateStr] || {};
    const cell = document.createElement("div");
    cell.className = "day";
    if (cellDate.getDay() === 0) cell.classList.add("sunday");
    if (cellDate.getDay() === 6) cell.classList.add("saturday");

    const dateLabel = document.createElement("div");
    dateLabel.className = "date";
    dateLabel.textContent = date;
    cell.appendChild(dateLabel);

    if (data.time1) {
      const amDiv = document.createElement("div");
      amDiv.className = "am";
      amDiv.textContent = `AM:${data.time1}`;
      cell.appendChild(amDiv);
    }

    if (data.time2) {
      const pmDiv = document.createElement("div");
      pmDiv.className = "pm";
      pmDiv.textContent = `PM:${data.time2}`;
      cell.appendChild(pmDiv);
    }

    calendar.appendChild(cell);
  }

  updateHeader(baseDate);
}

function moveMonth(offset) {
  selectedDate.setMonth(selectedDate.getMonth() + offset);
  fetchMonthData(selectedDate).then(() => renderCalendar(selectedDate));
}

function goToToday() {
  selectedDate = new Date();
  fetchMonthData(selectedDate).then(() => renderCalendar(selectedDate));
}

async function updateFirestore(field, value) {
  const dateStr = getDateStr(selectedDate);
  const ref = doc(db, "water-records", dateStr);
  await setDoc(ref, { [field]: value }, { merge: true });
  monthlyDataCache[dateStr] = { ...(monthlyDataCache[dateStr] || {}), [field]: value };
  renderCalendar(selectedDate);
}

async function deleteFromFirestore(field) {
  const dateStr = getDateStr(selectedDate);
  const ref = doc(db, "water-records", dateStr);
  await updateDoc(ref, { [field]: deleteField() });
  delete monthlyDataCache[dateStr]?.[field];
  renderCalendar(selectedDate);
}

document.getElementById("prevMonth").onclick = () => moveMonth(-1);
document.getElementById("nextMonth").onclick = () => moveMonth(1);
document.getElementById("todayBtn").onclick = () => goToToday();

document.getElementById("amBtn").onclick = () => {
  const name = nameInput.value.trim();
  if (name) updateFirestore("am", name);
};
document.getElementById("pmBtn").onclick = () => {
  const name = nameInput.value.trim();
  if (name) updateFirestore("pm", name);
};
document.getElementById("amDeleteBtn").onclick = () => deleteFromFirestore("am");
document.getElementById("pmDeleteBtn").onclick = () => deleteFromFirestore("pm");

fetchMonthData(selectedDate).then(() => renderCalendar(selectedDate));
