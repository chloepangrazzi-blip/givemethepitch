const STREAMING_PLATFORMS = ["Netflix", "Prime Video", "Apple TV+", "Disney+", "HBO Max", "autre"];
const TV_CHANNELS = ["TF1", "M6", "France TV", "Arte"];
const REPLAY_PLATFORMS = ["TF1+", "M6+", "france.tv", "Arte.tv"];
const GENRES = [
  "comédie",
  "drame",
  "dramédie",
  "polar",
  "thriller",
  "fantastique",
  "science-fiction",
  "horreur",
  "action",
  "historique",
  "young adult",
  "familial",
];

export function getTheRoomPageData() {
  return {
    title: "THE ROOM",
    landing: {
      eyebrow: "ideas begin with you",
      ctaLabel: "enter",
      paragraphs: [
        "Des centaines de milliards de data events sont enregistrés chaque jour sur les plateformes de streaming. Netflix, Disney+ ou Prime Video se basent sur ces données pour créer leurs nouveautés, persuadées qu'elles reflètent fidèlement ce que vous attendez.",
        "Pourtant, ces données se basent sur des catalogues existants et sur des comportements captés à posteriori. Elles savent ce que vous regardez, mais pas ce que vous ressentez vraiment avant qu'une série n'existe.",
        "Give Me The Pitch capte justement ce SIGNAL-là : l'appétence, la curiosité, la perception d'un projet avant production.",
      ],
    },
    about: {
      tag: "About The Room",
      title: "THE ROOM",
      tagline: "ideas begin with you",
      intro: [
        "Des centaines de milliards de data events sont enregistrés chaque jour sur les plateformes de streaming.",
        "Netflix, Disney+ ou Prime Video se basent sur ces données pour créer leurs nouveautés, persuadées qu'elles reflètent fidèlement ce que vous attendez.",
      ],
      observationBox: {
        lines: [
          "Vous binge watchez une nouveauté",
          "Vous passez de la dernière romance à la mode à un true crime, sans transition",
          "Vous vous endormez devant La Chronique de Bridgerton",
        ],
        reveal: "Netflix sait ce que vous regardez.",
      },
      algorithmProblem: [
        "Pourtant, le constat est sans appel : les séries diffusées ces dernières années sur ces géants du streaming souffrent d'un manque cruel d'originalité.",
        "Les lois algorithmiques font désormais foi.",
        "Et, petit à petit, elles tendent à remplacer les créatifs dans le processus de développement.",
      ],
      quoteOne: {
        text: "Ils ne trouvent pas ça bon, je ne trouve pas ça bon, mais l'algorithme, lui, trouve que ça fait l'affaire.",
        source:
          "Scénariste. Streaming. Entre Netflix et le public, un malentendu qui engendre des films et des séries de plus en plus « stupides ». Courrier international",
      },
      algorithmLoop: [
        "Dans les faits, elles ont une utilité limitée dans le mécanisme de création de succès commerciaux et critiques.",
        "Pourquoi ?",
        "La réponse est simple : ces données se basent sur des catalogues existants.",
      ],
      cycleBox: {
        lines: [
          "L'accès à ces services de streaming est devenu une habitude de consommation.",
          "On s'abonne. On regarde ce qui est proposé.",
          "Eux récoltent de la data sur une offre structurellement pauvre.",
        ],
        reveal: "Et recommencent.",
      },
      signalProblem: [
        "Ainsi, le seul phare qui guide aujourd'hui la majorité des décisions créatives et éditoriales, ce sont des données comportementales récoltées à posteriori.",
        "Plus vous regardez ce qu'ils proposent, plus ils considèrent que vous validez. Plus ils reproduisent.",
        "Vous l'aurez compris : ce que vous choisissez, quand vous décrochez, quand vous switchez… ils le savent et l'enregistrent. À la seconde près.",
      ],
      quoteTwo: {
        text:
          "Netflix avait requis : « Ce serait bien si vous pouviez répéter le pitch de l'intrigue trois ou quatre fois dans les dialogues, parce que les gens sont souvent rivés à leur téléphone en même temps qu'ils regardent. »",
        source: "Matt Damon au sujet de The Rip — Netflix",
      },
      pivot: {
        intro: "Ce qu'ils ont décidé de ne pas capter, en revanche",
        signal: "c'est le SIGNAL.",
        title: "GIVE ME THE PITCH,",
        emphasis: "SI.",
      },
      gmtp: {
        label: "Give Me The Pitch, c'est quoi ?",
        intro:
          "Give Me The Pitch est une plateforme dédiée au développement de séries. Elle repose sur deux piliers complémentaires, qui se nourrissent l'un l'autre.",
        pillars: [
          {
            pill: "SIGNAL",
            text: "capte votre appétence pour un projet avant qu'il ne soit produit",
          },
          {
            pill: "STORIES",
            text: "développe des concepts de séries originales. Ils sont systématiquement soumis à votre regard avant d'être proposés à des producteurs.",
          },
        ],
      },
      signal: {
        label: "Signal, c'est quoi ?",
        paragraphs: [
          "Que vous soyez team Friends ou Plus belle la vie, Grey's Anatomy ou Killing Eve, Columbo ou Fleabag, Engrenages ou Twin Peaks : vos goûts ont de la valeur. Votre avis aussi.",
          "Signal, c'est l'outil qui permet de les affirmer au bon moment.",
          "Car nous l'avons vu, analyser votre appétence ou vos comportements à posteriori n'a aucune utilité réelle et ne sert qu'à appauvrir l'offre sérielle.",
        ],
      },
      room: {
        label: "The Room, c'est quoi ?",
        paragraphs: [
          "The Room, c'est tout simplement votre espace, l'endroit où vous accédez aux projets de série. Vous aurez accès à différents éléments vous permettant de donner votre avis sur les concepts en cours de développement.",
          "The Room, c'est la zone qui vous est entièrement dédiée, qui vous redonne la place que vous méritez. Une place utile. Une place rare.",
        ],
      },
      process: {
        label: "Comment ça se déroule ?",
        steps: [
          "Vous recevez un accès personnel",
          "Vous consultez le support de session",
          "Vous répondez à une série de questions claires",
          "Give Me The Pitch consolide et anonymise",
          "Un SIGNAL est créé",
        ],
      },
      utility: {
        label: "À quoi ça sert, dans le développement ?",
        paragraphs: [
          "Le développement est une phase clé de la construction d'une série. C'est le moment où tout se joue. Une étape décisive à laquelle vous n'êtes pas conviés et pourtant… La plupart des décisions se prennent sur base d'intuition biaisée par de la data faussée, le tout généralement en l'absence des créateurices des séries.",
          "SIGNAL est là pour outiller ce moment crucial. En réagissant à des concepts, vous leur donnez du poids. Vous permettez ainsi de renouveler l'offre, de donner plus de chance à des scénaristes d'imposer leurs idées en comité de lecture, vous consolidez l'argumentaire d'un producteur qui défend un projet devant un diffuseur.",
        ],
        accent: "Bref, vous entrez dans l'écosystème et reprenez votre juste place.",
      },
      data: {
        label: "Et vos données dans tout ça ?",
        paragraphs: [
          "Ce que vous partagez dans The Room est anonymisé et consolidé. Nous ne vendons pas vos données. Nous ne les transmettons pas à des tiers.",
          "Elles servent uniquement à construire le SIGNAL : un indicateur collectif, jamais individuel.",
        ],
      },
      ai: {
        label: "Et l'IA dans tout ça ?",
        paragraphs: [
          "Nous utilisons l'IA comme outil de visualisation d'intention et de mise en forme : projection d'univers, supports de présentation, prototypage. Cependant le cœur créatif : conception, dramaturgie, écriture, direction artistique, montage, son, étalonnage, reste résolument humain.",
          "Nous avons conscience de l'impact désastreux de l'IA sur l'écologie. Mais ici le prototypage permet d'éviter des tournages exploratoires lourds (déplacements, régie, énergie plateau) qui représentent une empreinte supérieure à une production virtuelle.",
          "Nous savons aussi que le milieu artistique a une vision très négative de l'IA, et elle est légitime. Mais utilisée à bon escient, elle peut être vertueuse. Dans un monde saturé d'images, une idée sans support ne vaut malheureusement plus grand-chose. Mettre en image, c'est donner une chance à un projet d'exister dans l'esprit de ceux qui décident.",
        ],
      },
      closing: {
        lines: [
          "SIGNAL, c'est ce qu'on capte.",
          "THE ROOM, c'est l'endroit où vous le déclenchez.",
        ],
        accent: "Et où une idée peut commencer à devenir une série.",
      },
    },
    form: {
      title: "join the room",
      headerTitleHtml: "JOIN<br>THE ROOM",
      sections: [
        {
          id: "identity",
          title: "identité",
          questions: [
            { name: "fullName", label: "nom complet", type: "text", required: true, placeholder: "prénom nom" },
            { name: "email", label: "adresse e-mail", type: "email", required: true, placeholder: "votre@email.com" },
            { name: "mobile", label: "mobile", type: "tel", required: true, placeholder: "+33 6 00 00 00 00" },
            { name: "city", label: "ville", type: "text", required: true, placeholder: "votre ville" },
          ],
        },
        {
          id: "habits",
          title: "habitudes de visionnage",
          questions: [
            {
              name: "age",
              label: "votre tranche d'âge",
              type: "radio",
              required: true,
              options: ["18–24", "25–34", "35–44", "45–54", "55–64", "65 et +"],
            },
            {
              name: "freq",
              label: "vous regardez des séries",
              type: "radio",
              required: true,
              options: ["tous les jours", "plusieurs fois / semaine", "une fois / semaine", "de temps en temps"],
            },
            {
              name: "platforms_yn",
              label: "êtes-vous abonné(e) à des plateformes de streaming ?",
              type: "radio",
              required: true,
              options: ["oui", "non"],
            },
            {
              name: "streaming_platforms",
              label: "si oui, lesquelles ?",
              type: "checkbox",
              options: STREAMING_PLATFORMS,
              visibleWhen: { name: "platforms_yn", value: "oui" },
            },
            {
              name: "tv_yn",
              label: "regardez-vous des séries à la télévision ?",
              type: "radio",
              required: true,
              options: ["oui", "non"],
            },
            {
              name: "tv_channels",
              label: "si oui, quelles sont vos chaînes de prédilection ?",
              type: "checkbox",
              options: TV_CHANNELS,
              visibleWhen: { name: "tv_yn", value: "oui" },
            },
            {
              name: "replay_yn",
              label: "regardez-vous des séries en replay ?",
              type: "radio",
              required: true,
              options: ["oui", "non"],
            },
            {
              name: "replay_platforms",
              label: "si oui, sur quelles plateformes ?",
              type: "checkbox",
              options: REPLAY_PLATFORMS,
              visibleWhen: { name: "replay_yn", value: "oui" },
            },
          ],
        },
        {
          id: "tastes",
          title: "goûts & préférences",
          questions: [
            {
              name: "liked_genres",
              label: "quels sont vos genres de prédilection ? (plusieurs réponses possibles)",
              type: "checkbox",
              required: true,
              options: GENRES,
            },
            {
              name: "genre_favori",
              label: "parmi vos choix précédents, lequel est votre genre préféré ?",
              type: "radio",
              required: true,
              options: GENRES,
            },
            {
              name: "origin",
              label: "vous préférez les séries…",
              type: "radio",
              required: true,
              options: ["françaises", "étrangères", "pas de préférence"],
            },
            {
              name: "origin_detail",
              label: "pourquoi ? (facultatif)",
              type: "textarea",
              placeholder: "pourquoi ? (facultatif)",
            },
            {
              name: "fr_quality",
              label: "globalement, diriez-vous que les séries françaises sont à la hauteur de vos attentes ?",
              type: "radio",
              required: true,
              options: ["oui, tout à fait", "plutôt oui", "plutôt non", "pas du tout"],
            },
            {
              name: "fr_raison",
              label: "quelle est la raison principale de votre réponse ?",
              type: "radio",
              required: true,
              options: [
                "je les trouve originales",
                "je les trouve bien écrites",
                "je les trouve ambitieuses visuellement",
                "je m'identifie aux univers et personnages proposés",
                "je trouve qu'il manque de l'originalité",
                "je trouve qu'il manque de la qualité d'écriture",
                "je trouve qu'il manque de la diversité dans les genres",
                "je trouve qu'elles manquent d'ambition visuelle",
                "j'ai du mal à m'identifier aux univers ou aux personnages",
                "je regarde peu de séries françaises, donc j'ai du mal à juger",
                "autre",
              ],
            },
            {
              name: "fr_raison_detail",
              label: "si vous le souhaitez, pouvez-vous préciser en quelques mots ?",
              type: "textarea",
              placeholder: "champ libre (facultatif)",
            },
            {
              name: "prescripteur",
              label: "à quelle fréquence recommandez-vous des séries à votre entourage ?",
              type: "radio",
              required: true,
              options: ["jamais", "rarement", "parfois", "souvent", "très souvent"],
            },
          ],
        },
      ],
      consentLabel:
        "J'accepte de rejoindre THE ROOM et que GMTP traite mes données (profil + réponses) afin d'organiser ma participation, adapter les tests et produire des analyses.",
      submitLabel: "join THE ROOM",
      successLabel: "VOTRE CLÉ D'ACCÈS EST ENVOYÉE SUR VOTRE MAIL",
    },
    footerLinks: [
      { href: "/mentions-legales", label: "Mentions légales" },
      { href: "/confidentialite", label: "Confidentialité" },
      { href: "/cgu", label: "CGU" },
      { href: "/cookies", label: "Cookies" },
    ],
  };
}
