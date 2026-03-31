import { getMareeNoireProductPageData } from "./maree-noire-product-data";

export function getConfirmationPageData() {
  const project = getMareeNoireProductPageData();

  return {
    title: "Confirmation d'achat",
    subtitle: "Le projet est réservé et les documents partent ensuite automatiquement.",
    projectTitle: project.title,
    projectSlug: project.slug,
    projectFormat: project.format,
    projectGenres: project.genres,
    reference: "VT-MN-0001",
    intro:
      "Page de sortie claire après paiement. Elle doit rassurer, récapituler l'achat, confirmer le pack retenu et rappeler les éléments qui seront remis au producteur.",
    packs: project.packs,
    milestones: [
      {
        label: "Achat confirmé",
        detail: "Le paiement du pack est bien pris en compte.",
      },
      {
        label: "Contrat préparé",
        detail: "La version signée du contrat est jointe ou envoyée automatiquement.",
      },
      {
        label: "Facture générée",
        detail: "La facture correspondante est transmise au bon contact de facturation.",
      },
      {
        label: "Éléments livrés",
        detail: "Les documents liés au pack retenu deviennent disponibles immédiatement après validation du tunnel complet.",
      },
    ],
    deliveryNotes: [
      "Le teaser et le dossier projet restent rattachés à Marée Noire.",
      "Le contenu livré dépend strictement du pack sélectionné.",
      "La restitution SIGNAL complète accompagne la vente Stories.",
    ],
    infoCards: [
      {
        title: "Ce que le producteur doit voir ici",
        text: "Une sortie simple, élégante, sans ambiguïté : l'achat est bien confirmé, le bon pack a été enregistré et les documents vont suivre.",
      },
      {
        title: "Ce que GMTP doit déclencher ensuite",
        text: "Contrat signé, facture, email de confirmation, accès aux éléments du pack et log des événements.",
      },
    ],
    backHref: "/achat",
    catalogueHref: "/catalogue",
    projectHref: `/catalogue/${project.slug}`,
  };
}
