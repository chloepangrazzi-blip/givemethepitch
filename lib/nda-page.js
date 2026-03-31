export function getNdaPageData() {
  return {
    title: "NDA | Give Me The Pitch",
    heading: "NDA",
    metaLines: [
      "Accord de confidentialité",
      "Give Me The Pitch × The Room",
      "Durée : 10 ans",
    ],
    parties: [
      {
        name: "Give Me The Pitch",
        detail: "SASU - ci-après « GMTP »",
      },
      {
        name: "Le Destinataire",
        detail: "La personne dont l'identité est renseignée ci-dessous, ayant reçu un accès à une session The Room.",
      },
    ],
    articles: [
      {
        number: "Article 1",
        title: "Objet",
        text:
          "GMTP donne au Destinataire un accès strictement limité à un projet STORIES, aux seules fins de lecture et d'évaluation dans le cadre d'une session The Room. L'accès est conditionné à l'acceptation intégrale du présent accord.",
      },
      {
        number: "Article 2",
        title: "Informations confidentielles",
        text: "Sont considérées comme confidentielles :",
        list: [
          "Tout contenu relatif au projet consulté : documents, textes, visuels, notes, scoring, versions et extraits.",
          "Les modalités d'accès : liens privés, identifiants, mots de passe, codes, filigranes et journaux de connexion.",
          "Toute information non publique relative à GMTP : méthodes, processus, protocoles, grilles, scoring, outils et informations stratégiques.",
          "Le fait même d'avoir eu accès au projet, son identité, les dates et durées de consultation.",
        ],
        afterText:
          "Les Informations Confidentielles restent la propriété exclusive de GMTP. Le présent accord n'opère aucun transfert de droits.",
      },
      {
        number: "Article 3",
        title: "Obligations du Destinataire",
        text:
          "Le Destinataire s'engage à conserver strictement confidentielles les Informations Confidentielles et à ne les utiliser que pour l'objet du présent accord. Il s'interdit notamment :",
        list: [
          "Capturer, enregistrer, filmer ou photographier l'écran.",
          "Copier, reproduire, télécharger, extraire, stocker, diffuser ou partager tout ou partie des contenus consultés.",
          "Partager les accès, liens, identifiants ou mots de passe, ou permettre l'accès à un tiers.",
          "Divulguer, publier ou communiquer à quiconque le projet, les documents consultés, ou l'existence et les méthodes de SIGNAL.",
        ],
      },
      {
        number: "Article 4",
        title: "Non-exploitation et non-contournement",
        text:
          "Le Destinataire s'interdit toute exploitation directe ou indirecte des Informations Confidentielles, incluant adaptation, production, dépôt, commercialisation, ou utilisation dans un projet concurrent. Le présent accord n'accorde aucune option, cession ou licence d'exploitation sur le projet.",
      },
      {
        number: "Article 5",
        title: "Protection des méthodes SIGNAL",
        text:
          "Le Destinataire reconnaît que les méthodes, processus, protocoles, grilles et outils de GMTP, incluant <strong>SIGNAL</strong>, constituent un savoir-faire protégé. Il s'interdit de reproduire, imiter ou commercialiser tout outil ou service substantiellement similaire. Toute violation pourra être qualifiée d'acte de concurrence déloyale ou de parasitisme.",
      },
      {
        number: "Article 6",
        title: "Durée",
        text:
          "Le présent accord entre en vigueur à la date de signature. Les obligations de confidentialité, de non-exploitation et de non-reproduction s'appliquent pendant <strong>dix ans</strong> à compter de la dernière consultation ou divulgation.",
      },
      {
        number: "Article 7",
        title: "Sécurité et traçabilité",
        text:
          "GMTP met en oeuvre des mesures de protection incluant accès par mot de passe, filigranes, limitations techniques et journalisation des accès. Toute tentative de contournement ou d'extraction entraîne la suspension immédiate de l'accès.",
      },
      {
        number: "Article 8",
        title: "Droit applicable",
        text:
          "Le présent accord est soumis au droit français. En cas de litige, GMTP pourra solliciter toute mesure conservatoire ou urgente, ainsi que des dommages-intérêts.",
      },
    ],
    fields: [
      { name: "prenom", label: "Prénom", placeholder: "votre prénom" },
      { name: "nom", label: "Nom", placeholder: "votre nom" },
    ],
    consentLabel:
      "J'ai lu et j'accepte intégralement les termes du présent accord de confidentialité. Je m'engage à respecter l'ensemble des obligations qui en découlent, pour une durée de <strong>dix ans</strong>.",
    submitLabel: "signer & accéder",
  };
}
