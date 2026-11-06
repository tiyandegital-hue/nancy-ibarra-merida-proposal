/* ============================================================
   NANCY IBARRA — Datos del negocio en UNA constante (swappable)
   y comportamiento general del sitio (menú móvil, FAQ, filtros,
   animaciones de entrada). Sin peticiones externas.
   ============================================================ */
(function () {
  "use strict";

  /* UNA constante: cambiar aquí actualiza todo el sitio. */
  var BIZ = {
    name: "Nancy Ibarra Salón Spa",
    short: "Nancy Ibarra",
    phoneDisplay: "+52 999 277 0631",
    wa: "https://wa.me/529992770631",
    waText: "Hola Nancy Ibarra Salón Spa, quiero agendar una cita.",
    address: "Calle 21 #315 x 22 y 20, Col. Juan Pablo II, C.P. 97246, Mérida, Yucatán",
    maps: "https://maps.google.com/?q=place_id:1172356160037639",
    since: 1998
  };

  function applyBiz() {
    document.querySelectorAll("[data-biz]").forEach(function (n) { n.textContent = BIZ.name; });
    document.querySelectorAll("[data-biz-short]").forEach(function (n) { n.textContent = BIZ.short; });
    document.querySelectorAll("[data-phone]").forEach(function (n) { n.textContent = BIZ.phoneDisplay; });
    document.querySelectorAll("[data-address]").forEach(function (n) { n.textContent = BIZ.address; });
    document.querySelectorAll("[data-wa]").forEach(function (n) {
      n.href = BIZ.wa + "?text=" + encodeURIComponent(BIZ.waText);
    });
    document.querySelectorAll("[data-maps]").forEach(function (n) { n.href = BIZ.maps; });
    document.querySelectorAll("[data-since]").forEach(function (n) { n.textContent = String(BIZ.since); });
    document.querySelectorAll("[data-years]").forEach(function (n) {
      n.textContent = String(new Date().getFullYear() - BIZ.since);
    });
    document.querySelectorAll("[data-year]").forEach(function (n) {
      n.textContent = String(new Date().getFullYear());
    });
  }

  function mount() {
    applyBiz();

    /* Menú móvil */
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".main-nav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      nav.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () { nav.classList.remove("open"); });
      });
    }

    /* FAQ acordeón */
    document.querySelectorAll(".faq-item").forEach(function (item) {
      var q = item.querySelector(".faq-q");
      if (!q) return;
      q.addEventListener("click", function () {
        var open = item.classList.toggle("open");
        q.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });

    /* Filtro de servicios (Inicio) y de galería (Resultados) */
    document.querySelectorAll("[data-filter-group]").forEach(function (group) {
      var chips = group.querySelectorAll("[data-filter]");
      var targetSel = group.getAttribute("data-filter-group");
      var cards = document.querySelectorAll(targetSel);
      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          chips.forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
          chip.setAttribute("aria-pressed", "true");
          var f = chip.getAttribute("data-filter");
          cards.forEach(function (card) {
            var cats = (card.getAttribute("data-cat") || "").split(" ");
            card.style.display = (f === "todos" || cats.indexOf(f) !== -1) ? "" : "none";
          });
        });
      });
    });

    /* Entradas suaves (el estado de reposo ya es visible sin JS) */
    if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
        });
      }, { threshold: 0.12 });
      document.querySelectorAll(".reveal").forEach(function (n) { io.observe(n); });
    } else {
      document.querySelectorAll(".reveal").forEach(function (n) { n.classList.add("in"); });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else { mount(); }
})();
