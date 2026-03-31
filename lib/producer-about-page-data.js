export function getProducerAboutPageData() {
  return {
    title: "About Producteur",
    eyebrow: "GMTP · Stories",
    headline: "Une entrée pensée pour lire, sentir, puis décider.",
    intro:
      "Stories te donne une lecture rapide mais sérieuse de projets déjà structurés, enrichis par SIGNAL, puis disponibles à la vente avec un cadre clair.",
    pillars: [
      {
        title: "Ce que tu trouves ici",
        text: "Un NDA rapide, un catalogue lisible, un projet détaillé, une restitution SIGNAL, puis un tunnel simple pour aller jusqu'à l'achat.",
      },
      {
        title: "Ce que SIGNAL apporte",
        text: "Un score clair, des verbatims choisis et une lecture segmentée pour soutenir la décision sans la remplacer.",
      },
      {
        title: "Ce que GMTP garde simple",
        text: "Un seul projet actif au départ, un seul tunnel, un seul cadre de lecture. Le reste s'ajoutera ensuite sans casser la structure.",
      },
    ],
    steps: [
      "Ouvrir le NDA",
      "Découvrir le catalogue",
      "Renseigner tes goûts si tu le souhaites",
      "Lire Marée Noire puis avancer jusqu'au contrat et au paiement",
    ],
    primaryHref: "/producteur/nda",
    secondaryHref: null,
  };
}
