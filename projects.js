const projects = [
  {
    id: "tcc-yolo",
    nameKey: "Sistema de Vigilância com IA (TCC)",
    nameEnKey: "AI Surveillance System (Thesis)",
    descPt: "Detecção automática de armas e disfarces em vídeo, comparando YOLOv8, YOLOv9 e YOLOv10 no mesmo dataset, com pipeline de data augmentation e treinamento reprodutível via Google Colab.",
    descEn: "Automatic detection of weapons and disguises in video, comparing YOLOv8, YOLOv9 and YOLOv10 on the same dataset, with a data augmentation pipeline and reproducible training via Google Colab.",
    tags: ["Python", "YOLOv8/v9/v10", "OpenCV", "Ultralytics"],
    link: "https://github.com/eltonbarbosaa/tcc-yolo",
    highlight: true,
  },
  {
    id: "portal_gim",
    nameKey: "Portal GIM",
    nameEnKey: "Portal GIM",
    descPt: "Sistema de gestão de solicitação de material, RH, contratadas e almoxarifado, construído em PHP e MySQL para automatizar processos internos de planejamento e controle.",
    descEn: "Management system for material requests, HR, contractors and warehouse, built in PHP and MySQL to automate internal planning and control processes.",
    tags: ["PHP", "MySQL", "Sistema de Gestão"],
    link: "https://github.com/eltonbarbosaa/portal_gim",
    highlight: false,
  },
  {
    id: "mundo-de-wumpus",
    nameKey: "Mundo de Wumpus",
    nameEnKey: "Wumpus World",
    descPt: "Agente inteligente clássico da IA simbólica, implementado para a disciplina de Inteligência Computacional na UFPA/Tucuruí.",
    descEn: "Classic symbolic AI intelligent agent, implemented for the Computational Intelligence course at UFPA/Tucuruí.",
    tags: ["Python", "Inteligência Artificial"],
    link: "https://github.com/eltonbarbosaa/Mundo-de-Wumpus",
    highlight: false,
  },
  {
    id: "spotify-react",
    nameKey: "Spotify Clone",
    nameEnKey: "Spotify Clone",
    descPt: "Interface inspirada no Spotify construída em React, com foco em prática de componentização e estilização.",
    descEn: "Spotify-inspired interface built in React, focused on practicing componentization and styling.",
    tags: ["React", "JavaScript", "CSS"],
    link: "https://github.com/eltonbarbosaa/spotify-react",
    highlight: false,
  },
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = projects;
}
