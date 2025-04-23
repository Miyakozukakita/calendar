// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteField
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

let currentDate = new Date();
let selectedDate = new Date();
let calendarData = {}; // キャッシュ

const calendar = document.getElementById("calendar");
const currentMonth = document.getElementById("currentMonth");
const nameInput = document.getElementById("nameInput");

function getDateKey(date) {
  const d = new Date(date);
  d.setHours(d.getHours() + 9);
  return d.toISOString().split("T")[0];
}

function updateHeader(date) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  currentMonth.textContent = `${y}年${m}月`;
}

function isSameDate(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

async function fetchMonthData(date) {
  calendarData = {}; // クリア
  const year = date.getFullYear();
  const month = date.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);

  for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
    const key = getDateKey(d);
    const docRef = doc(db, "water-records", key);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      calendarData[key] = docSnap.data();
    }
  }
}

function renderCalendar(date) {
  calendar.innerHTML = "";
  updateHeader(date);

  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const weekDays = ["日", "月", "火", "水", "木", "金", "土"];
  weekDays.forEach((day, i) => {
    const cell = document.createElement("div");
    cell.className = "day header";
    cell.textContent = day;
    if (i === 0) cell.style.color = "red";
    if (i === 6) cell.style.color = "blue";
    calendar.appendChild(cell);
  });

  for (let i = 0; i < startDay; i++) {
    const empty = document.createElement("div");
    empty.className = "day";
    calendar.appendChild(empty);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const cell = document.createElement("div");
    cell.className = "day";
    const thisDate = new Date(year, month, i);
    cell.dataset.date = thisDate;

    if (isSameDate(thisDate, new Date())) cell.classList.add("today");
    if (isSameDate(thisDate, selectedDate)) cell.classList.add("selected");

    const key = getDateKey(thisDate);
    const info = calendarData[key];

    const dateSpan = document.createElement("div");
    dateSpan.textContent = i;
    cell.appendChild(dateSpan);

    if (info) {
      if (info.nameAM) {
        const am = document.createElement("div");
        am.textContent = `AM:${info.nameAM}`;
        am.className = "am";
        cell.appendChild(am);
      } else if (info.time1) {
        const am = document.createElement("div");
        am.textContent = info.time1;
        am.className = "am";
        cell.appendChild(am);
      }

      if (info.namePM) {
        const pm = document.createElement("div");
        pm.textContent = `PM:${info.namePM}`;
        pm.className = "pm";
        cell.appendChild(pm);
      } else if (info.time2) {
        const pm = document.createElement("div");
        pm.textContent = info.time2;
        pm.className = "pm";
        cell.appendChild(pm);
      }
    }

    cell.addEventListener("click", () => {
      selectedDate = thisDate;
      document.querySelectorAll(".day").forEach(d => d.classList.remove("selected"));
      cell.classList.add("selected");
    });

    calendar.appendChild(cell);
  }
}

async function handleRegister(timeType) {
  const name = nameInput.value.trim();
  if (!name) return;
  const key = getDateKey(selectedDate);
  const docRef = doc(db, "water-records", key);
  await setDoc(docRef, {
    [timeType === "am" ? "nameAM" : "namePM"]: name
  }, { merge: true });
  await fetchMonthData(currentDate);
  renderCalendar(currentDate);
  nameInput.value = "";
}

async function handleDelete(timeType) {
  const key = getDateKey(selectedDate);
  const docRef = doc(db, "water-records", key);
  await updateDoc(docRef, {
    [timeType === "am" ? "nameAM" : "namePM"]: deleteField()
  });
  await fetchMonthData(currentDate);
  renderCalendar(currentDate);
}

// イベント登録
renderCalendar(currentDate);
fetchMonthData(currentDate).then(() => renderCalendar(currentDate));

document.getElementById("amBtn").addEventListener("click", () => handleRegister("am"));
document.getElementById("pmBtn").addEventListener("click", () => handleRegister("pm"));
document.getElementById("amDeleteBtn").addEventListener("click", () => handleDelete("am"));
document.getElementById("pmDeleteBtn").addEventListener("click", () => handleDelete("pm"));
document.getElementById("prevMonth").addEventListener("click", async () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  await fetchMonthData(currentDate);
  renderCalendar(currentDate);
});
document.getElementById("nextMonth").addEventListener("click", async () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  await fetchMonthData(currentDate);
  renderCalendar(currentDate);
});
document.getElementById("todayBtn").addEventListener("click", async () => {
  currentDate = new Date();
  selectedDate = new Date();
  await fetchMonthData(currentDate);
  renderCalendar(currentDate);
});
