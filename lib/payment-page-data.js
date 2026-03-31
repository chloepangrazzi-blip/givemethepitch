import { getMareeNoireProductPageData } from "./maree-noire-product-data";

export function getPaymentPageData() {
  const project = getMareeNoireProductPageData();

  return {
    title: "Achat",
    subtitle: "Validation du pack et paiement",
    projectTitle: project.title,
    projectSlug: project.slug,
    projectFormat: project.format,
    projectGenres: project.genres,
    reference: "VT-MN-0001",
    intro:
      "Dernière étape avant confirmation. Le producteur retrouve ici le pack sélectionné, le prix, les informations de facturation et le mode de paiement choisi.",
    packs: project.packs,
    paymentMethods: [
      {
        code: "stripe",
        title: "Carte bancaire",
        detail: "Paiement Stripe",
        note: "Pour un paiement immédiat et une délivrance instantanée dès que le tunnel est branché.",
      },
      {
        code: "manual",
        title: "PayPal / virement",
        detail: "Traitement manuel",
        note: "Pour les paiements hors carte. La logique finale pourra distinguer PayPal et virement si besoin.",
      },
    ],
    billingFields: [
      { label: "Société", placeholder: "Nom de la société de production" },
      { label: "Nom du signataire", placeholder: "Nom et prénom" },
      { label: "Email de facturation", placeholder: "email@production.com" },
      { label: "Adresse", placeholder: "Adresse de facturation" },
      { label: "Ville", placeholder: "Ville" },
      { label: "Code postal", placeholder: "Code postal" },
      { label: "Pays", placeholder: "Pays" },
      { label: "Numéro de TVA", placeholder: "TVA intracommunautaire si applicable" },
    ],
    checklist: [
      "Le pack affiché correspond bien à ton choix",
      "Le prix affiché correspond bien au contrat",
      "Les informations de facturation sont correctes",
      "Le mode de paiement est bien celui souhaité",
    ],
    notes: [
      "Pour l'instant, la page prépare l'expérience et le branchement. Le vrai déclenchement Stripe / PayPal n'est pas encore branché côté backend.",
      "Une fois le paiement branché, la confirmation devra déclencher contrat signé, facture et livraison des éléments du pack.",
    ],
    backHref: "/contrat",
    nextHref: "/confirmation",
  };
}
