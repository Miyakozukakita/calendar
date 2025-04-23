const calendar = document.getElementById("calendar");
const waterBtn = document.getElementById("waterBtn");
const datePicker = document.getElementById("date-picker");

// 今日の日付
const today = new Date();
const year = today.getFullYear();
const month = today.getMonth(); // 0-indexed
const date = today.getDate();

// 選択日（初期値は今日）
let selectedDate = new Date(year, month, date);

// date-picker に今日をセット
if (datePicker) {
  datePicker.valueAsDate = selectedDate;
}

// カレンダーを作成
function renderCalendar(targetDate) {
  calendar.innerHTML = "";
  const y = targetDate.getFullYear();
  const m = targetDate.getMonth();
  const d = targetDate.getDate();
  const daysInMonth = new Date(y, m + 1, 0).getDate();

  for (let i = 1; i <= daysInMonth; i++) {
    const day = document.createElement("div");
    day.classList.add("day");
    day.textContent = i;

    if (i === d) {
      day.id = "today";
    }

    calendar.appendChild(day);
  }
}

// 水やり完了
waterBtn.addEventListener("click", () => {
  const todayCell = document.getElementById("today");
  if (todayCell) {
    todayCell.classList.add("watered");
    alert(`${selectedDate.toLocaleDateString()} の水やりを記録しました！`);
  }
});

// 日付変更時の動作
datePicker.addEventListener("change", (e) => {
  selectedDate = new Date(e.target.value);
  renderCalendar(selectedDate);
});

// 初期表示
renderCalendar(selectedDate);
