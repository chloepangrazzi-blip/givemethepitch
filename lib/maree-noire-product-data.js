import { getMareeNoirePageData } from "./mareenoire-page";

export function getMareeNoireProductPageData() {
  const panel = getMareeNoirePageData();

  return {
    title: panel.title,
    slug: "maree-noire",
    status: "En vente",
    genres: ["Thriller fantastique"],
    format: panel.format,
    tagline: "Et bientot, plus personne ne pourra l'ignorer.",
    intro:
      "Marée Noire s'ouvre ici comme un dossier de vente complet : teaser, matière éditoriale, lecture SIGNAL et packs Stories dans une seule lecture.",
    teaser: panel.teaser,
    synopsisPdfHref: null,
    restitutionHref: null,
    contractHref: "/contrat",
    assets: [
      { label: "Teaser", detail: "Vidéo de présentation", ready: true },
      { label: "Moodboard", detail: "Univers visuel", ready: false },
      { label: "Bible", detail: "Document complet", ready: false },
      { label: "Synopsis pilote", detail: "Lecture PDF", ready: false },
    ],
    scoring: {
      phaseLabel: "Scoring SIGNAL",
      note:
        "Cette couche recevra les scores réels après campagne : score global, dimensions, taille d'échantillon, segmentation et verbatims sélectionnés.",
      cards: [
        { label: "Score global", value: "A venir", detail: "Désirabilité /100" },
        { label: "Hook", value: "A venir", detail: "Accroche" },
        { label: "Feel", value: "A venir", detail: "Emotion et univers" },
        { label: "Care", value: "A venir", detail: "Attachement" },
        { label: "Continue", value: "A venir", detail: "Envie de poursuivre" },
        { label: "Share", value: "A venir", detail: "Potentiel de recommandation" },
      ],
      sampleSize: "La taille de l'échantillon apparaitra ici après clôture de la campagne.",
      segmentation: ["Tranche d'âge", "Genre déclaré", "Habitudes de visionnage"],
      verbatims: [
        "Les verbatims les plus utiles pour la vente seront sélectionnés ici.",
        "La restitution complète pourra être lue dans le document final.",
      ],
    },
    packs: [
      {
        code: "starter",
        title: "Starter",
        price: "3 500 EUR",
        description: "Pitch + pre-bible (10 p.) + scoring SIGNAL inclus",
      },
      {
        code: "pro",
        title: "Pro",
        price: "6 500 EUR",
        description: "Pitch + bible + synopsis pilote + scoring SIGNAL inclus",
      },
      {
        code: "ultimate",
        title: "Ultimate",
        price: "10 000 EUR",
        description: "Pitch + bible + pilote + moodboard + scoring SIGNAL inclus",
      },
    ],
    dossier: panel.dossier,
  };
}
