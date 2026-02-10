// Danh sách ký tự hoa/lá/trái tim
const flowerChars = ["🌸", "🌼", "🍂", "🍁", "💮", "🌹", "💖"];

function createFlower() {
  const flower = document.createElement("div");
  flower.classList.add("flower");

  // chọn ngẫu nhiên ký tự
  flower.innerText =
    flowerChars[Math.floor(Math.random() * flowerChars.length)];

  // vị trí ngẫu nhiên theo chiều ngang
  flower.style.left = Math.random() * window.innerWidth + "px";

  // kích thước ngẫu nhiên
  const size = 20 + Math.random() * 30; // 20px - 50px
  flower.style.fontSize = size + "px";

  // thời gian rơi ngẫu nhiên
  const duration = 4 + Math.random() * 6; // 4s - 10s
  flower.style.animationDuration = duration + "s";

  document.body.appendChild(flower);

  // xóa hoa sau khi rơi xong
  setTimeout(() => {
    flower.remove();
  }, duration * 1000);
}

// Tạo hoa liên tục
setInterval(createFlower, 500);
