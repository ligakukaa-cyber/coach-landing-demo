(function () {
  "use strict";

  // ---------- легкий fade-in при появлении в вьюпорте ----------
  const fadeEls = document.querySelectorAll(".fade");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    fadeEls.forEach((el) => io.observe(el));
  } else {
    fadeEls.forEach((el) => el.classList.add("in"));
  }

  // ---------- валидация заявки — зеркало lead.py ----------
  const PHONE_RE = /^\+?\d[\d\s\-()]{9,}$/;
  const TELEGRAM_RE = /^@[A-Za-z0-9_]{5,32}$/;
  const FORMATS = {
    single: "Разовая сессия",
    package4: "Пакет 4 сессии",
    longterm: "Долгосрочное сопровождение",
  };

  function validateLead(name, contact, fmt) {
    name = (name || "").trim();
    contact = (contact || "").trim();
    const errors = {};

    if (name.length < 2) errors.name = "Введите имя (минимум 2 символа)";
    if (!(PHONE_RE.test(contact) || TELEGRAM_RE.test(contact))) {
      errors.contact = "Укажите телефон (+7...) или Telegram (@username)";
    }
    if (!FORMATS[fmt]) errors.format = "Выберите формат работы";

    return { ok: Object.keys(errors).length === 0, errors, name, contact, format: FORMATS[fmt] };
  }

  const form = document.getElementById("bookingForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("f-name").value;
      const contact = document.getElementById("f-contact").value;
      const fmt = document.getElementById("f-format").value;

      const result = validateLead(name, contact, fmt);
      document.getElementById("err-name").textContent = result.errors.name || "";
      document.getElementById("err-contact").textContent = result.errors.contact || "";
      document.getElementById("err-format").textContent = result.errors.format ? "Выберите формат" : "";

      const note = document.getElementById("form-note");
      if (!result.ok) {
        note.textContent = "";
        return;
      }
      const handler = window.BOOKING_ON_SUBMIT || ((r) => {
        note.textContent = `Заявка сформирована (демо-режим): ${r.name}, ${r.contact}, ${r.format}`;
      });
      handler(result);
    });
  }
})();
