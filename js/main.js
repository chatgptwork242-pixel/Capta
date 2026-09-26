(function () {
  "use strict";
  var C = window.CAPTA;
  var $ = function (s) { return document.querySelector(s); };

  /* ---------- Utilitários ---------- */
  var fmt = new Intl.NumberFormat("pt-PT", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  var fmt2 = new Intl.NumberFormat("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function mt(v) {
    v = Math.round(v * 100) / 100;
    var s = (v % 1 === 0 ? v.toFixed(0) : v.toFixed(2)).split(".");
    s[0] = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return s.join(",") + " MT";
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
    var rc = $("#resCusto"); if (rc) rc.textContent = mt(r.juros + r.abertura) + " (" + pct((r.juros + r.abertura) / st.valor) + " do valor)";
    var ca = $("#calcAbertura"); if (ca) ca.hidden = !C.taxaAbertura;
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
    var d = linhasPlano(), r = d.r, now = new Date(), area = $("#printArea");
    if (!area) { area = document.createElement("div"); area.id = "printArea"; document.body.appendChild(area); }
    var pad = function (x) { return (x < 10 ? "0" : "") + x; };
    var ref = "SIM-" + now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate()) + "-" + pad(now.getHours()) + pad(now.getMinutes());
    var prazoTxt = st.prazo + (st.prazo === 1 ? " mês" : " meses");
    // plano em colunas para caber numa folha
    var cols = Math.min(4, Math.max(1, Math.ceil(r.n / 26))), per = Math.ceil(r.n / cols), blocks = "";
    for (var c = 0; c < cols; c++) {
      var part = d.rows.slice(c * per, (c + 1) * per);
      if (!part.length) continue;
      blocks += "<table><thead><tr><th>Nº</th><th>Data</th><th>Prestação</th><th>Saldo</th></tr></thead><tbody>" +
        part.map(function (x) { return "<tr><td>" + x.join("</td><td>") + "</td></tr>"; }).join("") + "</tbody></table>";
    }
    var cell = function (k, v) { return "<div><span>" + k + "</span><b>" + v + "</b></div>"; };
    area.innerHTML =
      '<div class="pdf' + (cols >= 3 ? " pdf--dense" : "") + '">' +
      '<header class="pdf__head"><img src="assets/logo.png" alt="Capta Microcrédito">' +
      '<div class="pdf__meta"><b>Simulação de crédito</b>Ref. ' + ref + " · Emitida em " + now.toLocaleDateString("pt-PT") + "</div></header>" +
      '<section class="pdf__hero"><div class="pdf__main"><p>Prestação ' + r.f.nome.toLowerCase() + "</p><strong>" + mt(r.prest) + "</strong><p>" +
      r.n + " prestações · " + prazoTxt + '</p></div><div class="pdf__total"><p>Total a reembolsar</p><strong>' + mt(r.total) + "</strong><p>" +
      mt(st.valor) + " + " + mt(r.juros + r.abertura) + " de encargos</p></div></section>" +
      '<section class="pdf__grid">' +
      cell("Produto", r.p.nome) + cell("Valor pedido", mt(st.valor)) + cell("Taxa de juro", pct(r.p.taxaMensal) + " ao mês") +
      cell("Prazo", prazoTxt) + cell("Pagamento", r.f.nome) + cell(C.taxaAbertura ? "Juros + abertura" : "Total de juros", mt(r.juros + r.abertura)) +
      "</section>" +
      "<h2>Plano de pagamento</h2>" +
      '<div class="pdf__plan" style="grid-template-columns:repeat(' + cols + ',1fr)">' + blocks + "</div>" +
      '<section class="pdf__next">' +
      "<div><b>1. Fale connosco</b>WhatsApp " + (C.contactos.telefones[0] || "") + "</div>" +
      "<div><b>2. Traga os documentos</b>BI, comprovativo de residência e dados do negócio ou rendimento.</div>" +
      "<div><b>3. Resposta em 24h</b>Após a entrega dos documentos, em horas úteis.</div></section>" +
      '<footer class="pdf__foot"><span>Simulação indicativa, sem valor contratual. As condições finais dependem da análise e aprovação do pedido. ' +
      C.empresa + " · " + C.contactos.morada + " · " + C.contactos.email + "</span><em>" + C.slogan + "</em></footer></div>";
    var t = document.title;
    document.title = "Simulacao-Capta-" + ref;
    var img = area.querySelector("img"), go = function () {
      window.print();
      setTimeout(function () { document.title = t; }, 500);
    };
    if (img.complete) go(); else { img.onload = go; img.onerror = go; }
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
  if ($("#heroExemplo")) (function () {
    var p = C.produtos.negocio, f = C.frequencias.diaria;
    var total = p.inicial * (1 + p.taxaMensal * 1), n = f.porMes;
    $("#heroExemplo").textContent = mt(Math.ceil(total / n)) + "/dia";
    $("#heroExemploNota").textContent = "Para " + mt(p.inicial) + " em 1 mês, pagamento diário";
  })();

  /* ---------- Pedido via WhatsApp ---------- */
  $("#pedidoForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target, ok = true;
    ["nome", "telefone", "bairro", "actividade", "valor"].forEach(function (n) {
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
      (f.elements.bi.value.trim() ? "BI: " + f.elements.bi.value.trim() + "\n" : "") +
      "Bairro: " + f.elements.bairro.value.trim() + "\n" +
      "Actividade: " + f.elements.actividade.value.trim() + "\n" +
      "Produto: " + prodNome + "\n" +
      "Valor: " + f.elements.valor.value.trim() + " MT\n" +
      "Prazo: " + f.elements.prazo.value;
    window.open(waLink(msg), "_blank", "noopener");
  });
})();
