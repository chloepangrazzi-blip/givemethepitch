export function getProducerPreferencesPageData() {
  return {
    title: "Préférences Producteur",
    intro:
      "Formulaire léger pour capter tes goûts sans bloquer l'accès au catalogue. Si tu ne le remplis pas tout de suite, GMTP pourra relancer plus tard.",
    genres: [
      "Thriller",
      "Fantastic thriller",
      "Dramédie",
      "Young Adult",
      "Horreur",
      "Uchronie",
      "Fantastique contemporain",
      "Thriller médical",
    ],
    formats: ["6 x 52 min", "8 x 52 min", "8 x 26 min", "30 x 26 min"],
    tones: ["Tendu", "Pop", "Auteur", "Émotionnel", "High concept", "Accessible"],
    intentOptions: [
      "Je cherche un projet à développer rapidement",
      "Je cherche une lecture plus large du catalogue",
      "Je cherche surtout à suivre les prochaines mises en vente",
    ],
    backHref: "/catalogue",
  };
}
