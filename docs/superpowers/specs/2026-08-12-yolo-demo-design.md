# Demo de detecção de objetos (YOLOv8) no navegador — design

Data: 2026-08-12

## Objetivo

Dar ao portfólio uma demo interativa e ao vivo do modelo YOLOv8 treinado no
TCC (`tcc-yolo`), permitindo que visitantes façam upload de uma imagem e
vejam, na hora, as detecções de **casco**, **gorro** e **pistola** desenhadas
sobre ela — sem servidor, sem custo de hospedagem adicional, e sem que a
imagem do visitante saia do navegador dele.

## Contexto técnico validado

- Pesos originais: `tcc-yolo/models/yolov8/best.pt` (6.2 MB), YOLOv8**n**
  (variante nano — confirmado pela contagem de canais iniciais do modelo).
- Exportado para ONNX (`opset 20`, `imgsz=640`, `simplify=True`): **11.7 MB**,
  shape de entrada `(1, 3, 640, 640)`, shape de saída `(1, 7, 8400)` — 4
  coordenadas de bounding box + 3 classes (sem canal de "objectness"
  separado, formato padrão do head do YOLOv8).
- Classes reais do modelo (confirmadas via `confusion_matrix.png` do
  repositório `tcc-yolo`): `casco`, `gorro`, `pistola`.
- Exportação testada localmente com `ultralytics` + `onnx` + `onnxslim`,
  sucesso em ~9s, sem erros.

## Arquitetura

Página estática nova em `demos/yolo/` dentro do repositório
`eltonbarbosaa.github.io` (mesmo repo do portfólio). Nenhum backend: a
inferência roda inteiramente no navegador do visitante via
**onnxruntime-web** (WebAssembly), carregado por CDN — mesmo padrão já usado
para o Google Fonts (sem build step, sem npm).

**Por que onnxruntime-web** (em vez de TensorFlow.js ou um backend Python):
é o caminho oficial e mais direto para modelos exportados do Ultralytics;
mantém o site 100% estático, consistente com o resto do portfólio (spec de
2026-08-11); e garante que a imagem do visitante nunca deixa o navegador
dele — um argumento de privacidade real, destacado na própria página.

## Componentes

### `demos/yolo/index.html`

- Dropzone/input de upload de imagem
- `<canvas>` mostrando a imagem com as caixas desenhadas por cima
- Painel de resultados: lista de detecções (classe + % de confiança)
- Nota de privacidade ("processado localmente no seu navegador — nenhuma
  imagem é enviada a um servidor")
- Link "voltar ao portfólio"
- Reaproveita `styles.css` do site (mesmas variáveis de tema/cor) mais um
  bloco de CSS próprio para o layout específico da demo (dropzone, canvas,
  painel de resultados)

### `demos/yolo/model.onnx`

Pesos exportados (11.7 MB), servidos estaticamente pelo GitHub Pages,
baixados uma vez pelo navegador e cacheados.

### `demos/yolo/detect.js`

Toda a lógica de inferência:

1. Carrega o modelo uma única vez com `onnxruntime-web`
   (`ort.InferenceSession.create`)
2. Ao receber uma imagem via upload: redimensiona com **letterbox** para
   640×640 (padding para manter a proporção original, do jeito que o
   YOLOv8 espera como entrada)
3. Roda a inferência (`session.run`)
4. Decodifica a saída bruta `(1, 7, 8400)`, filtra por um limiar de
   confiança, e aplica **NMS** (Non-Maximum Suppression) em JS puro para
   remover caixas duplicadas sobrepostas
5. Reprojeta as caixas da escala 640×640 de volta para a escala/posição da
   imagem original (desfazendo o letterbox)
6. Desenha as caixas + labels no canvas e popula a lista de resultados

### Integração com o i18n existente

Novas chaves em `i18n.js` (mesmo dicionário `pt`/`en` já usado no resto do
site) para: título da página, instrução de upload, nota de privacidade,
mensagem de "nenhuma detecção encontrada", estado de carregamento do
modelo, e os labels traduzidos das 3 classes (`casco`, `gorro`, `pistola`).

### Link a partir do portfólio principal

- `projects.js`: o objeto do projeto `tcc-yolo` ganha um campo novo
  `demoLink` (string, URL relativa `demos/yolo/`)
- `script.js` (`renderProjects`): quando um projeto tiver `demoLink`,
  renderiza um segundo botão "Ver demo ao vivo" / "Try live demo" ao lado
  do botão existente "Ver no GitHub"

## Tratamento de erros e estados

- **Carregando o modelo** (pode levar alguns segundos na primeira visita):
  indicador de loading visível, upload desabilitado até o modelo estar
  pronto
- **Navegador sem suporte a WebAssembly** (raro): mensagem de fallback
  amigável em vez de erro silencioso ou tela quebrada
- **Nenhuma detecção acima do limiar de confiança**: mensagem explícita
  ("nenhuma detecção encontrada nesta imagem") em vez de lista vazia sem
  contexto
- **Arquivo inválido** (não é imagem): validação no input, mensagem de erro
  clara

## Fora de escopo (YAGNI)

- Webcam / vídeo ao vivo — só upload de imagem estática (decisão do
  brainstorming: prioriza simplicidade e compatibilidade sobre "mais
  impressionante")
- Suporte a YOLOv9/YOLOv10 na demo — só o modelo YOLOv8 (o mesmo já usado
  como padrão no `detectar_video.py` do repositório `tcc-yolo`)
- Ajuste de limiar de confiança pelo usuário (fica fixo em 0.4 de
  confiança mínima e 0.45 de IoU para o NMS — valores padrão do
  Ultralytics)
- Testes automatizados / framework de testes — mesma filosofia do resto do
  site (verificação manual real via browser)

## Verificação

Sem framework de teste (consistente com o resto do site). Verificação
manual: rodar localmente com servidor estático simples, testar upload
usando imagens de exemplo do próprio dataset (as que já estão em
`results/yolov8/val_batch*.jpg` no repositório `tcc-yolo` mostram o que o
modelo deveria detectar — servem de gabarito visual), conferir que as
caixas desenhadas batem com as pré-anotadas, testar o toggle PT/EN, testar
responsivo mobile, e checar console do navegador sem erros.
