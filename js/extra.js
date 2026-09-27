/* ===== Capta — melhorias interactivas (v2) ===== */
(function () {
  "use strict";
  var C = window.CAPTA;
  var $ = function (s) { return document.querySelector(s); };
  var fmt = new Intl.NumberFormat("pt-PT", { maximumFractionDigits: 0 });
  function mt(v) { return String(Math.ceil(v)).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " MT"; }
  function wa(msg) { return "https://wa.me/" + C.contactos.whatsapp + "?text=" + encodeURIComponent(msg); }

  /* ---------- Formas de pagamento ---------- */
  var pl = $("#payList");
  if (pl && C.pagamentos) pl.innerHTML = C.pagamentos.map(function (p) { return "<li>" + p + "</li>"; }).join("");

  /* ---------- Simulador rápido (hero) ---------- */
  var q = { prod: "negocio", valor: C.produtos.negocio.inicial, prazo: C.produtos.negocio.prazos[0], freq: "diaria" };
  var qr = $("#qValor");
  function qCalc() {
    var p = C.produtos[q.prod], f = C.frequencias[q.freq];
    var total = q.valor * (1 + p.taxaMensal * q.prazo) + q.valor * (C.taxaAbertura || 0);
    var n = Math.max(1, Math.round(f.porMes * q.prazo));
    q.total = total; q.n = n; q.prest = total / n;
    $("#qValorOut").textContent = mt(q.valor);
    $("#qPrest").textContent = mt(q.prest);
    $("#qPrestLabel").textContent = "Prestação " + f.nome.toLowerCase() + " (" + n + "×)";
    $("#qTotal").textContent = "Total a reembolsar: " + mt(total);
  }
  function pills(el, items, key) {
    el.innerHTML = "";
    items.forEach(function (it) {
      var b = document.createElement("button");
      b.type = "button"; b.textContent = it.label;
      b.setAttribute("aria-pressed", String(q[key]) === String(it.value));
      b.addEventListener("click", function () {
        q[key] = it.value;
        el.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
        if (key === "prod") qSetProd();
        qCalc();
      });
      el.appendChild(b);
    });
  }
  if (qr) {
    var qSetProd = function () {
      var pn = C.produtos[q.prod];
      qr.min = pn.min; qr.max = pn.max; qr.step = pn.passo;
      if (q.valor < pn.min || q.valor > pn.max) q.valor = pn.inicial;
      qr.value = q.valor;
      if (pn.prazos.indexOf(q.prazo) < 0) q.prazo = pn.prazos[0];
      pills($("#qPrazo"), pn.prazos.map(function (m) { return { value: m, label: m + (m === 1 ? " mês" : " meses") }; }), "prazo");
    };
    var qp = $("#qProd");
    if (qp) pills(qp, Object.keys(C.produtos).map(function (k) { return { value: k, label: C.produtos[k].nome.replace(" / Consumo", "") }; }), "prod");
    qSetProd();
    qr.addEventListener("input", function () { q.valor = Number(qr.value); qCalc(); });
    pills($("#qFreq"), Object.keys(C.frequencias).map(function (k) { return { value: k, label: C.frequencias[k].nome }; }), "freq");
    qCalc();
    $("#qWa").addEventListener("click", function (e) {
      e.preventDefault();
      window.open(wa("Olá Capta! Fiz uma simulação no site e quero pedir crédito.\n\n" +
        "Produto: " + C.produtos[q.prod].nome + "\nValor: " + mt(q.valor) + "\nPrazo: " + q.prazo + (q.prazo === 1 ? " mês" : " meses") +
        "\nPagamento: " + C.frequencias[q.freq].nome + " (" + q.n + " × " + mt(q.prest) + ")\nTotal: " + mt(q.total)), "_blank", "noopener");
    });
  }

  /* ---------- "Pedir este crédito" do simulador completo → WhatsApp ---------- */
  var bp = $("#btnPedir");
  if (bp) bp.addEventListener("click", function (e) {
    e.preventDefault();
    var prod = $("#simProduto [aria-pressed=true]"), prazo = $("#simPrazo [aria-pressed=true]"), freq = $("#simFreq [aria-pressed=true]");
    window.open(wa("Olá Capta! Fiz uma simulação no site e quero pedir crédito.\n\n" +
      "Produto: " + (prod ? prod.textContent : "") + "\nValor: " + $("#resValor").textContent +
      "\nPrazo: " + (prazo ? prazo.textContent : "") + "\nPagamento: " + (freq ? freq.textContent : "") +
      " (" + $("#resN").textContent + " × " + $("#resPrest").textContent + ")\nTotal: " + $("#resTotal").textContent), "_blank", "noopener");
  });

  /* ---------- Barra móvel ---------- */
  var mw = $("#mbarWa");
  if (mw) mw.href = wa("Olá Capta! Gostaria de saber mais sobre o microcrédito.");
  var fw = $("#faqWa");
  if (fw) { fw.href = wa("Olá Capta! Tenho uma dúvida sobre o microcrédito."); fw.target = "_blank"; fw.rel = "noopener"; }

  /* ---------- Animações ---------- */
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var targets = document.querySelectorAll(".section__head, .tile, .product, .steps li, .card, .edu__card, .faq details, .sim, .about__quote");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    targets.forEach(function (t, i) { t.classList.add("reveal"); t.style.transitionDelay = (i % 5) * 60 + "ms"; io.observe(t); });
  }

  /* ---------- Dados institucionais (só os preenchidos) ---------- */
  var L = C.legal || {}, fi = $("#footerInst");
  if (fi) {
    var it = [];
    if (L.razaoSocial) it.push("<li>" + L.razaoSocial + "</li>");
    if (L.nuit) it.push("<li>NUIT: " + L.nuit + "</li>");
    if (L.registoComercial) it.push("<li>" + L.registoComercial + "</li>");
    if (L.autorizacao) it.push("<li>" + L.autorizacao + "</li>");
    if (L.moradaCompleta) it.push("<li>" + L.moradaCompleta + "</li>");
    if (L.moradaCompleta === "" && C.contactos.morada) it.push("<li>" + C.contactos.morada + "</li>");
    if (it.length) fi.innerHTML = it.join("");
  }

  /* ---------- Medição de visitas (GoatCounter, sem cookies) ---------- */
  var gc = C.analytics && C.analytics.goatcounter;
  function track(name) { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: name, title: name, event: true }); }
  if (gc) {
    var s = document.createElement("script");
    s.async = true; s.src = "https://gc.zgo.at/count.js";
    s.setAttribute("data-goatcounter", "https://" + gc + ".goatcounter.com/count");
    document.head.appendChild(s);
    document.addEventListener("click", function (e) {
      var a = e.target.closest("a,button"); if (!a) return;
      if (a.id === "qWa" || a.id === "btnPedir") track("pedido-whatsapp-simulacao");
      else if (a.id === "mbarWa" || a.id === "waFloat" || a.id === "faqWa") track("contacto-whatsapp");
      else if (a.id === "btnPdf") track("simulacao-pdf");
      else if (a.id === "btnPlano") track("simulacao-plano");
    });
    var pf = $("#pedidoForm");
    if (pf) pf.addEventListener("submit", function () { track("pedido-formulario"); });
    if (qr) qr.addEventListener("change", function () { track("simulacao-rapida"); }, { once: true });
  }

  /* ---------- Números que contam ---------- */
  document.querySelectorAll(".hero__stats strong").forEach(function (el) {
    var m = el.textContent.match(/^(\d+)(.*)$/);
    if (!m || reduce) return;
    var end = +m[1], suf = m[2], t0 = null;
    if (end === 0) return;
    function step(ts) {
      if (!t0) t0 = ts;
      var k = Math.min(1, (ts - t0) / 1200);
      el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))) + suf;
      if (k < 1) requestAnimationFrame(step);
    }
    el.textContent = "0" + suf;
    requestAnimationFrame(step);
  });
})();
