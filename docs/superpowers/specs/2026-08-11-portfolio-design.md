# Portfólio pessoal — design

Data: 2026-08-11

## Objetivo

Site pessoal de portfólio para Elton Barbosa, publicado em `eltonbarbosaa.github.io`,
reunindo experiência profissional, stack técnica e projetos reais (GitHub), com
conteúdo em português e inglês (toggle).

## Arquitetura

Site estático puro: `index.html` + `styles.css` + `script.js`, sem build step,
sem dependências de npm. Publicado via GitHub Pages a partir do repositório
`eltonbarbosaa/eltonbarbosaa.github.io` (nome exato exigido para *user page*,
servida na raiz do domínio). Push na branch `main` publica automaticamente
(GitHub Pages ativado nas configurações do repo — sem Actions custom).

## Estrutura de seções (ordem na página)

1. **Hero** — nome, título curto ("Desenvolvedor Full Stack | Engenharia de
   Planejamento"), botão de contato/CV, ícones de redes.
2. **Sobre** — texto curto reaproveitando a essência do README do GitHub
   (formação em Engenharia de Computação — UFPA, pós-graduações em
   Engenharia de Segurança do Trabalho e Engenharia de Produção & Gestão
   de Projetos, foco em dados/IA/dev).
3. **Experiência** — cards ou timeline simples com o cargo atual de
   Engenheiro de Planejamento (CLT), com nota sobre a atuação predominante
   em desenvolvimento no dia a dia.
4. **Stack** — badges/ícones agrupados por categoria (Dados & IA, Back-end,
   Front-end, Ferramentas), espelhando a organização já usada no README do
   GitHub.
5. **Projetos** — cards com repositórios reais:
   - `tcc-yolo` (destaque — TCC de visão computacional, YOLOv8/v9/v10)
   - `portal_gim` (descrição do problema de gestão resolvido, sem expor
     que é repositório privado/de cliente)
   - `Mundo-de-Wumpus` (projeto acadêmico de IA simbólica)
   - `spotify-react` (prática de front-end em React)
   Cada card: nome, descrição curta (PT/EN), tags de tecnologia, link para
   o repositório no GitHub.
6. **Contato** — Gmail, LinkedIn, Instagram, GitHub (mesmos links já usados
   no README do perfil GitHub).

## Estilo visual

Minimalista/dev: fundo escuro, tipografia com toque monoespaçado em
detalhes (títulos, tags de tecnologia), paleta neutra com uma accent color
única. Visual técnico e direto, sem elementos decorativos supérfluos.
Responsivo (mobile-first ou pelo menos totalmente funcional em telas
estreitas).

## Dados e comportamento

- **i18n**: objeto JS `i18n = { pt: {...}, en: {...} }`; elementos
  traduzíveis marcados com `data-i18n="chave"`; um botão de toggle troca o
  idioma sem reload, substituindo o texto dos elementos marcados. Idioma
  escolhido persiste em `localStorage`.
- **Projetos**: array JS separado (`projects.js`) com
  `{ nome, descricaoPt, descricaoEn, tags, link }` por item — adicionar um
  projeto novo no futuro é só adicionar um item ao array, sem tocar no
  HTML/CSS.
- **Contato**: sem formulário com backend (evita precisar de servidor) —
  botões abrem `mailto:`, LinkedIn, GitHub e Instagram diretamente em nova
  aba.

## Fora de escopo (YAGNI)

- Blog ou CMS.
- Formulário de contato com envio de e-mail via backend.
- Build tooling (bundlers, frameworks) — HTML/CSS/JS puro é suficiente para
  o volume de conteúdo previsto.
- Domínio próprio (usar o domínio gratuito `eltonbarbosaa.github.io` por
  enquanto; pode ser adicionado depois sem mudar a arquitetura).

## Testes / verificação

Verificação manual em navegador (desktop e mobile/responsivo), checando:
toggle de idioma funcionando em todas as seções, links de projetos e
contato corretos, sem erros no console.
