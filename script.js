import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getFirestore, doc, getDoc, getDocs, setDoc, updateDoc, deleteField, collection
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
let selectedDateStr = getDateStr(currentDate);
let cachedRecords = {}; // 🔹 すべての記録をキャッシュ

function getDateStr(date) {
  const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return d.toISOString().split('T')[0];
}

async function fetchAllRecords() {
  const colRef = collection(db, "water-records");
  const snapshot = await getDocs(colRef);
  snapshot.forEach(docSnap => {
    cachedRecords[docSnap.id] = docSnap.data();
  });
}

function renderCalendar(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0).getDate();

  document.getElementById("currentMonth").textContent = `${year}年${month + 1}月`;
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  const weekDays = ["日", "月", "火", "水", "木", "金", "土"];
  weekDays.forEach(day => {
    const cell = document.createElement("div");
    cell.textContent = day;
    cell.style.fontWeight = "bold";
    calendar.appendChild(cell);
  });

  for (let i = 0; i < firstDay.getDay(); i++) {
    calendar.appendChild(document.createElement("div"));
  }

  for (let dateNum = 1; dateNum <= lastDate; dateNum++) {
    const cellDate = new Date(year, month, dateNum);
    const dateStr = getDateStr(cellDate);
    const cell = document.createElement("div");
    cell.className = "calendar-cell";
    const day = cellDate.getDay();

    if (day === 0) cell.classList.add("sunday");
    else if (day === 6) cell.classList.add("saturday");
    if (dateStr === getDateStr(new Date())) cell.classList.add("today");

    cell.innerHTML = `<div>${dateNum}</div>`;
    cell.dataset.date = dateStr;
    cell.addEventListener("click", () => {
      selectedDateStr = dateStr;
      renderCalendar(currentDate); // 🔁 再描画して強調
    });

    const data = cachedRecords[dateStr];
    if (data) {
      if (data.am) {
        const am = document.createElement("span");
        am.className = "am-label";
        am.textContent = `AM: ${data.am}`;
        cell.appendChild(am);
      }
      if (data.pm) {
        const pm = document.createElement("span");
        pm.className = "pm-label";
        pm.textContent = `PM: ${data.pm}`;
        cell.appendChild(pm);
      }
    }

    calendar.appendChild(cell);
  }
}

async function updateName(time) {
  const name = document.getElementById("nameInput").value.trim();
  if (!name) return alert("名前を入力してください");

  const docRef = doc(db, "water-records", selectedDateStr);
  await setDoc(docRef, { [time]: name }, { merge: true });

  // 🔄 キャッシュ更新
  cachedRecords[selectedDateStr] = {
    ...(cachedRecords[selectedDateStr] || {}),
    [time]: name
  };
  renderCalendar(currentDate);
}

async function deleteName(time) {
  const docRef = doc(db, "water-records", selectedDateStr);
  await updateDoc(docRef, { [time]: deleteField() });

  // 🔄 キャッシュ更新
  if (cachedRecords[selectedDateStr]) {
    delete cachedRecords[selectedDateStr][time];
  }
  renderCalendar(currentDate);
}

document.getElementById("amBtn").addEventListener("click", () => updateName("am"));
document.getElementById("pmBtn").addEventListener("click", () => updateName("pm"));
document.getElementById("amDeleteBtn").addEventListener("click", () => deleteName("am"));
document.getElementById("pmDeleteBtn").addEventListener("click", () => deleteName("pm"));
document.getElementById("prevMonth").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar(currentDate);
});
document.getElementById("nextMonth").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar(currentDate);
});
document.getElementById("todayBtn").addEventListener("click", () => {
  currentDate = new Date();
  selectedDateStr = getDateStr(currentDate);
  renderCalendar(currentDate);
});

(async () => {
  await fetchAllRecords();
  renderCalendar(currentDate);
})();
