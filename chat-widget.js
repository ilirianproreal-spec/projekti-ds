/* ============================================
   Trust Music™ — AI Asistenti (Groq)
   Chatbot + Rezervim Terminash (datë + orë)
   Shto: <script src="chat-widget.js"></script> para </body>
   ============================================ */
(function () {
  "use strict";

  // ⚠️ KUJDES: Ky çelës API është i ekspozuar në browser.
  // Për prodhim real, vendose në një proxy/serverless (Vercel).
  var GROQ_API_KEY = "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";
  var GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
  var MODEL = "llama-3.3-70b-versatile";

  // Supabase — ruajtje qendrore e rezervimeve (pronari i sheh në admin.html)
  var SUPABASE_URL = "https://cedzpbifgveuyleaxibo.supabase.co";
  var SUPABASE_KEY = "sb_publishable_UZdgHVc8Nfgqxmo7E0WdSw_nGSHiuIa";
  var sb = null;

  function loadSupabase() {
    if (window.supabase) { initSupabase(); return; }
    var s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    s.onload = initSupabase;
    document.head.appendChild(s);
  }
  function initSupabase() {
    try { sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY); } catch (e) {}
  }

  function saveBookingToCloud(booking) {
    if (!sb) return;
    sb.from("bookings").insert([{
      name: booking.name,
      phone: booking.phone || null,
      service: booking.service,
      date: booking.date,
      time: booking.time,
      source: "ai-chat"
    }]).then(function (r) {
      if (r.error) console.warn("Supabase booking error:", r.error.message);
    });
  }

  var PROMPTS = {
    en: "You are the virtual assistant of 'Trust Music™', a professional music studio in Prishtina, Kosovo. " +
      "Founded by Krenar Batusha & And Sylejmani. Artists: Marc Hill (Producer & DJ), Ilothegoat, Ervisi, Xent, Jolle.\n\n" +
      "Our services:\n" +
      "- Professional Recording (acoustic booth, Neumann TLM 102 microphone)\n" +
      "- Mix & Master\n" +
      "- Music Production (beats, arrangement, any genre)\n" +
      "- Audio Consulting\n\n" +
      "Hours: Monday – Saturday 12:00–02:00, Sunday closed.\n" +
      "Address: Prishtina, Kosovo.\n" +
      "Email: trust.music2025@gmail.com | Tel: +383 48 317 357.\n\n" +
      "IMPORTANT RULES:\n" +
      "1. ALWAYS reply in English, briefly and friendly.\n" +
      "2. NEVER give any price/cost — if asked about prices, say 'Contact us for a personalized quote.'\n" +
      "3. If the client wants to book a session, point them to the '📅 Book a Session' button and ask for: name, service, date and time.\n" +
      "4. Do not invent information. Stick to the studio's facts.",
    sq: "Ti je asistenti virtual i 'Trust Music™', studio muzikore profesionale në Prishtinë, Kosovë. " +
      "Themeluar nga Krenar Batusha & And Sylejmani. Artet: Marc Hill (Producent & DJ), Ilothegoat, Ervisi, Xent, Jolle.\n\n" +
      "Shërbimet tona:\n" +
      "- Incizim Profesional (kabina akustike, mikrofona Neumann TLM 102)\n" +
      "- Miks & Master\n" +
      "- Produksion Muzikor (beat, aranzhim, çdo zhanër)\n" +
      "- Konsulencë Audio\n\n" +
      "Orari: E Hënë – E Shtunë 12:00–02:00, E Diel mbyllur.\n" +
      "Adresa: Prishtinë, Kosovë.\n" +
      "Email: trust.music2025@gmail.com | Tel: +383 48 317 357.\n\n" +
      "RREGULLA TË RËNDËSISHME:\n" +
      "1. Përgjigju GJITHMONË në shqip, shkurt dhe miqësisht.\n" +
      "2. MOS jep asnjë çmim/kosto — nëse pyesin për çmime, thuaj 'Na kontakto për një ofertë të personalizuar.'\n" +
      "3. Nëse klienti dëshiron të rezervojë një termin, drejtoje te butoni '📅 Rezervo Termin' dhe kërko: emrin, shërbimin, datën dhe orën.\n" +
      "4. Mos i shpik informacione. Qëndro te faktet e studios."
  };

  function curLang() {
    try { return localStorage.getItem("trust-lang") === "sq" ? "sq" : "en"; } catch (e) { return "en"; }
  }
  function getPrompt() { return PROMPTS[curLang()]; }

  // --- Inject CSS ---
  var css = document.createElement("style");
  css.textContent = [
    "#tm-chat-btn{position:fixed;right:22px;bottom:22px;z-index:99990;width:60px;height:60px;border-radius:50%;border:none;cursor:pointer;background:linear-gradient(135deg,#238636,#17692A);color:#0a0a0a;font-size:26px;box-shadow:0 6px 24px rgba(35,134,54,.4);transition:.3s cubic-bezier(.4,0,.2,1);display:flex;align-items:center;justify-content:center}",
    "#tm-chat-btn:hover{transform:scale(1.08);box-shadow:0 8px 32px rgba(35,134,54,.55)}",
    "#tm-chat-btn .dot{position:absolute;top:2px;right:2px;width:14px;height:14px;background:#22c55e;border:2px solid #0a0a0a;border-radius:50%}",
    "#tm-chat{position:fixed;right:22px;bottom:92px;z-index:99995;width:360px;max-width:calc(100vw - 32px);height:540px;max-height:calc(100vh - 120px);background:#111;border:1px solid #2a2a2a;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,.6);display:flex;flex-direction:column;overflow:hidden;transform:translateY(20px);opacity:0;pointer-events:none;transition:.3s cubic-bezier(.4,0,.2,1)}",
    "#tm-chat.open{transform:translateY(0);opacity:1;pointer-events:auto}",
    "#tm-chat-head{display:flex;align-items:center;gap:12px;padding:16px;background:linear-gradient(135deg,rgba(35,134,54,.12),rgba(35,134,54,.03));border-bottom:1px solid #2a2a2a}",
    "#tm-chat-ava{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#238636,#17692A);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}",
    "#tm-chat-title{font:700 15px 'Poppins',sans-serif;color:#fff}#tm-chat-sub{font:400 11px 'Inter',sans-serif;color:#707070}",
    "#tm-chat-close{margin-left:auto;background:none;border:none;color:#707070;font-size:20px;cursor:pointer;padding:4px}#tm-chat-close:hover{color:#fff}",
    "#tm-chat-body{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;background:#0f0f0f}",
    "#tm-chat-body::-webkit-scrollbar{width:5px}#tm-chat-body::-webkit-scrollbar-thumb{background:#333;border-radius:10px}",
    ".tm-msg{max-width:82%;padding:10px 14px;border-radius:16px;font:400 13.5px/1.55 'Inter',sans-serif;white-space:pre-wrap;word-wrap:break-word;animation:tmIn .25s ease}",
    ".tm-msg.bot{background:#1a1a1a;color:#e0e0e0;border-bottom-left-radius:4px;align-self:flex-start}",
    ".tm-msg.user{background:linear-gradient(135deg,#238636,#17692A);color:#0a0a0a;border-bottom-right-radius:4px;align-self:flex-end;font-weight:500}",
    "@keyframes tmIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}",
    ".tm-typing{display:flex;gap:4px;align-items:center;padding:12px 14px}.tm-typing span{width:7px;height:7px;background:#707070;border-radius:50%;animation:tmBlink 1.2s infinite}.tm-typing span:nth-child(2){animation-delay:.2s}.tm-typing span:nth-child(3){animation-delay:.4s}@keyframes tmBlink{0%,80%,100%{opacity:.3}40%{opacity:1}}",
    "#tm-quick{display:flex;gap:6px;flex-wrap:wrap;padding:8px 12px;border-top:1px solid #2a2a2a;background:#111}",
    ".tm-quick-btn{background:#1a1a1a;border:1px solid #2a2a2a;color:#b0b0b0;border-radius:18px;padding:6px 12px;font:500 11.5px 'Inter',sans-serif;cursor:pointer;transition:.2s}.tm-quick-btn:hover{border-color:#238636;color:#238636}",
    "#tm-form{display:none;flex-direction:column;gap:8px;padding:12px;border-top:1px solid #2a2a2a;background:#111}",
    "#tm-form.show{display:flex}",
    ".tm-field{display:flex;flex-direction:column;gap:3px}.tm-field label{font:600 11px 'Inter',sans-serif;color:#b0b0b0}",
    ".tm-field input,.tm-field select{padding:9px 10px;border-radius:8px;border:1px solid #2a2a2a;background:#0f0f0f;color:#fff;font:400 13px 'Inter',sans-serif;outline:none;transition:.2s}.tm-field input:focus,.tm-field select:focus{border-color:#238636}",
    ".tm-field input[type=date],.tm-field input[type=time]{color-scheme:dark}",
    ".tm-row{display:flex;gap:8px}.tm-row .tm-field{flex:1}",
    "#tm-submit{padding:11px;border:none;border-radius:10px;background:linear-gradient(135deg,#238636,#17692A);color:#0a0a0a;font:700 13.5px 'Poppins',sans-serif;cursor:pointer;transition:.2s}#tm-submit:hover{opacity:.9}",
    "#tm-cancel{background:none;border:none;color:#707070;font:500 12px 'Inter',sans-serif;cursor:pointer;padding:6px}#tm-cancel:hover{color:#fff}",
    "#tm-chat-input{display:flex;gap:8px;padding:12px;border-top:1px solid #2a2a2a;background:#111}",
    "#tm-chat-input textarea{flex:1;resize:none;padding:10px 12px;border-radius:10px;border:1px solid #2a2a2a;background:#0f0f0f;color:#fff;font:400 13.5px 'Inter',sans-serif;outline:none;max-height:80px;min-height:42px}.tm-field textarea:focus,#tm-chat-input textarea:focus{border-color:#238636}",
    "#tm-send{width:42px;height:42px;border-radius:10px;border:none;background:linear-gradient(135deg,#238636,#17692A);color:#0a0a0a;font-size:17px;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:.2s}#tm-send:hover{opacity:.9}",
    "@media(max-width:480px){#tm-chat{right:12px;bottom:84px;width:calc(100vw - 24px)}#tm-chat-btn{right:14px;bottom:16px}}"
  ].join("\n");
  document.head.appendChild(css);

  // --- Inject HTML ---
  var html =
    '<button id="tm-chat-btn" aria-label="Hap asistentin">♫<span class="dot"></span></button>' +
    '<div id="tm-chat" role="dialog" aria-label="Trust Music™ Asistent">' +
      '<div id="tm-chat-head">' +
        '<div id="tm-chat-ava">♫</div>' +
        '<div><div id="tm-chat-title">Trust Music™ AI</div><div id="tm-chat-sub">Studio assistant — Online</div></div>' +
        '<button id="tm-chat-close" aria-label="Mbyll">✕</button>' +
      '</div>' +
      '<div id="tm-chat-body"></div>' +
      '<div id="tm-quick">' +
        '<button class="tm-quick-btn" data-q="What services do you offer?">🎙️ Services</button>' +
        '<button class="tm-quick-btn" data-q="How can I book a session?">📅 Booking</button>' +
        '<button class="tm-quick-btn" data-q="Where is the studio located?">📍 Location</button>' +
      '</div>' +
      '<form id="tm-form">' +
        '<div style="display:flex;justify-content:space-between;align-items:center"><b style="font:700 13px Poppins;color:#238636">📅 Book a Session</b><button type="button" id="tm-cancel">Cancel</button></div>' +
        '<div class="tm-field"><label>Full name *</label><input id="tm-b-name" placeholder="Full name" required></div>' +
        '<div class="tm-field"><label>Phone</label><input id="tm-b-phone" type="tel" placeholder="+383 48 317 357"></div>' +
        '<div class="tm-field"><label>Service *</label><select id="tm-b-service" required><option value="">Choose...</option><option>Professional Recording</option><option>Mix & Master</option><option>Music Production</option><option>Audio Consulting</option><option>Other</option></select></div>' +
        '<div class="tm-row"><div class="tm-field"><label>Date *</label><input id="tm-b-date" type="date" required></div><div class="tm-field"><label>Time *</label><input id="tm-b-time" type="time" required></div></div>' +
        '<button type="submit" id="tm-submit">Confirm Booking ✓</button>' +
      '</form>' +
      '<div id="tm-chat-input">' +
        '<textarea id="tm-chat-text" placeholder="Type your message..." rows="1"></textarea>' +
        '<button id="tm-send" aria-label="Dërgo">➤</button>' +
      '</div>' +
    '</div>';
  var wrap = document.createElement("div");
  wrap.innerHTML = html;
  while (wrap.firstChild) document.body.appendChild(wrap.firstChild);

  // --- Elements ---
  var btn = document.getElementById("tm-chat-btn");
  var chat = document.getElementById("tm-chat");
  var body = document.getElementById("tm-chat-body");
  var closeBtn = document.getElementById("tm-chat-close");
  var text = document.getElementById("tm-chat-text");
  var send = document.getElementById("tm-send");
  var form = document.getElementById("tm-form");
  var cancel = document.getElementById("tm-cancel");

  // --- Bilingual UI strings ---
  var UI = {
    en: {
      sub: "Studio assistant — Online",
      qs: ["🎙️ Services", "📅 Booking", "📍 Location"],
      qqs: ["What services do you offer?", "How can I book a session?", "Where is the studio located?"],
      formTitle: "📅 Book a Session", cancel: "Cancel",
      labels: ["Full name *", "Phone", "Service *", "Date *", "Time *"],
      ph: ["Full name", "+383 48 317 357"],
      svc: ["Choose...", "Professional Recording", "Mix & Master", "Music Production", "Audio Consulting", "Other"],
      submit: "Confirm Booking ✓", inputPh: "Type your message...",
      greet: "Hello! 👋 I'm the Trust Music™ assistant. How can I help you?",
      err: "Sorry, I had a technical problem. Please try again in a few moments.",
      thx1: "✅ Thank you ", thx2: "!\n\nYour session has been booked:\n• Service: ",
      thx3: "\n• Date: ", thx4: "\n• Time: ", thx5: "\n• Phone: ",
      thx6: "\n\nThe booking is being sent to WhatsApp for confirmation. 🎶",
      waTitle: "NEW BOOKING", waName: "Name", waPhone: "Phone", waSvc: "Service", waDate: "Date", waTime: "Time"
    },
    sq: {
      sub: "Asistenti i studios — Online",
      qs: ["🎙️ Shërbimet", "📅 Rezervim", "📍 Adresa"],
      qqs: ["Çfarë shërbimesh ofroni?", "Si mund të rezervoj një termin?", "Ku ndodhet studioja?"],
      formTitle: "📅 Rezervo Terminin", cancel: "Anulo",
      labels: ["Emri i plotë *", "Telefoni", "Shërbimi *", "Data *", "Ora *"],
      ph: ["Emri dhe mbiemri", "+383 48 317 357"],
      svc: ["Zgjidh...", "Incizim Profesional", "Miks & Master", "Produksion Muzikor", "Konsulencë Audio", "Tjetër"],
      submit: "Konfirmo Rezervimin ✓", inputPh: "Shkruaj mesazhin...",
      greet: "Përshëndetje! 👋 Jam asistenti i Trust Music™. Si mund t'ju ndihmoj?",
      err: "Më falni, kisha një problem teknik. Ju lutem provoni përsëri në pak çaste.",
      thx1: "✅ Faleminderit ", thx2: "!\n\nTermini juaj u rezervua:\n• Shërbimi: ",
      thx3: "\n• Data: ", thx4: "\n• Ora: ", thx5: "\n• Telefoni: ",
      thx6: "\n\nRezervimi po dërgohet në WhatsApp për konfirmim. 🎶",
      waTitle: "REZERVIM I RI", waName: "Emri", waPhone: "Telefoni", waSvc: "Shërbimi", waDate: "Data", waTime: "Ora"
    }
  };
  var chatLang = "en";

  function applyChatLang(lang) {
    chatLang = (lang === "sq") ? "sq" : (lang || curLang());
    var u = UI[chatLang] || UI.en;
    if (messages[0]) messages[0].content = getPrompt();
    var sub = document.getElementById("tm-chat-sub"); if (sub) sub.textContent = u.sub;
    var qs = document.querySelectorAll(".tm-quick-btn");
    for (var qi = 0; qi < qs.length; qi++) {
      qs[qi].textContent = u.qs[qi];
      qs[qi].setAttribute("data-q", u.qqs[qi]);
    }
    var ft = document.querySelector("#tm-form > div > b"); if (ft) ft.textContent = u.formTitle;
    var cb = document.getElementById("tm-cancel"); if (cb) cb.textContent = u.cancel;
    var labs = document.querySelectorAll("#tm-form label");
    for (var li2 = 0; li2 < labs.length; li2++) labs[li2].textContent = u.labels[li2];
    var opts = document.querySelectorAll("#tm-b-service option");
    for (var oi = 0; oi < opts.length; oi++) opts[oi].textContent = u.svc[oi];
    var nm = document.getElementById("tm-b-name"); if (nm) nm.placeholder = u.ph[0];
    var ph = document.getElementById("tm-b-phone"); if (ph) ph.placeholder = u.ph[1];
    var sb = document.getElementById("tm-submit"); if (sb) sb.textContent = u.submit;
    var tx = document.getElementById("tm-chat-text"); if (tx) tx.placeholder = u.inputPh;
  }

  // --- Conversation state ---
  var messages = [{ role: "system", content: getPrompt() }];
  var isOpen = false;

  window.addEventListener("trustlang", function (e) { applyChatLang(e.detail); });
  applyChatLang(curLang());

  function addMsg(role, content) {
    var d = document.createElement("div");
    d.className = "tm-msg " + (role === "user" ? "user" : "bot");
    d.textContent = content;
    body.appendChild(d);
    body.scrollTop = body.scrollHeight;
    return d;
  }

  function showTyping() {
    var d = document.createElement("div");
    d.className = "tm-msg bot tm-typing";
    d.innerHTML = "<span></span><span></span><span></span>";
    body.appendChild(d);
    body.scrollTop = body.scrollHeight;
    return d;
  }

  function toggle() {
    isOpen = !isOpen;
    chat.classList.toggle("open", isOpen);
    if (isOpen && body.children.length === 0) greet();
  }

  function greet() {
    addMsg("bot", (UI[chatLang] || UI.en).greet);
  }

  function toggleForm(show) {
    form.classList.toggle("show", show);
  }

  async function callGroq() {
    try {
      var res = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + GROQ_API_KEY
        },
        body: JSON.stringify({ model: MODEL, messages: messages, temperature: 0.7, max_tokens: 500 })
      });
      if (!res.ok) {
        var err = "";
        try { err = (await res.json()).error.message; } catch (e) {}
        throw new Error("API " + res.status + (err ? " — " + err : ""));
      }
      var data = await res.json();
      return data.choices[0].message.content;
    } catch (e) {
      return null;
    }
  }

  async function sendMessage(txt) {
    txt = txt.trim();
    if (!txt) return;
    addMsg("user", txt);
    messages.push({ role: "user", content: txt });
    text.value = "";
    text.style.height = "auto";

    var typing = showTyping();
    var reply = await callGroq();
    typing.remove();

    if (reply === null) {
      addMsg("bot", (UI[chatLang] || UI.en).err);
      return;
    }
    messages.push({ role: "assistant", content: reply });
    addMsg("bot", reply);

    // Nëse përmend rezervim, shfaq formën
    if (/rezerv|termin|seanc|takim|book|session|appointment/i.test(txt)) {
      setTimeout(function () { toggleForm(true); }, 500);
    }
  }

  // --- Booking submit ---
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("tm-b-name").value.trim();
    var phone = document.getElementById("tm-b-phone").value.trim();
    var service = document.getElementById("tm-b-service").value;
    var date = document.getElementById("tm-b-date").value;
    var time = document.getElementById("tm-b-time").value;
    if (!name || !service || !date || !time) return;

    var booking = { name: name, phone: phone, service: service, date: date, time: time, at: new Date().toISOString() };
    var list = [];
    try { list = JSON.parse(localStorage.getItem("tm_bookings") || "[]"); } catch (e) {}
    list.push(booking);
    localStorage.setItem("tm_bookings", JSON.stringify(list));

    // Ruaj në Supabase (pronari i sheh në admin.html)
    saveBookingToCloud(booking);

    toggleForm(false);
    form.reset();

    var d = new Date(date + "T00:00:00");
    var loc = chatLang === "sq" ? "sq-AL" : "en-US";
    var pretty = d.toLocaleDateString(loc, { weekday: "long", day: "numeric", month: "long", year: "numeric" });

    // Dërgo rezervimin në WhatsApp
    var u = UI[chatLang] || UI.en;
    var waMsg = "🎶 " + u.waTitle + " — Trust Music™\n\n" +
      "• " + u.waName + ": " + name + "\n" +
      (phone ? "• " + u.waPhone + ": " + phone + "\n" : "") +
      "• " + u.waSvc + ": " + service + "\n" +
      "• " + u.waDate + ": " + pretty + "\n" +
      "• " + u.waTime + ": " + time;
    var waUrl = "https://wa.me/38348317357?text=" + encodeURIComponent(waMsg);
    window.open(waUrl, "_blank");

    addMsg("bot", u.thx1 + name + u.thx2 + service +
      u.thx3 + pretty + u.thx4 + time +
      (phone ? u.thx5 + phone : "") +
      u.thx6);
  });

  cancel.addEventListener("click", function () { toggleForm(false); });

  // --- Events ---
  btn.addEventListener("click", toggle);
  closeBtn.addEventListener("click", toggle);
  send.addEventListener("click", function () { sendMessage(text.value); });
  text.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(text.value); }
  });
  text.addEventListener("input", function () {
    text.style.height = "auto";
    text.style.height = Math.min(text.scrollHeight, 80) + "px";
  });

  document.querySelectorAll(".tm-quick-btn").forEach(function (b) {
    b.addEventListener("click", function () {
      sendMessage(b.getAttribute("data-q"));
    });
  });

  // Min date = sot
  var dateInput = document.getElementById("tm-b-date");
  if (dateInput) {
    var today = new Date();
    dateInput.min = today.toISOString().split("T")[0];
  }

  // Ngarko Supabase për ruajtje qendrore të rezervimeve
  loadSupabase();
})();
