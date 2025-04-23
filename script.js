const calendar = document.getElementById("calendar");
const waterBtn = document.getElementById("waterBtn");

const today = new Date();
const year = today.getFullYear();
const month = today.getMonth(); // 0-indexed
const date = today.getDate();

const daysInMonth = new Date(year, month + 1, 0).getDate();

// カレンダー作成
for (let i = 1; i <= daysInMonth; i++) {
  const day = document.createElement("div");
  day.classList.add("day");
  day.textContent = i;
  if (i === date) day.id = "today";
  calendar.appendChild(day);
}

// 水やり記録処理
waterBtn.addEventListener("click", () => {
  const todayCell = document.getElementById("today");
  if (todayCell) {
    todayCell.classList.add("watered");
    alert("水やり記録しました！");
  }
});
