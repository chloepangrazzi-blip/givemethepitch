function buildProject({
  id,
  title,
  genre,
  format,
  shortPitch,
  status,
  posterSrc,
  tabletPosterSrc = null,
  tone,
  featured = false,
  expandable = true,
  previewSize = "default",
  previewChars = null,
  href = null,
  stackTags = false,
}) {
  return {
    id,
    title,
    genre,
    format,
    shortPitch,
    status,
    posterSrc,
    tabletPosterSrc,
    tone,
    featured,
    expandable,
    previewSize,
    previewChars,
    href,
    stackTags,
    accessible: Boolean(href),
  };
}

function getBaseProjects() {
  return [
    buildProject({
      id: "maree-noire",
      title: "Marée Noire",
      genre: "Thriller fantastique",
      format: "6 × 52 min",
      shortPitch:
        "Huit ans après sa disparition, Noé réapparaît sur la côte, vivant. Il n'a pas vieilli. Où était-il pendant tout ce temps, et pourquoi revient-il maintenant ?",
      status: "En vente",
      posterSrc: "/catalogue-posters/maree-noire.png",
      tone: "mint",
      featured: true,
      expandable: false,
      href: "/catalogue/maree-noire",
    }),
    buildProject({
      id: "opium",
      title: "Opium",
      genre: "Uchronie",
      format: "6 × 52 min",
      shortPitch:
        "Aujourd’hui Mathilde fête ses 15 ans. Mathilde est une jeune fille comme les autres. Elle va à l’école, a des amis, une famille et prend, comme tout le monde, sa dose d’héroïne réglementaire, ce médicament inventé par Charles Rameley Adler Wright en 1874 qui rend les gens meilleurs. Dans un monde où la faim, la pauvreté, les guerres, la peur, la colère, les rêves et la passion n’existent plus, Mathilde mène une existence sans histoire jusqu’à ce qu’une larme vienne s’écraser sur son gâteau d’anniversaire, la première de toute sa vie...",
      status: "Coming soon",
      posterSrc: "/catalogue-posters/opium.png",
      tabletPosterSrc: "/catalogue-posters-tablet/opium.png",
      tone: "rose",
      previewSize: "tall",
    }),
    buildProject({
      id: "consentement-mutuel",
      title: "Consentement Mutuel",
      genre: "Dramédie",
      format: "8 × 26 min",
      shortPitch:
        "Marie et Eli, couple modèle depuis le lycée, divorcent parfaitement : d’un commun accord, sans drame, avec un code d’honneur en dix points. Sauf qu’à quarante ans, ils comprennent qu’il n’y a pas de mode d’emploi pour vivre l’un sans l’autre. Au fil d’une année, leurs certitudes se fissurent : solitude, jalousie, parentalité, identité. Et le divorce parfait se révèle beaucoup plus vivant que prévu.",
      status: "Coming soon",
      posterSrc: "/catalogue-posters/consentement-mutuel.png",
      tabletPosterSrc: "/catalogue-posters-tablet/consentement-mutuel.png",
      tone: "yellow",
      expandable: false,
      previewSize: "tall",
    }),
    buildProject({
      id: "kim",
      title: "Kim",
      genre: "Dramédie",
      format: "30 × 26 min",
      shortPitch:
        "Belge, drôle, trop franche, Kim débarque à Paris persuadée qu’elle va y faire du cinéma. C’est donc tout naturellement qu’elle atterrit à l’UGC pour y vendre du pop-corn. Elle y fait la rencontre de gars et de filles qui comme elle, enchaînent les CDD de galère en rêvant toujours plus grand. Quand Kim décroche enfin un vrai contrat pour être la doublure officielle d’une actrice ultra connue, elle croit enfin tenir son destin en main. C’est surtout le début d’un vertige : être partout… sans jamais être vue.",
      status: "Coming soon",
      posterSrc: "/catalogue-posters/kim.png",
      tabletPosterSrc: "/catalogue-posters-tablet/kim.png",
      tone: "rose",
      previewSize: "tall",
    }),
    buildProject({
      id: "les-mauvais-jours",
      title: "Les Mauvais Jours",
      genre: "Dramédie",
      format: "8 × 26 min",
      shortPitch:
        "Quatre amis d'enfance se retrouvent chaque jeudi soir dans le même bar depuis vingt ans. Même table, même commande, mêmes blagues. Ce qui a changé, les séparations, les deuils, les rêves qu'on n'a plus, on n'en parle pas. Jusqu'au soir où l'un d'eux annonce qu'il arrête de venir. Les trois autres réalisent qu'ils ne savent pas vraiment pourquoi ils continuent. Ni ce qu'ils se diraient s'ils n'avaient pas l'alcool pour faire semblant.",
      status: "Coming soon",
      posterSrc: "/catalogue-posters/les-mauvais-jours.png",
      tabletPosterSrc: "/catalogue-posters-tablet/les-mauvais-jours.png",
      tone: "yellow",
      stackTags: true,
    }),
    buildProject({
      id: "salle-7",
      title: "Salle 7",
      genre: "Thriller médical",
      format: "8 × 52 min",
      shortPitch:
        "Dans un hôpital public, une salle clandestine promet l’impossible : mettre fin à une addiction en 24 heures. Les patients ressortent sobres… mais chez chacun.e quelque chose s’est déplacé, comme si la cure avait pris plus que le manque. Quand une interne tombe sur la liste des prochains admis, son nom y figure, sans qu’elle n’ait jamais rien demandé.",
      status: "Coming soon",
      posterSrc: "/catalogue-posters/salle-7.png",
      tabletPosterSrc: "/catalogue-posters-tablet/salle-7.png",
      tone: "mint",
    }),
    buildProject({
      id: "3h17",
      title: "3H17",
      genre: "Fantastique",
      format: "8 × 52 min",
      shortPitch:
        "Chaque nuit à 3h17, une heure disparaît de la mémoire collective. À 4h17, le temps s’écoule de nouveau normalement : soixante minutes se sont évaporées, alors que le monde a continué de tourner. Jusqu’au jour où Malik, veilleur de nuit, commence à sortir du black-out.",
      status: "Coming soon",
      posterSrc: "/catalogue-posters/3h17.png",
      tabletPosterSrc: "/catalogue-posters-tablet/3h17.png",
      tone: "mint",
      previewChars: 160,
    }),
    buildProject({
      id: "resurex",
      title: "Résurex",
      genre: "Fantastique urbain",
      format: "8 × 52 min",
      shortPitch:
        "Vick Nielsen, une jeune réalisatrice sulfureuse, disparaît mystérieusement après avoir déposé une boîte de cassettes à numériser dans une boutique-bazar du 10ème arrondissement de Paris, au cœur du quartier pakistanais. Au fur-et-à mesure du visionnage des films à numériser, Mona, la personne chargée des transferts se rend compte qu’elle partage avec la disparue des instants de vie. Elle apparaît même dans certaines vidéos. Troublée, Mona décide de se lancer à la recherche de Vick. Au cours de son investigation, Mona tombe enceinte de façon inexpliquée.",
      status: "Coming soon",
      posterSrc: "/catalogue-posters/resurex.png",
      tabletPosterSrc: "/catalogue-posters-tablet/resurex.png",
      tone: "rose",
    }),
    buildProject({
      id: "bienvenue",
      title: "Bienvenue",
      genre: "Horreur sociale",
      format: "6 × 52 min",
      shortPitch:
        "Un couple emménage dans une résidence neuve, parfaite, trop parfaite. Les voisins sont charmants, serviables, toujours disponibles. Au bout de six semaines, ils comprennent pourquoi personne ne repart jamais.",
      status: "Coming soon",
      posterSrc: "/catalogue-posters/bienvenue.png",
      tabletPosterSrc: "/catalogue-posters-tablet/bienvenue.png",
      tone: "yellow",
    }),
    buildProject({
      id: "heritage",
      title: "Héritage",
      genre: "Horreur domestique",
      format: "6 × 52 min",
      shortPitch:
        "Une femme hérite de l’appartement du dessus, celui de sa mère, morte seule. En triant ses affaires, elle découvre que sa mère la surveillait. Depuis des années. Et qu’elle n’était pas la seule à le faire.",
      status: "Coming soon",
      posterSrc: "/catalogue-posters/heritage.png",
      tabletPosterSrc: "/catalogue-posters-tablet/heritage.png",
      tone: "yellow",
    }),
    buildProject({
      id: "peau-neuve",
      title: "Peau Neuve",
      genre: "Comédie body-horror",
      format: "8 × 30 min",
      shortPitch:
        "Depuis que son corps a décidé de signaler chaque mensonge par une déformation cutanée progressive et franchement répugnante, Sarah fait des efforts. Au début c'est pratique, elle arrête de mentir. Puis ça devient catastrophique : sans mensonges, sa vie sociale est ingérable. Son meilleur ami décide de l'aider en gérant ses mensonges à sa place. Sauf qu'à force, c'est lui qui se déforme.",
      status: "Coming soon",
      posterSrc: "/catalogue-posters/peau-neuve.png",
      tabletPosterSrc: "/catalogue-posters-tablet/peau-neuve.png",
      tone: "rose",
      previewChars: 155,
    }),
    buildProject({
      id: "hors-signal",
      title: "Hors Signal",
      genre: "Young Adult",
      format: "8 × 26 min",
      shortPitch:
        "Cinq lycéens partent une semaine dans un chalet sans réseau pour décrocher. Le premier soir, ils trouvent un téléphone dans la forêt. Batterie pleine. Aucune appli. Juste une galerie remplie de photos d’eux. Datées du jour même.",
      status: "Coming soon",
      posterSrc: "/catalogue-posters/hors-signal.png",
      tabletPosterSrc: "/catalogue-posters-tablet/hors-signal.png",
      tone: "mint",
    }),
    buildProject({
      id: "open-mic",
      title: "Open Mic",
      genre: "Young Adult (comédie)",
      format: "8 × 26 min",
      shortPitch:
        "Trois amis lancent un podcast lycéen pour “changer le monde”. Il fait 12 auditeurs. Jusqu’au jour où l’épisode qu’ils n’auraient jamais dû publier devient viral. Maintenant tout le monde les écoute. Y compris le proviseur, l'ex de Léa, et apparemment le père de Thomas qui “ne sait même pas ce qu'est un podcast”.",
      status: "Coming soon",
      posterSrc: "/catalogue-posters/open-mic.png",
      tabletPosterSrc: "/catalogue-posters-tablet/open-mic.png",
      tone: "mint",
    }),
    buildProject({
      id: "kilometre-zero",
      title: "Kilomètre Zéro",
      genre: "Survival thriller",
      format: "6 × 52 min",
      shortPitch:
        "Douze candidats participent à une téléréalité survivaliste version extrême, au cœur de la forêt boréale finlandaise. Au jour 11, ils comprennent que quelque chose tourne hors programme et que la production ne contrôle plus rien.",
      status: "Coming soon",
      posterSrc: "/catalogue-posters/kilometre-zero.png",
      tabletPosterSrc: "/catalogue-posters-tablet/kilometre-zero.png",
      tone: "yellow",
    }),
  ];
}

export function getCataloguePageData(mode = "stories") {
  const baseProjects = getBaseProjects();

  if (mode === "signal") {
    return {
      eyebrow: null,
      headerBadge: null,
      title: "Catalogue",
      featuredStatusPlacement: "top",
      preferencesHref: null,
      projects: baseProjects.map((project) => {
        if (project.id === "maree-noire") {
          return {
            ...project,
            status: "À tester",
            href: "/mareenoire",
          };
        }

        return project;
      }),
    };
  }

  return {
    eyebrow: null,
    title: "Catalogue",
    featuredStatusPlacement: "top",
    preferencesHref: "/producteur/preferences",
    projects: baseProjects,
  };
}
