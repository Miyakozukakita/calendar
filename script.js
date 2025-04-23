const calendar = document.getElementById("calendar");
const waterBtn = document.getElementById("waterBtn");
const nameInput = document.getElementById("nameInput");

const today = new Date();
const year = today.getFullYear();
const month = today.getMonth();

let selectedDate = new Date(year, month, today.getDate());

function renderCalendar(targetDate) {
  calendar.innerHTML = "";
  const y = targetDate.getFullYear();
  const m = targetDate.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();

  for (let i = 1; i <= daysInMonth; i++) {
    const day = document.createElement("div");
    day.classList.add("day");
    day.textContent = i;

    const thisDate = new Date(y, m, i);
    if (
      thisDate.getDate() === selectedDate.getDate() &&
      thisDate.getMonth() === selectedDate.getMonth() &&
      thisDate.getFullYear() === selectedDate.getFullYear()
    ) {
      day.classList.add("selected");
    }

    day.addEventListener("click", () => {
      selectedDate = thisDate;
      renderCalendar(selectedDate); // 選択ハイライト更新
    });

    calendar.appendChild(day);
  }
}

waterBtn.addEventListener("click", () => {
  const days = document.querySelectorAll(".day");
  const name = nameInput.value.trim();

  if (name === "") {
    alert("名前を入力してください！");
    return;
  }

  days.forEach((dayEl) => {
    const dayNum = parseInt(dayEl.textContent);
    if (
      dayNum === selectedDate.getDate() &&
      !isNaN(dayNum)
    ) {
      dayEl.classList.add("watered");
      dayEl.innerHTML = `${dayNum}<br><small>${name}</small>`;
    }
  });

  alert(`${selectedDate.toLocaleDateString()} に ${name} さんの水やりを記録しました！`);
});

renderCalendar(selectedDate);
