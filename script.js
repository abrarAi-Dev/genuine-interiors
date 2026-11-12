// Genuine Interiors | Constructions - site behaviour (v2: scroll experience + booking)
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Light / dark theme switch (dark is the default; the dark blue background never changes)
  var themeBtn = document.getElementById("themeToggle");
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    if (themeBtn) themeBtn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    try { localStorage.setItem("gi-theme", theme); } catch (e) {}
  }
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var current = document.documentElement.getAttribute("data-theme") || "dark";
      applyTheme(current === "dark" ? "light" : "dark");
    });
    applyTheme(document.documentElement.getAttribute("data-theme") || "dark");
  }



  // Footer year
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile navigation
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("mainNav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // ---------- Reveal on scroll (both directions) ----------
  var rvEls = document.querySelectorAll(".rv");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var rvObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) en.target.classList.add("in");
        else en.target.classList.remove("in");
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -4% 0px" });
    rvEls.forEach(function (el) { rvObs.observe(el); });
  } else {
    rvEls.forEach(function (el) { el.classList.add("in"); });
  }

  // ---------- Scroll-driven effects ----------
  var progress = document.getElementById("progress");
  var header = document.getElementById("siteHeader");
  var toTop = document.getElementById("toTop");
  var plxEls = Array.prototype.slice.call(document.querySelectorAll(".plx"));
  var stLines = Array.prototype.slice.call(document.querySelectorAll(".st-line"));
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    if (header) header.classList.toggle("scrolled", y > 30);
    if (toTop) toTop.classList.toggle("show", y > 700);

    if (!reduceMotion) {
      // Parallax: move each .plx image slower than the scroll
      plxEls.forEach(function (img) {
        var wrap = img.closest(".plx-wrap") || img.parentElement;
        var r = wrap.getBoundingClientRect();
        if (r.bottom < -100 || r.top > window.innerHeight + 100) return;
        var total = r.height + window.innerHeight;
        var p = (window.innerHeight - r.top) / total; // 0..1 through the viewport
        var shift = (p - 0.5) * r.height * 0.16;
        img.style.transform = "translateY(" + shift.toFixed(1) + "px)";
      });
      // Statement lines brighten as they cross the middle of the screen
      stLines.forEach(function (line) {
        var r = line.getBoundingClientRect();
        var mid = window.innerHeight * 0.55;
        var d = Math.abs(r.top + r.height / 2 - mid);
        var o = Math.max(0.16, 1 - d / (window.innerHeight * 0.52));
        line.style.opacity = o.toFixed(2);
        line.style.transform = "translateY(" + ((1 - o) * 16).toFixed(1) + "px)";
      });
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  if (toTop) toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  // ---------- Story: sticky visual follows the active step ----------
  var stepBlocks = Array.prototype.slice.call(document.querySelectorAll(".step-block"));
  var storyImgs = Array.prototype.slice.call(document.querySelectorAll(".story-img"));
  var storyNum = document.getElementById("storyNum");
  function setStep(i) {
    stepBlocks.forEach(function (b, j) { b.classList.toggle("is-on", i === j); });
    storyImgs.forEach(function (im, j) { im.classList.toggle("is-on", i === j); });
    if (storyNum) storyNum.textContent = "0" + (i + 1);
  }
  if (stepBlocks.length && "IntersectionObserver" in window) {
    var stepObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) setStep(parseInt(en.target.getAttribute("data-step"), 10) || 0);
      });
    }, { rootMargin: "-38% 0px -38% 0px", threshold: 0 });
    stepBlocks.forEach(function (b) { stepObs.observe(b); });
  }

  // ---------- Booking form ----------
  var form = document.getElementById("bk-form");
  if (!form) return;
  var dateInput = document.getElementById("bk-date");
  var today = new Date();
  var iso = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
  dateInput.min = iso;

  var errorBox = document.getElementById("bk-error");
  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.hidden = false;
    errorBox.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    errorBox.hidden = true;

    var name = document.getElementById("bk-name").value.trim();
    var phoneRaw = document.getElementById("bk-phone").value.replace(/\D/g, "");
    var email = document.getElementById("bk-email").value.trim();
    var service = document.getElementById("bk-service").value;
    var area = document.getElementById("bk-area").value.trim();
    var dateVal = dateInput.value;
    var time = document.getElementById("bk-time").value;
    var msg = document.getElementById("bk-msg").value.trim();

    if (!name) return showError("Please enter your name.");
    var phone = phoneRaw;
    if (phone.length === 12 && phone.indexOf("91") === 0) phone = phone.slice(2);
    if (phone.length !== 10) return showError("Please enter a valid 10-digit mobile number.");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showError("That email address does not look right - please check it, or leave the field empty.");
    if (!service) return showError("Please choose the service you need.");
    if (!area) return showError("Please tell us your area in Chennai.");

    // Save the booking in the background: one row in the Google Sheet + an
    // email to the company. Fire-and-forget: the WhatsApp/email buttons below
    // still work even if this save fails, so it never blocks the visitor.
    try {
      fetch("https://script.google.com/macros/s/AKfycbx6FnxoeuW9KsAlqycCcx7jgh0h14HOOrmiQabI2oAtKKx_nqgoFtNgssEaBj76PrS8/exec", {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ name: name, phone: phone, email: email, service: service, area: area, date: dateVal, time: time || "Any time", message: msg })
      }).catch(function () {});
    } catch (err) {}

    var dateText = "Not fixed yet";
    if (dateVal) {
      var parts = dateVal.split("-");
      var d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      dateText = d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    }

    var lines = [
      "New Consultation Booking - Genuine Interiors Website",
      "",
      "Name: " + name,
      "Mobile: +91 " + phone,
      email ? "Email: " + email : null,
      "Service: " + service,
      "Area: " + area,
      "Preferred date: " + dateText,
      "Preferred time: " + (time || "Any time"),
      msg ? "About the project: " + msg : null
    ].filter(Boolean);

    var text = lines.join("\n");
    document.getElementById("bk-summary").textContent = text;
    document.getElementById("bk-wa").href = "https://wa.me/916381852164?text=" + encodeURIComponent(text);
    document.getElementById("bk-mail").href = "mailto:Genuineinteriors9@gmail.com?subject=" +
      encodeURIComponent("Free Consultation Booking - " + name) + "&body=" + encodeURIComponent(text);

    form.hidden = true;
    var result = document.getElementById("bk-result");
    result.hidden = false;
    result.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  document.getElementById("bk-again").addEventListener("click", function () {
    document.getElementById("bk-result").hidden = true;
    form.hidden = false;
    form.reset();
    dateInput.min = iso;
  });
})();
