/* =========================================================
   CAPTA MICROCRÉDITO — CONFIGURAÇÃO DO SITE
   Edite apenas este ficheiro para mudar taxas, montantes,
   prazos e contactos. Os valores marcados com  ⚠️ EXEMPLO
   devem ser substituídos pelos valores reais da Capta.
   ========================================================= */
window.CAPTA = {
  empresa: "Capta Microcrédito, E.I.",
  slogan: "Empoderando o seu Potencial Financeiro",

  contactos: {
    whatsapp: "258840000000",          // ⚠️ EXEMPLO — só números, com 258
    telefones: ["+258 84 000 0000"],   // ⚠️ EXEMPLO
    email: "info@capta.co.mz",         // ⚠️ EXEMPLO
    morada: "Bairro da Liberdade, Matola, Moçambique",
    horario: "Seg – Sex: 08h00 – 17h00 · Sáb: 08h00 – 12h00",
    facebook: "#",
    instagram: "#",
    youtube: "#"
  },

  /* Produtos que aparecem no simulador.
     taxaMensal: juro por mês sobre o valor pedido (0.10 = 10%).
     prazos: número de meses disponíveis.                        */
  produtos: {
    negocio: {
      nome: "Crédito ao Negócio",
      min: 2000, max: 100000, passo: 1000, inicial: 15000,
      taxaMensal: 0.15,                // ⚠️ EXEMPLO
      prazos: [1, 2, 3]                // ⚠️ EXEMPLO
    },
    consumo: {
      nome: "Crédito Pessoal / Consumo",
      min: 2000, max: 75000, passo: 1000, inicial: 10000,
      taxaMensal: 0.15,                // ⚠️ EXEMPLO
      prazos: [1, 2, 3]                // ⚠️ EXEMPLO
    }
  },

  /* Frequência das prestações e quantas prestações há num mês */
  frequencias: {
    diaria:  { nome: "Diária",  porMes: 26 },  // dias úteis (seg–sáb)
    semanal: { nome: "Semanal", porMes: 4 },
    mensal:  { nome: "Mensal",  porMes: 1 }
  },

  /* Taxa de abertura de processo sobre o valor (0 = sem taxa) */
  taxaAbertura: 0,                       // ⚠️ EXEMPLO

  /* Formas de pagamento mostradas no topo do site */
  pagamentos: ["M-Pesa", "e-Mola", "mKesh", "Depósito bancário", "Numerário no balcão"],  // ⚠️ CONFIRMAR

  /* Medição de visitas (GoatCounter: grátis, sem cookies).
     Crie conta em goatcounter.com e escreva aqui o seu código, ex.: "capta" */
  analytics: { goatcounter: "" }
};
