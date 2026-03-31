import { getMareeNoireProductPageData } from "./maree-noire-product-data";

export function getContractPageData() {
  const project = getMareeNoireProductPageData();

  return {
    title: "Contrat standard Stories",
    subtitle: "Licence exclusive d'adaptation audiovisuelle",
    projectTitle: project.title,
    projectSlug: project.slug,
    projectFormat: project.format,
    projectGenres: project.genres,
    contractReference: "CT-MN-0001",
    status: "Proposé en l'état — non négociable",
    intro:
      "Lecture lisible du contrat réel GMTP avant passage à l'achat. Le pack choisi, le prix et les grands effets contractuels sont déjà visibles ici pour que le producteur sache exactement où il met les pieds.",
    parties: [
      {
        label: "Le concédant",
        lines: [
          "GIVE ME PITCH, SASU",
          "Siège social : [ADRESSE]",
          "[RCS VILLE] n° [SIREN]",
          "Représentée par [NOM, PRÉNOM, QUALITÉ]",
          "Email : [EMAIL]",
          'Ci-après « GMTP »',
        ],
      },
      {
        label: "Le producteur",
        lines: [
          "[SOCIÉTÉ DE PRODUCTION], [FORME]",
          "Siège social : [ADRESSE]",
          "[RCS VILLE] n° [SIREN]",
          "Représentée par [NOM, PRÉNOM, QUALITÉ]",
          "Email : [EMAIL]",
          'Ci-après « le Producteur »',
        ],
      },
    ],
    highlights: [
      "Licence exclusive d'adaptation audiovisuelle",
      "Territoire monde entier",
      "Durée : durée légale de protection applicable",
      "Contrat standard non négociable",
    ],
    packs: project.packs,
    pricingRows: [
      { pack: "Starter", price: "3 500 € HT", successFee: "750 € HT" },
      { pack: "Pro", price: "6 500 € HT", successFee: "1 500 € HT" },
      { pack: "Ultimate", price: "10 000 € HT", successFee: "3 000 € HT + 0,25 % du MG" },
    ],
    sections: [
      {
        article: "1",
        title: "Objet — contrat standard / acceptation en l'état",
        clauses: [
          "Le présent contrat fixe les conditions dans lesquelles GMTP concède au Producteur une licence exclusive portant sur un Projet original au sein de l'offre STORIES, afin de permettre au Producteur de développer, produire et exploiter une adaptation audiovisuelle du Projet.",
          "Le Producteur reconnaît que le présent contrat constitue le cadre contractuel standard de GMTP pour les projets STORIES. Il est proposé en l'état et son acceptation intégrale, formalisée par la signature des Parties, conditionne l'accès aux Projets et Matériaux. GMTP n'accepte aucune modification, dérogation ou ajout.",
        ],
      },
      {
        article: "2",
        title: "Définitions essentielles",
        clauses: [
          "Projet : l'œuvre originale sélectionnée par le Producteur au sein de STORIES, décrite en Annexe 1.",
          "Matériaux : l'ensemble des éléments remis ou mis à disposition par GMTP au titre du Pack STORIES choisi : pitch, pré-bible ou bible complète, synopsis pilote, épisode pilote le cas échéant, moodboard, Scoring GMTP et tout document associé.",
          "Scoring GMTP : méthodologie propriétaire de GMTP comprenant ses grilles d'analyse, critères d'évaluation, process d'instruction et tout livrable en découlant. Le Scoring GMTP constitue un secret d'affaires.",
          "MG : tout montant contractuel minimum garanti, à-valoir, avance ou engagement financier ferme et objectivable prévu dans un accord conclu avec un diffuseur, une plateforme ou tout financeur institutionnel au titre de la Production ou d'un Dérivé.",
          "Événement Déclencheur : signature par le Producteur d'un accord ferme de diffusion, de financement, de préachat ou comportant un MG, portant sur la Production ou un Dérivé.",
        ],
      },
      {
        article: "3",
        title: "Propriété — principe",
        clauses: [
          "GMTP demeure titulaire de l'ensemble des droits sur le Projet et les Matériaux, sous réserve des droits expressément concédés au Producteur par le présent contrat.",
          "Le présent contrat n'opère aucun transfert de propriété intellectuelle. Il constitue exclusivement une licence au profit du Producteur.",
        ],
      },
      {
        article: "4",
        title: "Licence exclusive — étendue",
        clauses: [
          "GMTP concède au Producteur une licence exclusive d'adaptation audiovisuelle du Projet, comprenant l'ensemble des droits nécessaires au développement, à la production, à la promotion et à l'exploitation de la Production et des Dérivés.",
          "Sont notamment concédés : droit d'adaptation, de reproduction, de représentation, de communication au public, de distribution, de promotion et d'exploitation sous tous modes.",
          "Territoire : monde entier.",
          "Durée : pour chaque territoire d'exploitation, la durée légale de protection du droit d'auteur applicable dans ce territoire, courant à compter de la date de création des Matériaux concernés.",
          "Le Producteur est autorisé à céder et/ou sous-licencier librement tout ou partie des droits concédés, sous réserve du respect des obligations de confidentialité relatives au Scoring GMTP et de l'obligation de notification en cas de cession totale.",
        ],
      },
      {
        article: "5",
        title: "Liberté de modification et de réécriture",
        clauses: [
          "Le Producteur dispose du droit d'adapter et de modifier librement le Projet et les Matériaux créatifs, sans obligation d'information ou d'approbation préalable de GMTP.",
          "GMTP reconnaît que l'adaptation audiovisuelle implique des modifications substantielles et s'engage à ne pas s'y opposer lorsqu'elles sont réalisées de bonne foi dans le cadre de l'adaptation, sauf atteinte manifestement grave à l'honneur ou à la réputation.",
        ],
      },
      {
        article: "6",
        title: "Absence d'obligation de collaboration — hors périmètre",
        clauses: [
          "Le présent contrat n'inclut aucune prestation d'écriture, de réécriture, de consultation artistique, de suivi créatif, de production ou de réalisation.",
          "GMTP ne souhaite pas intervenir dans le développement, l'écriture, la réécriture, la consultation artistique, la production ou la réalisation de la Production ou des Dérivés. Toute demande en ce sens est réputée hors périmètre et automatiquement refusée, sauf accord séparé conclu par écrit.",
        ],
      },
      {
        article: "7",
        title: "Packs Stories — prix et livrables",
        clauses: [
          "Le Producteur sélectionne l'un des Packs STORIES — Starter, Pro ou Ultimate — dont le contenu est détaillé en Annexe 2.",
          "Le prix du Pack est payable en une fois à la signature, en euros hors taxes. Les sommes versées sont définitivement acquises à GMTP et ne sont pas remboursables, sauf disposition impérative contraire.",
          "Le Pack sélectionné et le prix correspondant sont identifiés en Annexe 1. Le paiement conditionne l'accès aux Matériaux.",
        ],
      },
      {
        article: "8",
        title: "Success fee — déclencheur et modalités",
        clauses: [
          "L'Événement Déclencheur emporte exigibilité des sommes prévues au présent article.",
          "Starter : 750 € HT ; Pro : 1 500 € HT ; Ultimate : 3 000 € HT auxquels s'ajoute 0,25 % du MG effectivement encaissé par le Producteur au titre de la Production.",
          "Les sommes dues au titre du success fee sont payables dans les 30 jours suivant la signature de l'accord ferme pour la partie fixe et, pour Ultimate, à chaque encaissement de tranche de MG pour la composante variable.",
        ],
      },
      {
        article: "9",
        title: "Confidentialité — protection du Scoring GMTP",
        clauses: [
          "Sont soumis à une obligation de confidentialité stricte et permanente le Scoring GMTP dans son intégralité, les accès, liens, identifiants et codes d'accès aux espaces et outils GMTP, ainsi que toute information non publique relative aux conditions commerciales, aux tarifs et à l'organisation interne de GMTP.",
          "Les Matériaux créatifs remis au Producteur constituent des outils de travail dont il dispose librement pour les besoins du développement, de la production et de l'exploitation de la Production, y compris leur communication aux partenaires habituels d'exploitation.",
          "Le Producteur s'interdit de communiquer, reproduire, diffuser, capturer, enregistrer, copier ou télécharger le Scoring GMTP sans autorisation écrite et préalable de GMTP.",
        ],
      },
      {
        article: "10",
        title: "Crédits — mention obligatoire",
        clauses: [
          "Le Producteur s'engage à faire figurer la mention « Idée originale : GIVE ME PITCH (GMTP) » ou toute formulation équivalente au générique de la Production et de tout Dérivé, sur les supports de promotion officiels et sur les bases de données professionnelles lorsque cela est possible.",
          "En cas de manquement non régularisé dans un délai de 30 jours après mise en demeure, une indemnité forfaitaire de 5 000 € HT par manquement non corrigé est due à GMTP.",
        ],
      },
      {
        article: "11",
        title: "Obligation de notification",
        clauses: [
          "Le Producteur informe GMTP par écrit des événements visés à cet article, à des fins de traçabilité, de mise à jour du catalogue et de communication interne.",
          "Sont notamment soumis à notification sous 15 jours : signature d'un accord diffuseur ou financeur, cession totale des droits, décision de Saison 2+, entrée en développement d'un spin-off ou d'un remake, sélection officielle, nomination, prix ou distinction notable.",
        ],
      },
      {
        article: "12",
        title: "Dérivés — droits inclus et success fees spécifiques",
        clauses: [
          "Les droits concédés couvrent l'ensemble des Dérivés, sans autorisation préalable de GMTP, sous réserve du respect des obligations de notification et des success fees applicables.",
          "Saison 2+ : 50 % du success fee fixe applicable au Pack souscrit, et pour Ultimate 0,10 % du MG encaissé au titre de la saison concernée.",
          "Spin-off : 75 % du success fee fixe applicable, et pour Ultimate 0,15 % du MG encaissé.",
          "Remake : forfait fixe de 10 000 € HT et 0,25 % du MG effectivement encaissé par le Producteur.",
        ],
      },
      {
        article: "13",
        title: "Garanties",
        clauses: [
          "GMTP garantit être titulaire ou avoir obtenu les droits nécessaires sur les Matériaux remis, dans la limite de ses créations et des droits effectivement détenus.",
          "Le Producteur garantit la bonne exploitation des droits concédés et prend en charge l'obtention de l'ensemble des autorisations nécessaires à la production.",
        ],
      },
      {
        article: "14",
        title: "Responsabilité",
        clauses: [
          "Chaque Partie est responsable des dommages qu'elle cause du fait de tout manquement à ses obligations contractuelles.",
          "GMTP est tenue à une obligation de moyens au titre de la mise à disposition des Matériaux et des accès.",
        ],
      },
      {
        article: "15",
        title: "Durée — survie des clauses",
        clauses: [
          "La licence est consentie pour la durée prévue à l'article 4.4.",
          "Les obligations de confidentialité, de crédit, de notification et de paiement des success fees survivent à la fin ou à la résiliation du contrat.",
        ],
      },
      {
        article: "16",
        title: "Droit applicable — règlement des litiges",
        clauses: [
          "Le présent contrat est régi par le droit français, y compris lorsque le Producteur est domicilié à l'étranger ou que tout ou partie de la Production est exploitée hors de France.",
          "Les Parties s'engagent à tenter de résoudre tout différend à l'amiable dans un délai de 30 jours à compter de la notification du différend.",
          "À défaut, compétence exclusive du Tribunal de commerce de [VILLE]. Pour tout litige d'un enjeu supérieur ou égal à 50 000 €, un arbitrage accéléré CMAP peut être envisagé d'un commun accord.",
        ],
      },
    ],
    annexes: [
      {
        title: "Annexe 1 — Identification du Projet",
        rows: [
          { label: "Titre du Projet", value: "[TITRE]" },
          { label: "Logline / Promesse", value: "[LOGLINE]" },
          { label: "Pack souscrit", value: "☐ Starter (3 500 € HT)    ☐ Pro (6 500 € HT)    ☐ Ultimate (10 000 € HT)" },
          { label: "Date de mise à disposition", value: "[DATE]" },
          { label: "Référence interne GMTP", value: "[ID]" },
        ],
      },
      {
        title: "Annexe 2 — Packs Stories : contenu des livrables",
        table: [
          { item: "Pitch", starter: "✓", pro: "✓", ultimate: "✓" },
          { item: "Pré-bible (10 pages max.)", starter: "✓", pro: "—", ultimate: "—" },
          { item: "Bible complète", starter: "—", pro: "✓", ultimate: "✓" },
          { item: "Synopsis épisode pilote", starter: "—", pro: "✓", ultimate: "✓" },
          { item: "Épisode pilote complet", starter: "—", pro: "—", ultimate: "✓" },
          { item: "Moodboard", starter: "—", pro: "—", ultimate: "✓" },
          { item: "Scoring GMTP", starter: "✓", pro: "✓", ultimate: "✓" },
        ],
      },
    ],
    checklist: [
      "Vérifier le pack retenu",
      "Vérifier le prix correspondant",
      "Vérifier que le projet concerné est bien Marée Noire",
      "Passer ensuite à la signature puis à l'achat",
    ],
    sourceFileName: "GMTP_Contrat_STORIES_v2.docx",
    backHref: `/catalogue/${project.slug}`,
    nextHref: "/achat",
  };
}
