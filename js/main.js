(function () {
  "use strict";
  var C = window.CAPTA;
  var $ = function (s) { return document.querySelector(s); };

  /* ---------- Utilitários ---------- */
  var fmt = new Intl.NumberFormat("pt-PT", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  var fmt2 = new Intl.NumberFormat("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function mt(v) {
    v = Math.round(v * 100) / 100;
    return (v % 1 === 0 ? fmt.format(v) : fmt2.format(v)).replace(/[  ]/g, " ") + " MT";
  }
  function pct(v) { return fmt.format(v * 100) + "%"; }
  function waLink(msg) {
    return "https://wa.me/" + C.contactos.whatsapp + (msg ? "?text=" + encodeURIComponent(msg) : "");
  }

  /* ---------- Menu móvel ---------- */
  var toggle = $(".menu-toggle"), nav = $(".nav");
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", false); }
  });

  /* ---------- Contactos ---------- */
  var ct = C.contactos, fc = $("#footerContactos"), items = [];
  ct.telefones.forEach(function (t) { items.push('<li><a href="tel:' + t.replace(/\s/g, "") + '">📞 ' + t + "</a></li>"); });
  items.push('<li><a href="' + waLink("Olá Capta! Gostaria de saber mais sobre o microcrédito.") + '" target="_blank" rel="noopener">💬 WhatsApp</a></li>');
  items.push('<li><a href="mailto:' + ct.email + '">✉️ ' + ct.email + "</a></li>");
  items.push("<li>📍 " + ct.morada + "</li>");
  items.push("<li>🕒 " + ct.horario + "</li>");
  fc.innerHTML = items.join("");
  $("#waFloat").href = waLink("Olá Capta! Gostaria de saber mais sobre o microcrédito.");
  $("#lnkFacebook").href = ct.facebook; $("#lnkInstagram").href = ct.instagram; $("#lnkYoutube").href = ct.youtube;
  $("#ano").textContent = new Date().getFullYear();

  /* ---------- Simulador ---------- */
  var st = { produto: "negocio", valor: null, prazo: null, freq: "semanal" };
  var range = $("#simValor");

  function buildSeg(el, entries, key) {
    el.innerHTML = "";
    entries.forEach(function (e) {
      var b = document.createElement("button");
      b.type = "button"; b.textContent = e.label; b.dataset.v = e.value;
      b.setAttribute("aria-pressed", String(st[key]) === String(e.value));
      b.addEventListener("click", function () {
        st[key] = key === "prazo" ? Number(e.value) : e.value;
        if (key === "produto") { setProduto(e.value); calc(); return; }
        el.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
        calc();
      });
      el.appendChild(b);
    });
  }

  function setProduto(key) {
    var p = C.produtos[key];
    st.produto = key;
    range.min = p.min; range.max = p.max; range.step = p.passo;
    if (st.valor === null || st.valor < p.min || st.valor > p.max) st.valor = p.inicial;
    range.value = st.valor;
    $("#simMin").textContent = mt(p.min); $("#simMax").textContent = mt(p.max);
    if (p.prazos.indexOf(st.prazo) < 0) st.prazo = p.prazos[0];
    buildSeg($("#simPrazo"), p.prazos.map(function (m) { return { value: m, label: m + (m === 1 ? " mês" : " meses") }; }), "prazo");
    buildSeg($("#simProduto"), Object.keys(C.produtos).map(function (k) { return { value: k, label: C.produtos[k].nome }; }), "produto");
  }

  function simular() {
    var p = C.produtos[st.produto], f = C.frequencias[st.freq];
    var juros = st.valor * p.taxaMensal * st.prazo;
    var abertura = st.valor * (C.taxaAbertura || 0);
    var total = st.valor + juros + abertura;
    var n = Math.max(1, Math.round(f.porMes * st.prazo));
    var prest = Math.ceil((total / n) * 100) / 100;
    return { p: p, f: f, juros: juros, abertura: abertura, total: total, n: n, prest: prest };
  }

  function calc() {
    st.valor = Number(range.value);
    var r = simular();
    $("#simValorOut").textContent = mt(st.valor);
    $("#resPrestLabel").textContent = "Prestação " + r.f.nome.toLowerCase();
    $("#resPrest").textContent = mt(r.prest);
    $("#resValor").textContent = mt(st.valor);
    $("#resTaxa").textContent = pct(r.p.taxaMensal) + "/mês";
    $("#resJuros").textContent = mt(r.juros);
    $("#resAberturaRow").hidden = !C.taxaAbertura;
    $("#resAbertura").textContent = mt(r.abertura);
    $("#resN").textContent = r.n;
    $("#resTotal").textContent = mt(r.total);
    // formulário de pedido acompanha a simulação
    $("#pedidoProduto").value = st.produto;
    $("#pedidoValor").value = st.valor;
    $("#pedidoPrazo").value = st.prazo + (st.prazo === 1 ? " mês" : " meses") + " · pagamento " + r.f.nome.toLowerCase();
    if (!$("#plano").hidden) renderPlano();
  }

  function datas(n) {
    var out = [], d = new Date();
    for (var i = 0; i < n; i++) {
      if (st.freq === "diaria") { do { d.setDate(d.getDate() + 1); } while (d.getDay() === 0); }
      else if (st.freq === "semanal") d.setDate(d.getDate() + 7);
      else d.setMonth(d.getMonth() + 1);
      out.push(new Date(d));
    }
    return out;
  }

  function linhasPlano() {
    var r = simular(), ds = datas(r.n), saldo = r.total, rows = [];
    for (var i = 0; i < r.n; i++) {
      var v = i === r.n - 1 ? saldo : Math.min(r.prest, saldo);
      saldo = Math.max(0, saldo - v);
      rows.push([i + 1, ds[i].toLocaleDateString("pt-PT"), mt(v), mt(saldo)]);
    }
    return { r: r, rows: rows };
  }

  function renderPlano() {
    var d = linhasPlano();
    $("#planoResumo").textContent = d.r.p.nome + " · " + mt(st.valor) + " · " + st.prazo + (st.prazo === 1 ? " mês" : " meses") +
      " · " + d.r.n + " prestações " + d.r.f.nome.toLowerCase() + "s · Total " + mt(d.r.total);
    $("#planoBody").innerHTML = d.rows.map(function (r) { return "<tr><td>" + r.join("</td><td>") + "</td></tr>"; }).join("");
  }

  $("#btnPlano").addEventListener("click", function () {
    var pl = $("#plano");
    pl.hidden = !pl.hidden;
    this.textContent = pl.hidden ? "Ver Plano" : "Esconder Plano";
    if (!pl.hidden) { renderPlano(); pl.scrollIntoView({ behavior: "smooth", block: "start" }); }
  });

  $("#btnPdf").addEventListener("click", function () {
    var d = linhasPlano(), area = $("#printArea");
    if (!area) { area = document.createElement("div"); area.id = "printArea"; document.body.appendChild(area); }
    area.innerHTML =
      "<h1>Capta Microcrédito — Simulação de crédito</h1>" +
      "<p>" + C.slogan + "</p>" +
      '<table class="p-sum"><tr><td>Produto</td><td>' + d.r.p.nome + "</td></tr>" +
      "<tr><td>Valor pedido</td><td>" + mt(st.valor) + "</td></tr>" +
      "<tr><td>Taxa de juro</td><td>" + pct(d.r.p.taxaMensal) + " ao mês</td></tr>" +
      "<tr><td>Prazo</td><td>" + st.prazo + (st.prazo === 1 ? " mês" : " meses") + "</td></tr>" +
      "<tr><td>Prestação " + d.r.f.nome.toLowerCase() + "</td><td>" + mt(d.r.prest) + " × " + d.r.n + "</td></tr>" +
      "<tr><td><b>Total a reembolsar</b></td><td><b>" + mt(d.r.total) + "</b></td></tr></table>" +
      "<h3 style='margin-top:18px'>Plano de pagamento</h3>" +
      "<table><thead><tr><th>Nº</th><th>Data prevista</th><th>Prestação</th><th>Saldo</th></tr></thead><tbody>" +
      d.rows.map(function (r) { return "<tr><td>" + r.join("</td><td>") + "</td></tr>"; }).join("") +
      "</tbody></table><p style='margin-top:16px;font-size:12px'>Simulação indicativa emitida em " + new Date().toLocaleDateString("pt-PT") +
      ". Os valores finais dependem da análise e aprovação do pedido. " + C.contactos.telefones.join(" / ") + " · " + C.contactos.email + "</p>";
    window.print();
  });

  range.addEventListener("input", calc);
  buildSeg($("#simFreq"), Object.keys(C.frequencias).map(function (k) { return { value: k, label: C.frequencias[k].nome }; }), "freq");

  // opções de produto no formulário
  $("#pedidoProduto").innerHTML = Object.keys(C.produtos).map(function (k) {
    return '<option value="' + k + '">' + C.produtos[k].nome + "</option>";
  }).join("");

  // botões "Simular este crédito"
  document.querySelectorAll("[data-produto]").forEach(function (a) {
    a.addEventListener("click", function () {
      setProduto(a.dataset.produto); calc();
    });
  });

  setProduto(st.produto);
  calc();

  // exemplo no hero
  (function () {
    var p = C.produtos.negocio, f = C.frequencias.diaria;
    var total = p.inicial * (1 + p.taxaMensal * 1), n = f.porMes;
    $("#heroExemplo").textContent = mt(Math.ceil(total / n)) + "/dia";
    $("#heroExemploNota").textContent = "Para " + mt(p.inicial) + " em 1 mês, pagamento diário";
  })();

  /* ---------- Pedido via WhatsApp ---------- */
  $("#pedidoForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target, ok = true;
    ["nome", "telefone", "bi", "bairro", "actividade", "valor"].forEach(function (n) {
      var el = f.elements[n], bad = !el.value.trim();
      el.classList.toggle("invalid", bad); if (bad) ok = false;
    });
    if (!f.elements.consent.checked) ok = false;
    $("#pedidoErro").hidden = ok;
    if (!ok) return;
    var prodNome = C.produtos[f.elements.produto.value].nome;
    var msg = "Olá Capta! Quero fazer um pedido de crédito.\n\n" +
      "Nome: " + f.elements.nome.value.trim() + "\n" +
      "Telefone: " + f.elements.telefone.value.trim() + "\n" +
      "BI: " + f.elements.bi.value.trim() + "\n" +
      "Bairro: " + f.elements.bairro.value.trim() + "\n" +
      "Actividade: " + f.elements.actividade.value.trim() + "\n" +
      "Produto: " + prodNome + "\n" +
      "Valor: " + f.elements.valor.value.trim() + " MT\n" +
      "Prazo: " + f.elements.prazo.value;
    window.open(waLink(msg), "_blank", "noopener");
  });
})();
