(function () {
  var burger = document.querySelector(".burger");
  var nav = document.querySelector(".nav");

  function closeNav() {
    nav.classList.remove("is-open");
    burger.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-lock");
  }

  burger.addEventListener("click", function () {
    var open = !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", open);
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("nav-lock", open);
  });
  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeNav);
  });

  document.documentElement.classList.add("js");
  var nodes = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
        var num = entry.target.querySelector("[data-count]");
        if (num) animateCount(num);
      });
    }, { threshold: 0.2 });
    nodes.forEach(function (node) { io.observe(node); });
  } else {
    nodes.forEach(function (node) {
      node.classList.add("is-visible");
      var num = node.querySelector("[data-count]");
      if (num) num.textContent = num.getAttribute("data-count");
    });
  }

  function animateCount(node) {
    var target = Number(node.getAttribute("data-count"));
    var start = performance.now();
    function frame(now) {
      var p = Math.min(1, (now - start) / 1100);
      var eased = 1 - Math.pow(1 - p, 3);
      node.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  var end = Date.now() + 7 * 24 * 60 * 60 * 1000;
  var label = document.getElementById("start-label");
  label.textContent = new Date(end).toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit"
  });

  function pad(n) { return String(n).padStart(2, "0"); }
  function tick() {
    var left = Math.max(0, end - Date.now());
    var total = Math.floor(left / 1000);
    document.getElementById("d").textContent = pad(Math.floor(total / 86400));
    document.getElementById("h").textContent = pad(Math.floor((total % 86400) / 3600));
    document.getElementById("m").textContent = pad(Math.floor((total % 3600) / 60));
    document.getElementById("s").textContent = pad(total % 60);
  }
  tick();
  setInterval(tick, 1000);

  document.querySelectorAll("[data-accordion]").forEach(function (box) {
    box.querySelectorAll(".acc-item").forEach(function (item) {
      item.querySelector("button").addEventListener("click", function () {
        var open = item.classList.contains("is-open");
        box.querySelectorAll(".acc-item").forEach(function (other) {
          other.classList.remove("is-open");
          other.querySelector("button").setAttribute("aria-expanded", "false");
        });
        if (!open) {
          item.classList.add("is-open");
          item.querySelector("button").setAttribute("aria-expanded", "true");
        }
      });
    });
  });

  var root = document.querySelector("[data-slider]");
  var track = root.querySelector("[data-track]");
  var slides = track.children;
  var dots = root.querySelectorAll("[data-dot]");
  var index = 0;
  var startX = 0;

  function show(next) {
    index = (next + slides.length) % slides.length;
    track.style.transform = "translateX(" + (-index * 100) + "%)";
    dots.forEach(function (dot, i) {
      dot.setAttribute("aria-selected", i === index ? "true" : "false");
    });
  }
  root.querySelector("[data-prev]").addEventListener("click", function () { show(index - 1); });
  root.querySelector("[data-next]").addEventListener("click", function () { show(index + 1); });
  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () { show(i); });
  });
  var windowEl = root.querySelector(".slider-window");
  windowEl.addEventListener("touchstart", function (event) {
    startX = event.changedTouches[0].clientX;
  }, { passive: true });
  windowEl.addEventListener("touchend", function (event) {
    var dx = event.changedTouches[0].clientX - startX;
    if (dx > 42) show(index - 1);
    if (dx < -42) show(index + 1);
  });
  windowEl.addEventListener("keydown", function (event) {
    if (event.key === "ArrowRight") show(index + 1);
    if (event.key === "ArrowLeft") show(index - 1);
  });

  var phone = document.getElementById("phone");
  function nationalDigits(raw) {
    var d = raw.replace(/\D/g, "");
    var guard = 0;
    while (guard < 2 && d && (d.charAt(0) === "7" || d.charAt(0) === "8")) {
      d = d.slice(1);
      guard++;
    }
    return d.slice(0, 10);
  }
  function formatPhone(raw) {
    var d = nationalDigits(raw);
    var out = "+7";
    if (d.length) out += " (" + d.slice(0, Math.min(3, d.length));
    if (d.length >= 3) out += ")";
    if (d.length > 3) out += " " + d.slice(3, Math.min(6, d.length));
    if (d.length > 6) out += "-" + d.slice(6, Math.min(8, d.length));
    if (d.length > 8) out += "-" + d.slice(8, 10);
    return out;
  }
  phone.addEventListener("focus", function () {
    if (!phone.value) phone.value = "+7";
  });
  phone.addEventListener("input", function () {
    phone.value = formatPhone(phone.value);
  });

  function setError(id, message) {
    document.getElementById(id + "-error").textContent = message;
    var field = document.getElementById(id);
    if (field) field.setAttribute("aria-invalid", message ? "true" : "false");
  }
  ["name", "phone", "tariff"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", function () { setError(id, ""); });
  });

  var dialog = document.getElementById("thanks");
  document.getElementById("thanks-close").addEventListener("click", function () { dialog.close(); });
  document.getElementById("lead").addEventListener("submit", function (event) {
    event.preventDefault();
    var name = document.getElementById("name").value.trim();
    var tariff = document.getElementById("tariff").value;
    var digits = nationalDigits(phone.value);
    var ok = true;
    if (!/^[A-Za-zА-Яа-яЁё][A-Za-zА-Яа-яЁё\-\s]{1,40}$/.test(name)) {
      setError("name", "Напишите имя.");
      ok = false;
    } else setError("name", "");
    if (digits.length !== 10) {
      setError("phone", "Нужен номер в формате +7 (999) 000-00-00.");
      ok = false;
    } else setError("phone", "");
    if (!tariff) {
      setError("tariff", "Выберите тариф.");
      ok = false;
    } else setError("tariff", "");
    if (!ok) return;
    document.getElementById("thanks-text").textContent = name + ", заявка на тариф «" + tariff + "» показана только на этом экране. Письмо в школу не ушло, оплата не списана.";
    dialog.showModal();
    event.target.reset();
    phone.value = "";
  });
})();
