/* ============================================================
   NANCY IBARRA — Motor del chat de demostración (WhatsApp bot)
   Flujos con guion. Sin precios inventados: todo precio, duración
   y horario exacto se confirma por WhatsApp ([CONFIRMAR]).
   El botón "Enviar por WhatsApp" arma un wa.me real al número
   del salón (+52 999 277 0631) con el resumen de la reserva.
   ============================================================ */
(function () {
  "use strict";

  var WA_NUMBER = "529992770631";
  var WA_BASE = "https://wa.me/" + WA_NUMBER + "?text=";
  var ADDRESS = "Calle 21 #315 x 22 y 20, Col. Juan Pablo II, Mérida, Yucatán";
  var MAPS = "https://maps.google.com/?q=place_id:1172356160037639";

  var SERVICES = [
    "Micropigmentación de cejas, ojos y labios",
    "Maquillaje social, de novia y de gala",
    "Peinados y recogidos de evento",
    "Corte, color, balayage y rayos",
    "Alaciado permanente y nanoplastia",
    "Manicure y pedicure spa",
    "Uñas de gel y Gelish",
    "Depilación con cera y definitiva sin láser"
  ];

  function nowTime() {
    return new Date().toLocaleTimeString("es-MX", { hour: "numeric", minute: "2-digit" });
  }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* ---------- Chat core ---------- */
  function Chat(root) {
    this.root = root;
    this.body = root.querySelector(".chat-body");
    this.quickRow = root.querySelector(".quick-row");
    this.input = root.querySelector(".chat-input input");
    this.sendBtn = root.querySelector(".chat-send");
    this.busy = false;
    this.state = {};
    var self = this;
    if (this.sendBtn) {
      this.sendBtn.addEventListener("click", function () { self.handleFreeText(); });
    }
    if (this.input) {
      this.input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); self.handleFreeText(); }
      });
    }
  }
  Chat.prototype.scrollDown = function () {
    this.body.scrollTop = this.body.scrollHeight;
  };
  Chat.prototype.clear = function () {
    this.body.innerHTML = "";
    this.quickRow.innerHTML = "";
    var date = el("div", "chat-date", "Hoy · Mérida, Yuc.");
    this.body.appendChild(date);
  };
  Chat.prototype.typing = function () {
    var t = el("div", "typing");
    t.setAttribute("aria-label", "El bot está escribiendo");
    t.innerHTML = "<i></i><i></i><i></i>";
    this.body.appendChild(t);
    this.scrollDown();
    return t;
  };
  Chat.prototype.addMsg = async function (from, text, opts) {
    opts = opts || {};
    var wait = opts.wait != null ? opts.wait : (from === "bot" ? 900 : 350);
    var typingEl = null;
    if (from === "bot" && !opts.instant) typingEl = this.typing();
    await sleep(wait);
    if (typingEl) typingEl.remove();
    var b = el("div", "bubble " + from);
    b.innerHTML = esc(text).replace(/\n/g, "<br>") +
      '<span class="time">' + nowTime() +
      (from === "client" ? ' <span class="ticks" aria-label="Leído">✓✓</span>' : "") + "</span>";
    this.body.appendChild(b);
    this.scrollDown();
  };
  Chat.prototype.addCard = async function (title, lines, code) {
    await sleep(700);
    var card = el("div", "chat-card");
    var html = "<h4>" + esc(title) + "</h4><ul>";
    lines.forEach(function (l) {
      html += "<li><span aria-hidden=\"true\">✓</span><span>" + esc(l) + "</span></li>";
    });
    html += "</ul>";
    if (code) html += '<div class="code">' + esc(code) + "</div>";
    html += '<span class="time">' + nowTime() + "</span>";
    card.innerHTML = html;
    this.body.appendChild(card);
    this.scrollDown();
  };
  Chat.prototype.addWaButton = function (label, message) {
    var wrap = el("div", "quick-row");
    var a = el("a", "btn btn-wa btn-sm", esc(label));
    a.href = WA_BASE + encodeURIComponent(message);
    a.target = "_blank";
    a.rel = "noopener";
    wrap.appendChild(a);
    this.body.appendChild(wrap);
    this.scrollDown();
  };
  Chat.prototype.setChips = function (chips) {
    var self = this;
    this.quickRow.innerHTML = "";
    chips.forEach(function (c) {
      var b = el("button", "quick", esc(c.label));
      b.type = "button";
      b.addEventListener("click", function () {
        if (self.busy) return;
        self.quickRow.innerHTML = "";
        c.onPick();
      });
      self.quickRow.appendChild(b);
    });
  };
  Chat.prototype.disableInput = function (on) {
    if (this.input) this.input.disabled = on;
    if (this.sendBtn) this.sendBtn.disabled = on;
  };

  /* ---------- Respuestas de texto libre (por palabra clave) ---------- */
  Chat.prototype.freeReply = async function (text) {
    var t = text.toLowerCase();
    this.busy = true;
    this.disableInput(true);
    if (/(precio|cuesta|cuánto|cuanto|costo|tarifa)/.test(t)) {
      await this.addMsg("bot", "El precio depende del servicio y de tu cabello o piel — te lo confirmamos por WhatsApp con fotos de referencia. ¿Qué servicio te interesa?");
    } else if (/(dónde|donde|dirección|direccion|ubicación|ubicacion|llegar|mapa)/.test(t)) {
      await this.addMsg("bot", "Estamos en " + ADDRESS + ". Te comparto la ubicación para que llegues sin vueltas:");
      var wrap = el("div", "quick-row");
      var a = el("a", "btn btn-ghost btn-sm", "Abrir en Google Maps");
      a.href = MAPS; a.target = "_blank"; a.rel = "noopener";
      wrap.appendChild(a); this.body.appendChild(wrap); this.scrollDown();
    } else if (/(horario|hora|abren|cierran|cuándo|cuando|atienden)/.test(t)) {
      await this.addMsg("bot", "El horario exacto se confirma por WhatsApp según disponibilidad del día. ¿Para qué día te gustaría tu cita?");
    } else if (/(domicilio|casa|hacienda|hotel)/.test(t)) {
      await this.addMsg("bot", "Sí, atendemos a domicilio para novias, XV años, graduaciones y grupos en Mérida. Cuéntanos tu fecha y el lugar por WhatsApp y te cotizamos.");
    } else if (/(tarjeta|pago|efectivo|transferencia|msi|meses)/.test(t)) {
      await this.addMsg("bot", "Las formas de pago se confirman por WhatsApp al momento de agendar. Escríbenos y te decimos las opciones disponibles.");
    } else if (/(gracias)/.test(t)) {
      await this.addMsg("bot", "¡Con gusto! Quedamos al pendiente por aquí o por WhatsApp. 🌸");
    } else if (/(hola|buenas|buenos)/.test(t)) {
      await this.addMsg("bot", "¡Hola! Bienvenida a Nancy Ibarra Salón Spa 🌸 ¿Qué servicio te gustaría agendar o cotizar hoy?");
      this.setChips([
        { label: "Reservar una cita", onPick: function () { startFlow("reservar"); } },
        { label: "Cotizar un servicio", onPick: function () { startFlow("cotizar"); } },
        { label: "Paquete de novias", onPick: function () { startFlow("novias"); } }
      ]);
    } else {
      await this.addMsg("bot", "Te ayudo con eso por WhatsApp — ahí te confirmamos precios, horarios y disponibilidad al momento.");
      this.addWaButton("Preguntar por WhatsApp", "Hola, tengo una pregunta sobre el salón: " + text);
    }
    this.busy = false;
    this.disableInput(false);
  };
  Chat.prototype.handleFreeText = function () {
    var v = (this.input.value || "").trim();
    if (!v || this.busy) return;
    this.input.value = "";
    var self = this;
    this.busy = true;
    this.addMsg("client", v, { instant: true }).then(function () {
      self.freeReply(v);
    });
  };

  /* ---------- Flujos con guion ---------- */
  var activeChat = null;
  function startFlow(kind) {
    if (!activeChat) return;
    var chat = activeChat;
    chat.busy = true;
    chat.disableInput(true);
    chat.clear();
    if (kind === "reservar") flowReservar(chat);
    else if (kind === "cotizar") flowCotizar(chat);
    else if (kind === "novias") flowNovias(chat);
  }

  async function flowReservar(chat) {
    await chat.addMsg("client", "¡Hola! Quiero agendar un Gelish este sábado por favor 💅", { instant: true });
    await chat.addMsg("bot", "¡Hola hermosa! Qué gusto saludarte 🌸 En Nancy Ibarra Salón Spa te consentimos este sábado.");
    await chat.addMsg("bot", "¿Qué servicio te gustaría? Elige uno:");
    chat.busy = false; chat.disableInput(false);
    chat.setChips(SERVICES.map(function (s) {
      return { label: s, onPick: function () { pickService(chat, s); } };
    }));
  }
  async function pickService(chat, service) {
    chat.state.service = service;
    chat.busy = true; chat.disableInput(true);
    await chat.addMsg("client", service, { instant: true });
    await chat.addMsg("bot", "Perfecto, " + service + ". ¿Para qué día?");
    chat.busy = false; chat.disableInput(false);
    chat.setChips([
      { label: "Hoy", onPick: function () { pickDay(chat, "Hoy"); } },
      { label: "Mañana", onPick: function () { pickDay(chat, "Mañana"); } },
      { label: "Este sábado", onPick: function () { pickDay(chat, "Este sábado"); } }
    ]);
  }
  async function pickDay(chat, day) {
    chat.state.day = day;
    chat.busy = true; chat.disableInput(true);
    await chat.addMsg("client", day, { instant: true });
    await chat.addMsg("bot", "Tengo estos horarios disponibles " + day.toLowerCase() + ". ¿Cuál te queda mejor?");
    chat.busy = false; chat.disableInput(false);
    chat.setChips([
      { label: "11:00 AM", onPick: function () { pickTime(chat, "11:00 AM"); } },
      { label: "3:30 PM", onPick: function () { pickTime(chat, "3:30 PM"); } },
      { label: "5:30 PM", onPick: function () { pickTime(chat, "5:30 PM"); } }
    ]);
  }
  async function pickTime(chat, time) {
    chat.state.time = time;
    chat.busy = true; chat.disableInput(true);
    await chat.addMsg("client", "A las " + time + " me queda perfecto 🙌", { instant: true });
    await chat.addCard("Ficha de reserva — ejemplo", [
      "Servicio: " + chat.state.service,
      "Día: " + chat.state.day + " · " + time,
      "Especialista: por asignar — te confirmamos por WhatsApp",
      "Precio: por confirmar por WhatsApp",
      "Lugar: " + ADDRESS
    ], "Demo — la confirmación real llega por WhatsApp");
    await chat.addMsg("bot", "✨ ¡Tu cita quedó apartada en esta demostración! Te enviaríamos un recordatorio 2 horas antes. Para confirmarla de verdad, envíala por WhatsApp:");
    chat.addWaButton("Enviar reserva por WhatsApp",
      "Hola Nancy Ibarra Salón Spa, quiero agendar: " + chat.state.service + ", " +
      chat.state.day + " a las " + time + ". ¿Me confirmas disponibilidad y precio?");
    chat.setChips([
      { label: "Ver otro servicio", onPick: function () { startFlow("reservar"); } },
      { label: "Cotizar novias", onPick: function () { startFlow("novias"); } }
    ]);
    chat.busy = false; chat.disableInput(false);
  }

  async function flowCotizar(chat) {
    await chat.addMsg("client", "Hola, me interesa información sobre la micropigmentación de cejas. ¿Qué incluye?", { instant: true });
    await chat.addMsg("bot", "¡Hola! Gracias por escribir a Nancy Ibarra Salón Spa ✨ La micropigmentación es nuestra especialidad insignia: cejas, ojos y labios con diseño personalizado.");
    await chat.addCard("Micropigmentación — lo que incluye", [
      "Diseño previo con visagismo según tu rostro",
      "Técnicas pelo a pelo, efecto polvo y acuarela",
      "Pigmentos orgánicos hipoalergénicos",
      "Kit de cuidados después del tratamiento",
      "Precio y duración: por confirmar por WhatsApp"
    ]);
    await chat.addMsg("bot", "¿Te gustaría agendar una valoración para medir tu rostro y cotizarte exacto?");
    chat.setChips([
      { label: "Agendar valoración", onPick: function () { startFlow("reservar"); } },
      { label: "Ver fotos de ejemplo", onPick: function () { showGalleryHint(chat); } },
      { label: "Formas de pago", onPick: function () { askPayment(chat); } }
    ]);
    chat.busy = false; chat.disableInput(false);
  }
  async function showGalleryHint(chat) {
    chat.busy = true; chat.disableInput(true);
    await chat.addMsg("client", "Ver fotos de ejemplo", { instant: true });
    await chat.addMsg("bot", "Claro 🌸 En la página de Resultados verás fotos de ejemplo de cada tratamiento. Las fotos reales del salón se agregan cuando nos las compartan.");
    chat.busy = false; chat.disableInput(false);
    chat.setChips([{ label: "Reservar una cita", onPick: function () { startFlow("reservar"); } }]);
  }
  async function askPayment(chat) {
    chat.busy = true; chat.disableInput(true);
    await chat.addMsg("client", "Formas de pago", { instant: true });
    await chat.addMsg("bot", "Las formas de pago se confirman por WhatsApp al momento de agendar. Escríbenos y te decimos las opciones disponibles.");
    chat.busy = false; chat.disableInput(false);
  }

  async function flowNovias(chat) {
    await chat.addMsg("client", "¡Hola! Quisiera cotizar el paquete de novia para mi boda en una hacienda en Mérida. 👰", { instant: true });
    await chat.addMsg("bot", "¡Muchas felicidades por tu compromiso! 👰✨ En Nancy Ibarra nos especializamos en novias desde 1998.");
    await chat.addMsg("bot", "Para enviarte la cotización exacta, ¿cuántas personas necesitarán peinado y maquillaje?");
    chat.busy = false; chat.disableInput(false);
    chat.setChips([
      { label: "Solo la novia", onPick: function () { pickPeople(chat, "Solo la novia (1 persona)"); } },
      { label: "Novia + 2 o 3 personas", onPick: function () { pickPeople(chat, "Novia + 2 o 3 personas"); } },
      { label: "Novia + 4 o más", onPick: function () { pickPeople(chat, "Novia + 4 o más personas"); } }
    ]);
  }
  async function pickPeople(chat, people) {
    chat.state.people = people;
    chat.busy = true; chat.disableInput(true);
    await chat.addMsg("client", people, { instant: true });
    await chat.addMsg("bot", "Perfecto. ¿Dónde será el arreglo?");
    chat.busy = false; chat.disableInput(false);
    chat.setChips([
      { label: "En el salón", onPick: function () { pickPlace(chat, "En el salón"); } },
      { label: "A domicilio / hacienda", onPick: function () { pickPlace(chat, "A domicilio / hacienda en Mérida"); } },
      { label: "Aún no lo decido", onPick: function () { pickPlace(chat, "Lugar por definir"); } }
    ]);
  }
  async function pickPlace(chat, place) {
    chat.state.place = place;
    chat.busy = true; chat.disableInput(true);
    await chat.addMsg("client", place, { instant: true });
    await chat.addMsg("bot", "¿Para qué fecha es tu evento?");
    chat.busy = false; chat.disableInput(false);
    chat.setChips([
      { label: "Ya tengo fecha", onPick: function () { pickDate(chat, "Fecha por confirmar por WhatsApp"); } },
      { label: "Aún no tengo fecha", onPick: function () { pickDate(chat, "Fecha por definir"); } }
    ]);
  }
  async function pickDate(chat, date) {
    chat.state.date = date;
    chat.busy = true; chat.disableInput(true);
    await chat.addMsg("client", date === "Fecha por definir" ? "Aún no tengo fecha" : "Ya tengo fecha", { instant: true });
    await chat.addCard("Propuesta de novias — ejemplo", [
      "Novia: prueba + maquillaje HD + peinado + pestañas",
      "Acompañantes: " + chat.state.people,
      "Lugar: " + chat.state.place,
      "Fecha: " + chat.state.date,
      "Inversión: cotización personalizada por WhatsApp"
    ], "Demo — la cotización real llega por WhatsApp");
    await chat.addMsg("bot", "¡Listo! Esta es tu propuesta de ejemplo. Envíala por WhatsApp y te cotizamos exacto con disponibilidad de equipo:");
    chat.addWaButton("Enviar cotización por WhatsApp",
      "Hola Nancy Ibarra Salón Spa, quiero cotizar mi paquete de novia: " +
      chat.state.people + ", " + chat.state.place + ", " + chat.state.date +
      ". ¿Me envían la cotización y disponibilidad?");
    chat.setChips([
      { label: "Reservar una cita", onPick: function () { startFlow("reservar"); } },
      { label: "Ver paquetes", onPick: function () { window.location.href = "novias-eventos.html"; } }
    ]);
    chat.busy = false; chat.disableInput(false);
  }

  /* ---------- Comandos rápidos (bot.html) ---------- */
  var QUICK = {
    ubicacion: async function (chat) {
      await chat.addMsg("client", "¿Cuál es su dirección exacta y cómo llego?", { instant: true });
      await chat.addMsg("bot", "📍 Estamos en " + ADDRESS + ". Te comparto la ubicación:");
      var wrap = el("div", "quick-row");
      var a = el("a", "btn btn-ghost btn-sm", "Abrir en Google Maps");
      a.href = MAPS; a.target = "_blank"; a.rel = "noopener";
      wrap.appendChild(a); chat.body.appendChild(wrap); chat.scrollDown();
    },
    tarjeta: async function (chat) {
      await chat.addMsg("client", "¿Aceptan tarjeta?", { instant: true });
      await chat.addMsg("bot", "Las formas de pago se confirman por WhatsApp al momento de agendar. Escríbenos y te decimos las opciones disponibles.");
    },
    domicilio: async function (chat) {
      await chat.addMsg("client", "¿Tienen servicio a domicilio?", { instant: true });
      await chat.addMsg("bot", "Sí, atendemos a domicilio para novias, XV años, graduaciones y grupos en Mérida. Cuéntanos tu fecha y el lugar por WhatsApp y te cotizamos.");
    },
    balayage: async function (chat) {
      await chat.addMsg("client", "¿Precio del balayage?", { instant: true });
      await chat.addMsg("bot", "El precio del balayage depende de tu cabello — largo, cantidad y tono. Escríbenos por WhatsApp con una foto y te cotizamos al momento.");
    }
  };

  /* ---------- Montaje ---------- */
  function mount() {
    var hero = document.querySelector('[data-chat="hero"]');
    if (hero) {
      var chat = new Chat(hero);
      activeChat = chat;
      chat.clear();
      var played = false;
      var play = function () {
        if (played) return;
        played = true;
        chat.busy = true;
        (async function () {
          await chat.addMsg("client", "¡Hola! ¿Tienen espacio para Gelish este sábado a las 4 pm? 💅", { instant: true, wait: 200 });
          await chat.addMsg("bot", "¡Hola! Bienvenida a Nancy Ibarra Salón Spa 🌸 Sí, tenemos disponibilidad con nuestras especialistas. ¿Te queda mejor a las 4:00 PM o a las 5:30 PM?");
          await chat.addMsg("client", "¡A las 4:00 PM me queda perfecto!", { instant: true });
          await chat.addCard("Ficha de reserva — ejemplo", [
            "Servicio: Uñas Gelish",
            "Día: Este sábado · 4:00 PM",
            "Precio: por confirmar por WhatsApp",
            "Lugar: " + ADDRESS
          ], "Demo — la confirmación real llega por WhatsApp");
          await chat.addMsg("bot", "✨ ¡Tu lugar quedó apartado en esta demostración! Pruébalo tú misma en la página del bot:");
          var wrap = el("div", "quick-row");
          var a = el("a", "btn btn-pink btn-sm", "Probar el bot completo");
          a.href = "bot.html";
          wrap.appendChild(a);
          chat.body.appendChild(wrap);
          chat.scrollDown();
          chat.busy = false;
        })();
      };
      if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (entries) {
          if (entries[0].isIntersecting) { play(); io.disconnect(); }
        }, { threshold: 0.3 });
        io.observe(hero);
      } else { play(); }
      var replay = hero.querySelector("[data-replay]");
      if (replay) replay.addEventListener("click", function () { played = false; chat.clear(); play(); });
    }

    var full = document.querySelector('[data-chat="full"]');
    if (full) {
      var fchat = new Chat(full);
      activeChat = fchat;
      fchat.clear();
      fchat.busy = true; fchat.disableInput(true);
      (async function () {
        await fchat.addMsg("bot", "¡Hola! Soy el asistente de Nancy Ibarra Salón Spa 🌸 Elige un escenario para ver cómo reservo, cotizo y confirmo por WhatsApp.");
        fchat.busy = false; fchat.disableInput(false);
        startFlow("reservar");
      })();
      document.querySelectorAll("[data-flow]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          document.querySelectorAll("[data-flow]").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
          btn.setAttribute("aria-pressed", "true");
          startFlow(btn.getAttribute("data-flow"));
        });
      });
      document.querySelectorAll("[data-quick]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          if (fchat.busy) return;
          fchat.busy = true; fchat.disableInput(true);
          QUICK[btn.getAttribute("data-quick")](fchat).then(function () {
            fchat.busy = false; fchat.disableInput(false);
          });
        });
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else { mount(); }
})();
