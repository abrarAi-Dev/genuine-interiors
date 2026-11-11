// Genuine Interiors | Constructions - site behaviour
(function () {
  "use strict";

  // Footer year
  document.getElementById("year").textContent = new Date().getFullYear();

  // Mobile navigation
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("mainNav");
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

  // Booking form
  var form = document.getElementById("bookForm");
  var done = document.getElementById("bookDone");
  var errorBox = document.getElementById("formError");
  var dateInput = document.getElementById("fDate");

  // Earliest booking date = today
  var now = new Date();
  var iso = now.toISOString().split("T")[0];
  dateInput.min = iso;

  function val(id) {
    return document.getElementById(id).value.trim();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    errorBox.textContent = "";

    var name = val("fName");
    var phone = val("fPhone").replace(/[\s-]/g, "").replace(/^\+91/, "").replace(/^91(?=\d{10}$)/, "");
    var email = val("fEmail");
    var service = val("fService");
    var area = val("fArea");
    var date = val("fDate");
    var time = val("fTime");
    var msg = val("fMsg");

    if (!name) { errorBox.textContent = "Please enter your name."; return; }
    if (!/^[6-9]\d{9}$/.test(phone)) { errorBox.textContent = "Please enter a valid 10-digit mobile number."; return; }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { errorBox.textContent = "Please enter a valid email address, or leave it empty."; return; }
    if (!service) { errorBox.textContent = "Please select the service you need."; return; }
    if (!area) { errorBox.textContent = "Please enter your property location / area."; return; }
    if (!date) { errorBox.textContent = "Please choose a preferred date."; return; }
    if (date < iso) { errorBox.textContent = "Please choose a date from today onwards."; return; }

    var niceDate = new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
      weekday: "long", day: "numeric", month: "long", year: "numeric"
    });

    var lines = [
      "New Free Consultation Booking - Genuine Interiors | Constructions",
      "",
      "Name: " + name,
      "Mobile: +91 " + phone,
      email ? "Email: " + email : null,
      "Service needed: " + service,
      "Property location: " + area,
      "Preferred date: " + niceDate,
      "Preferred time: " + time,
      msg ? "About the project: " + msg : null,
      "",
      "Sent from the Genuine Interiors website"
    ].filter(Boolean);
    var text = lines.join("\n");

    document.getElementById("bookSummary").textContent = text;
    document.getElementById("waSend").href =
      "https://wa.me/916381852164?text=" + encodeURIComponent(text);
    document.getElementById("mailSend").href =
      "mailto:Genuineinteriors9@gmail.com?subject=" +
      encodeURIComponent("Free Consultation Booking - " + name) +
      "&body=" + encodeURIComponent(text);

    form.hidden = true;
    done.hidden = false;
    done.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  document.getElementById("bookAgain").addEventListener("click", function () {
    done.hidden = true;
    form.hidden = false;
    form.reset();
    dateInput.min = iso;
    form.scrollIntoView({ behavior: "smooth", block: "center" });
  });
})();
