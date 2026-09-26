# Capta Microcrédito — Website

Site institucional com simulador de crédito da **Capta Microcrédito, E.I.** — *Empoderando o seu Potencial Financeiro*.

## Como editar
| O quê | Onde |
|---|---|
| Taxas, montantes, prazos, frequências | `js/config.js` |
| WhatsApp, telefones, email, morada, redes sociais | `js/config.js` |
| Cores da marca | topo de `css/style.css` (variáveis `--primary`, `--accent`) |
| Logótipo | substituir `assets/logo.svg` e `assets/logo-branco.svg` |
| Textos | `index.html` |

No GitHub: abra o ficheiro → ícone do lápis (Edit) → altere → **Commit changes**. O site actualiza sozinho em 1–2 minutos.

## Fórmula do simulador
Juro simples mensal sobre o valor pedido:
`Total = Valor × (1 + taxa mensal × meses) + taxa de abertura`
`Prestação = Total ÷ número de prestações` (diária: 26/mês, semanal: 4/mês, mensal: 1/mês)

## Publicação
GitHub Pages, a partir do ramo `main` (pasta raiz).
