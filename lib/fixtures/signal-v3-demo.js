const DEMO_SAMPLE_SIZE = 30;
const V3_PROJECT_VERSION = "maree_noire_v2";
const V3_FORM_VERSION = "signal_v3";
const V3_SCORING_MODEL_VERSION = "signal_v3";

const DIMENSIONS = [
  {
    key: "hook",
    label: "Hook",
    scoreKey: "hook_score",
    items: ["hook_discovery_score", "curiosity_score"],
  },
  {
    key: "feel",
    label: "Feel",
    scoreKey: "feel_score",
    items: ["felt_something_score", "atmosphere_stay_score"],
  },
  {
    key: "care",
    label: "Care",
    scoreKey: "care_score",
    items: ["character_intrigue_score", "character_fate_interest_score"],
  },
  {
    key: "continue",
    label: "Continue",
    scoreKey: "continue_score",
    items: ["continue_intent_score", "watch_intent_score"],
  },
  {
    key: "share",
    label: "Share",
    scoreKey: "share_score",
    items: ["recommendation_score", "talkability_score"],
  },
];

const SCORE_DISTRIBUTIONS = {
  hook_discovery_score: buildDistribution({ 5: 18, 4: 10, 3: 1, 2: 1 }),
  curiosity_score: buildDistribution({ 5: 22, 4: 6, 3: 1, 1: 1 }, 7),
  felt_something_score: buildDistribution({ 5: 16, 4: 10, 3: 3, 2: 1 }, 3),
  atmosphere_stay_score: buildDistribution({ 5: 14, 4: 11, 3: 4, 2: 1 }, 11),
  character_intrigue_score: buildDistribution({ 5: 9, 4: 7, 3: 5, 2: 6, 1: 3 }, 5),
  character_fate_interest_score: buildDistribution({ 5: 5, 4: 7, 3: 10, 2: 6, 1: 2 }, 13),
  continue_intent_score: buildDistribution({ 5: 16, 4: 10, 3: 2, 2: 1, 1: 1 }, 9),
  watch_intent_score: buildDistribution({ 5: 18, 4: 8, 3: 3, 2: 1 }, 15),
  recommendation_score: buildDistribution({ 5: 10, 4: 12, 3: 5, 2: 2, 1: 1 }, 2),
  talkability_score: buildDistribution({ 5: 8, 4: 12, 3: 6, 2: 3, 1: 1 }, 17),
  promise_clarity_score: buildDistribution({ 5: 8, 4: 14, 3: 6, 2: 2 }, 4),
  world_clarity_score: buildDistribution({ 5: 9, 4: 13, 3: 6, 2: 2 }, 10),
  dramatic_clarity_score: buildDistribution({ 5: 5, 4: 10, 3: 10, 2: 4, 1: 1 }, 14),
  emotional_clarity_score: buildDistribution({ 5: 7, 4: 14, 3: 7, 2: 2 }, 18),
  reading_fluidity_score: buildDistribution({ 5: 5, 4: 18, 3: 5, 2: 2 }, 8),
  material_sufficiency_score: buildDistribution({ 5: 18, 4: 8, 2: 4 }, 12),
  duration_relevance_score: buildDistribution({ 5: 4, 4: 18, 3: 5, 2: 3 }, 16),
};

const IMMEDIATE_REACTIONS = [
  "J'ai envie de continuer",
  "J'ai envie de continuer",
  "Je suis curieux·se",
  "J'ai envie de continuer",
  "Je ne sais pas encore",
  "J'ai envie de continuer",
  "Je suis curieux·se",
  "Pas pour moi",
  "J'ai envie de continuer",
  "Je suis curieux·se",
  "J'ai envie de continuer",
  "Je ne sais pas encore",
  "J'ai envie de continuer",
  "Je suis curieux·se",
  "J'ai envie de continuer",
  "Pas pour moi",
  "Je suis curieux·se",
  "J'ai envie de continuer",
  "Je ne sais pas encore",
  "J'ai envie de continuer",
  "Je suis curieux·se",
  "J'ai envie de continuer",
  "Je ne sais pas encore",
  "Je suis curieux·se",
  "Pas pour moi",
  "J'ai envie de continuer",
  "Je suis curieux·se",
  "J'ai envie de continuer",
  "Je ne sais pas encore",
  "J'ai envie de continuer",
];

const EMOTIONS = [
  "Curiosité",
  "Tension",
  "Malaise",
  "Peur",
  "Curiosité",
  "Tension",
  "Curiosité",
  "Trouble",
  "Malaise",
  "Curiosité",
  "Tension",
  "Fascination",
  "Peur",
  "Curiosité",
  "Tension",
  "Malaise",
  "Curiosité",
  "Inquiétude",
  "Peur",
  "Tension",
  "Curiosité",
  "Malaise",
  "Tension",
  "Curiosité",
  "Distance",
  "Peur",
  "Curiosité",
  "Tension",
  "Malaise",
  "Curiosité",
];

const CARE_PERSONNAGES = [
  "Vera, Iroise",
  "Vera",
  "Iroise, Lenn",
  "Vera, Vikram",
  "Aucun pour l'instant",
  "Iroise",
  "Vera, Lenn",
  "Aucun pour l'instant",
  "Vera, Iroise, Vikram",
  "Iroise",
  "Vera",
  "Lenn",
  "Vera, Iroise",
  "Vikram",
  "Aucun pour l'instant",
  "Iroise, Lenn",
  "Vera",
  "Vera, Vikram",
  "Aucun pour l'instant",
  "Iroise",
  "Vera, Iroise",
  "Lenn, Vikram",
  "Vera",
  "Iroise",
  "Aucun pour l'instant",
  "Vera, Lenn",
  "Iroise, Vikram",
  "Vera",
  "Aucun pour l'instant",
  "Vera, Iroise",
];

const CARE_POURQUOI = [
  "Vera porte quelque chose de secret sans être encore lisible.",
  "Son lien au retour de Noé donne envie de comprendre.",
  "Iroise semble avoir une faille intéressante.",
  "Vikram intrigue mais reste encore un peu fonctionnel.",
  "",
  "Iroise a une présence forte, presque inquiétante.",
  "Le duo Vera-Lenn crée une tension discrète.",
  "",
  "Le groupe paraît pris dans un secret commun.",
  "Iroise dégage une fragilité qui accroche.",
  "Vera semble au centre d'un mensonge.",
  "Lenn peut devenir intéressant si son enjeu se précise.",
  "La relation entre Vera et Iroise donne envie d'en savoir plus.",
  "Vikram pourrait surprendre, mais je ne l'ai pas encore assez senti.",
  "",
  "Iroise et Lenn donnent deux portes d'entrée différentes.",
  "Vera est la plus incarnée pour moi.",
  "Le contraste Vera-Vikram peut créer du trouble.",
  "",
  "Iroise a un côté dangereux qui fonctionne.",
  "Vera et Iroise concentrent le mystère.",
  "Lenn et Vikram m'intéressent mais de loin.",
  "Vera donne une vraie direction émotionnelle.",
  "Iroise laisse une impression plus forte que les autres.",
  "",
  "Vera et Lenn ont un potentiel, même si je veux plus de chair.",
  "Iroise et Vikram ouvrent des zones plus ambiguës.",
  "Vera est celle dont je retiens le plus l'énergie.",
  "",
  "Vera et Iroise sont les deux présences qui restent après lecture.",
];

const CONTINUE_DECROCHE = [
  "Personnages peu engageants, Déjà vu",
  "Rien pour l'instant",
  "Manque de clarté",
  "Trop lent",
  "Personnages peu engageants",
  "Déjà vu, Manque de clarté",
  "Rien pour l'instant",
  "Personnages peu engageants, Trop lent",
  "Manque de clarté",
  "Déjà vu",
  "Rien pour l'instant",
  "Personnages peu engageants",
  "Trop lent, Manque de clarté",
  "Déjà vu",
  "Personnages peu engageants, Manque de clarté",
  "Rien pour l'instant",
  "Trop lent",
  "Déjà vu, Personnages peu engageants",
  "Manque de clarté",
  "Rien pour l'instant",
  "Personnages peu engageants",
  "Trop lent",
  "Déjà vu",
  "Manque de clarté, Trop lent",
  "Personnages peu engageants",
  "Rien pour l'instant",
  "Déjà vu, Manque de clarté",
  "Personnages peu engageants, Trop lent",
  "Manque de clarté",
  "Rien pour l'instant",
];

const CONTINUE_MOTEUR_FREIN = [
  "Le mystère du retour de Noé me pousse à lire la suite.",
  "L'enfant qui revient sans avoir vieilli est un moteur très fort.",
  "L'ambiance côtière m'attire, même si les personnages restent loin.",
  "J'ai envie de comprendre ce que la ville cache.",
  "Le concept intrigue, mais j'ai peur d'un rythme trop lent.",
  "La tension fonctionne dès le départ.",
  "Le secret autour de Noé donne une vraie envie de suite.",
  "Je suis moins accroché aux personnages qu'à l'idée centrale.",
  "L'étrangeté du retour me donne envie de vérifier la promesse.",
  "L'univers marin et sombre crée un bon appel.",
  "Je veux savoir pourquoi personne ne semble vraiment dire la vérité.",
  "La mécanique m'intéresse, mais certains enjeux restent flous.",
  "Le mystère est assez fort pour compenser mes réserves.",
  "L'ambiance me happe plus que l'histoire pour l'instant.",
  "Le risque serait que cela ressemble à un déjà-vu fantastique.",
  "Noé revenu inchangé est l'image que je retiens.",
  "La ville côtière donne une texture qui me plaît.",
  "Je continuerais pour comprendre le lien entre Vera et l'enfant.",
  "Je décrocherais si les personnages ne gagnent pas vite en épaisseur.",
  "Le malaise est efficace et donne envie d'avancer.",
  "Le pitch a une bonne promesse de secret familial.",
  "Je suis porté par l'atmosphère, un peu moins par les relations.",
  "La peur du déjà-vu existe, mais le décor me retient.",
  "J'ai envie de voir si le retour de Noé dérange toute la ville.",
  "Le rythme pourrait me perdre si la tension ne monte pas.",
  "Le mystère est simple à saisir et assez puissant.",
  "Je retiens surtout l'envie de comprendre ce qui est arrivé en mer.",
  "L'univers donne envie, mais il faut clarifier les enjeux adultes.",
  "La tension intime me paraît prometteuse.",
  "Je continuerais pour l'étrangeté, pas encore pour les personnages.",
];

const SHARE_PITCH = [
  "Un enfant disparu revient dans une ville côtière sans avoir vieilli.",
  "Une histoire de retour impossible autour d'un garçon que tout le monde croyait perdu.",
  "Dans une ville au bord de la mer, Noé réapparaît et réveille des secrets.",
  "Un mystère familial et côtier autour d'un enfant revenu identique.",
  "Une série sombre sur une disparition, un retour étrange et une communauté qui cache des choses.",
  "Noé revient comme si le temps n'avait pas passé, et cela fissure tout le monde.",
  "Un thriller de bord de mer où un enfant disparu remet le passé en marche.",
  "Une ville doit affronter le retour inexplicable d'un garçon disparu.",
  "C'est l'histoire d'un enfant revenu sans avoir grandi, avec un secret autour de lui.",
  "Un mystère entre mer, famille et mensonges anciens.",
  "Une communauté côtière perturbée par le retour impossible de Noé.",
  "Un projet sur ce que le retour d'un disparu fait remonter chez les vivants.",
  "Un enfant revient, pareil qu'avant, et personne ne sait si c'est une chance ou une menace.",
  "Un récit étrange où la mer semble avoir gardé un secret.",
  "Un thriller émotionnel autour d'un garçon qui revient sans explication.",
  "Noé disparaît puis revient sans avoir vieilli, et tout le village vacille.",
  "Une histoire de secrets dans une ville maritime après un retour impossible.",
  "Un mystère fantastique assez intime, centré sur une famille et un enfant disparu.",
  "La promesse d'une enquête émotionnelle sur Noé et ceux qui l'attendaient.",
  "Une ambiance noire de littoral avec un enfant qui défie le temps.",
  "Une série sur la trace laissée par une disparition et le choc du retour.",
  "Un garçon revient du passé dans une ville qui n'a pas envie qu'on fouille.",
  "Un retour d'enfant, une mer menaçante et des secrets qui ressortent.",
  "Une intrigue où le fantastique sert à révéler les failles d'une communauté.",
  "Un mystère côtier avec Noé au centre et beaucoup de non-dits.",
  "Un enfant disparu réapparaît, et son retour trouble toute la ville.",
  "Un thriller où l'on ne sait pas si Noé est une victime, un miracle ou un danger.",
  "Une histoire sombre sur l'enfance perdue, la mer et les secrets d'adultes.",
  "Une série de mystère où le retour intact d'un enfant oblige chacun à se dévoiler.",
  "Un récit étrange et émotionnel sur Noé, revenu sans que le temps l'ait touché.",
];

const ROOM_COMMENTS = [
  null,
  null,
  null,
  "Il me faudrait une fiche personnage un peu plus nette.",
  null,
  null,
  null,
  "Quelques repères sur la chronologie aideraient.",
  null,
  null,
  null,
  null,
  "J'aurais aimé un résumé plus clair des enjeux de départ.",
  null,
  null,
  null,
  null,
  "Les documents sont lisibles mais certains liens restent implicites.",
  null,
  null,
  null,
  null,
  "Un plan de la ville ou des relations serait utile.",
  null,
  null,
  null,
  null,
  "Le matériau donne envie, mais il manque un point d'ancrage personnages.",
  null,
  null,
];

function buildDistribution(counts, rotation = 0) {
  const values = [];

  for (const [score, count] of Object.entries(counts)) {
    for (let index = 0; index < count; index += 1) {
      values.push(Number(score));
    }
  }

  const rotated = values.slice(rotation).concat(values.slice(0, rotation));
  if (rotated.length !== DEMO_SAMPLE_SIZE) {
    throw new Error("Invalid SIGNAL V3 demo distribution size.");
  }

  return rotated;
}

function normalizeScore(rawAverage) {
  return ((rawAverage - 1) / 4) * 100;
}

function roundOne(value) {
  return Math.round(value * 10) / 10;
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function dimensionScore(response, dimension) {
  return normalizeScore(average(dimension.items.map((itemKey) => response[itemKey])));
}

function createResponses() {
  return Array.from({ length: DEMO_SAMPLE_SIZE }, (_, index) => {
    const response = Object.fromEntries(
      Object.entries(SCORE_DISTRIBUTIONS).map(([key, values]) => [key, values[index]])
    );
    const responseCode = `DEMO-V3-${String(index + 1).padStart(2, "0")}`;

    return {
      ...response,
      response_code: responseCode,
      enrolment_id: `demo-enrolment-${String(index + 1).padStart(2, "0")}`,
      submitted_at: new Date(Date.UTC(2026, 8, 9, 9, index, 0)).toISOString(),
      immediate_reaction_label: IMMEDIATE_REACTIONS[index],
      feel_emotion: EMOTIONS[index],
      care_personnages: CARE_PERSONNAGES[index],
      care_personnages_options:
        CARE_PERSONNAGES[index] === "Aucun pour l'instant"
          ? ["Aucun pour l'instant"]
          : CARE_PERSONNAGES[index].split(", "),
      continue_decroche: CONTINUE_DECROCHE[index],
      continue_decroche_options:
        CONTINUE_DECROCHE[index] === "Rien pour l'instant"
          ? ["Rien pour l'instant"]
          : CONTINUE_DECROCHE[index].split(", "),
      care_pourquoi: CARE_POURQUOI[index],
      continue_moteur_frein: CONTINUE_MOTEUR_FREIN[index],
      share_pitch: SHARE_PITCH[index],
      free_comment: ROOM_COMMENTS[index],
    };
  });
}

function buildSummary(responses, campaignCode) {
  const dimensionScores = Object.fromEntries(
    DIMENSIONS.map((dimension) => [
      dimension.scoreKey,
      roundOne(average(responses.map((response) => dimensionScore(response, dimension)))),
    ])
  );
  const desirabilityScore = roundOne(average(Object.values(dimensionScores)));
  const dimensions = DIMENSIONS.map((dimension) => ({
    key: dimension.key,
    label: dimension.label,
    score: dimensionScores[dimension.scoreKey],
  }));
  const scores = dimensions.map((dimension) => dimension.score).filter((score) => score != null);
  const strongestScore = Math.max(...scores);
  const weakestScore = Math.min(...scores);

  return {
    campaignId: "demo-campaign-cp-00003",
    campaignCode,
    campaignName: "Room 01 — Marée Noire — V3",
    campaignStatus: "demo local",
    projectVersion: V3_PROJECT_VERSION,
    formVersion: V3_FORM_VERSION,
    scoringModelVersion: V3_SCORING_MODEL_VERSION,
    sampleSize: responses.length,
    desirabilityScore,
    dimensions,
    strongestDimension: dimensions.find((dimension) => dimension.score === strongestScore)?.label,
    strongestDimensions: dimensions
      .filter((dimension) => dimension.score === strongestScore)
      .map((dimension) => dimension.label),
    weakestDimension: dimensions.find((dimension) => dimension.score === weakestScore)?.label,
    weakestDimensions: dimensions
      .filter((dimension) => dimension.score === weakestScore)
      .map((dimension) => dimension.label),
  };
}

function buildDimensionDetails(summary, responses) {
  return DIMENSIONS.map((dimension) => ({
    key: dimension.key,
    label: dimension.label,
    score: summary.dimensions.find((item) => item.key === dimension.key)?.score ?? null,
    items: dimension.items.map((itemKey) => ({
      key: itemKey,
      label: itemKey,
      average: roundOne(average(responses.map((response) => response[itemKey]))),
      values: responses.map((response) => ({
        responseCode: response.response_code,
        value: response[itemKey],
      })),
    })),
  }));
}

function buildDiagnostics(responses) {
  return responses.map((response) => ({
    enrolmentId: response.enrolment_id,
    responseCode: response.response_code,
    submittedAt: response.submitted_at,
    immediateReactionLabel: response.immediate_reaction_label,
    promiseClarityScore: response.promise_clarity_score,
    worldClarityScore: response.world_clarity_score,
    dramaticClarityScore: response.dramatic_clarity_score,
    emotionalClarityScore: response.emotional_clarity_score,
    feelEmotion: response.feel_emotion,
    carePersonnages: response.care_personnages,
    carePersonnagesOptions: response.care_personnages_options,
    continueDecroche: response.continue_decroche,
    continueDecrocheOptions: response.continue_decroche_options,
    aucunPersonnagePourLInstant: response.care_personnages === "Aucun pour l'instant",
    risquePersonnagesPeuEngageants: response.continue_decroche.includes("Personnages peu engageants"),
  }));
}

function buildVerbatimGroups(responses) {
  const groupConfig = [
    {
      key: "continue_moteur_frein",
      title: "MOTEUR / FREIN",
      empty: "Aucun moteur ou frein exprimé pour l’instant.",
      getText: (response) => response.continue_moteur_frein,
    },
    {
      key: "share_pitch",
      title: "LE PROJET RACONTÉ PAR LE PUBLIC",
      empty: "Aucune reformulation du projet pour l’instant.",
      getText: (response) => response.share_pitch,
    },
    {
      key: "care_pourquoi",
      title: "PERSONNAGES",
      empty: "Aucun développement personnage pour l’instant.",
      getText: (response) => response.care_pourquoi,
    },
    {
      key: "feel_emotion",
      title: "ÉMOTION",
      empty: "Aucune émotion formulée pour l’instant.",
      getText: (response) => response.feel_emotion,
    },
  ];

  return groupConfig.map((group) => ({
    key: group.key,
    title: group.title,
    empty: group.empty,
    items: responses
      .map((response) => ({
        id: `${response.response_code}-${group.key}`,
        responseCode: response.response_code,
        text: group.getText(response),
        createdAt: response.submitted_at,
      }))
      .filter((item) => item.text),
  }));
}

function buildRoomExperience(responses) {
  return responses.map((response) => ({
    roomFeedbackId: `demo-room-${response.response_code}`,
    responseCode: response.response_code,
    submittedAt: response.submitted_at,
    readingFluidityScore: response.reading_fluidity_score,
    materialSufficiencyScore: response.material_sufficiency_score,
    durationRelevanceScore: response.duration_relevance_score,
    freeComment: response.free_comment,
  }));
}

export function getSignalV3DemoDashboardData(campaignCode = "CP-00003") {
  const responses = createResponses();
  const summary = buildSummary(responses, campaignCode);

  return {
    state: "ready",
    mode: "demo",
    campaignCode,
    campaign: {
      id: "demo-campaign-cp-00003",
      code: campaignCode,
      name: "Room 01 — Marée Noire — V3",
      status: "demo local",
      projectVersion: V3_PROJECT_VERSION,
      formVersion: V3_FORM_VERSION,
      analyseStatus: null,
    },
    expectedVersion: {
      projectVersion: V3_PROJECT_VERSION,
      formVersion: V3_FORM_VERSION,
      scoringModelVersion: V3_SCORING_MODEL_VERSION,
    },
    summary,
    dimensionDetails: buildDimensionDetails(summary, responses),
    diagnostics: buildDiagnostics(responses),
    verbatimGroups: buildVerbatimGroups(responses),
    roomExperience: buildRoomExperience(responses),
    counts: {
      dimensionItems: responses.length,
      diagnostics: responses.length,
      verbatims: responses.length * 2 + CARE_POURQUOI.filter(Boolean).length + responses.length,
      roomExperience: responses.length,
    },
    demo: {
      sampleSize: DEMO_SAMPLE_SIZE,
      polarisation:
        "character_intrigue_score combine 9 notes à 5/5 et 9 notes à 1-2/5, pour rendre visible un Care moyen mais divisé.",
      liveDataUsed: false,
    },
    error: null,
  };
}
