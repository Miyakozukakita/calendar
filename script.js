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
    const cell =
