import { getLegacyPageByFilename } from "./legacy-html";

const LEGACY_FILENAME = "mareenoire.html";

function getLegacyBody() {
  return getLegacyPageByFilename(LEGACY_FILENAME)?.bodyHtml ?? "";
}

function extractSectionChunk(source, marker) {
  const escapedMarker = marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(
    `<!-- ══ ${escapedMarker} ══ -->([\\s\\S]*?)(?=<!-- ══ [^\\n]+ ══ -->|<!-- ══════════════════════════════ BOUTON -->)`,
    "m"
  );
  const match = source.match(regex);
  return match?.[1] ?? "";
}

function extractDataImages(chunk) {
  const images = [];
  const regex = /<img[^>]+src="(data:image[^"]+)"/g;
  let match = regex.exec(chunk);

  while (match) {
    images.push(match[1]);
    match = regex.exec(chunk);
  }

  return images;
}

function getSectionImages(source, marker) {
  return extractDataImages(extractSectionChunk(source, marker));
}

function getHeroImages(source) {
  const match = source.match(/<section class="hero">([\s\S]*?)<\/section>/);
  return match ? extractDataImages(match[1]) : [];
}

export function getMareeNoirePageData() {
  const legacyBody = getLegacyBody();
  const heroImages = getHeroImages(legacyBody);
  const pitchImages = getSectionImages(legacyBody, "s3_pitch.html");
  const diveImages = getSectionImages(legacyBody, "s4_dive.html");
  const arenaImages = getSectionImages(legacyBody, "s5_arenes.html");
  const longArcImages = getSectionImages(legacyBody, "pitch long.html");

  return {
    title: "Marée Noire",
    sessionLabel: "Session 1",
    status: "À tester",
    genres: ["Thriller fantastique"],
    format: "6 × 52 min",
    hero: {
      imageSrc: heroImages[0] ?? null,
      tagline: "La mer remonte ce qu'on enterre",
    },
    teaser: {
      desktopSrc: "/Teaser_site.mp4",
      mobileSrc: "/Teaser_MOBILE.mp4",
      posterSrc: "/catalogue-posters/maree-noire.png",
    },
    beforeTest: [
      "Regarder le teaser dans de bonnes conditions.",
      "Prendre le temps de traverser toutes les rubriques.",
      "Lancer le test seulement lorsque la lecture est prête.",
    ],
    expectation:
      "Cette session attend une lecture sensible, franche et précise. Il ne s'agit pas de trouver la bonne réponse, mais de dire ce que le projet produit réellement à la lecture.",
    intro: {
      kicker: "Session 1",
      title: "Marée Noire",
      notes: [
        "Regarder le teaser dans de bonnes conditions.",
        "Parcourir l'ensemble des rubriques avant de répondre.",
        "Lancer le test seulement lorsque la lecture est prête.",
        "Il n'y a pas de bonne réponse ni d'obligation d'aimer le projet : il s'agit simplement de le juger selon ce qu'il produit à la lecture.",
      ],
      estimatedDuration: "Durée estimée : 20 mins",
      expectation:
        "Cette session attend une lecture sensible, franche et précise. Il ne s'agit pas de trouver la bonne reponse, mais de dire ce que le projet produit reellement a la lecture.",
      actionLabel: "Lancer le test",
    },
    pitch: {
      word: "Pitch",
      backgroundImage: pitchImages[0] ?? null,
      paragraphs: [
        "Huit ans après sa disparition, Noé réapparaît sur la côte, vivant. Il n'a pas vieilli.",
        "Où était-il pendant tout ce temps et pourquoi revient-il maintenant ? À mesure que l'enquête reprend, la ville se fracture : une partie cherche à comprendre, une autre veut reprendre le contrôle, une troisième cherche à transformer l'inexplicable en récit.",
        "Autour de la digue, au rythme des marées, un phénomène étrange s'installe, insidieusement.",
      ],
      finalLine: "Et bientôt, plus personne ne pourra l'ignorer.",
    },
    dive: {
      imageSrc: diveImages[0] ?? null,
      titleHtml: "DIVE INTO<br>INTRIGUE",
      leftIntroHtml: "Un promeneur<br>longe le rivage.",
      beats: [
        "Dans l'écume, une forme.",
        "Un enfant gisant sur le sable.",
        "Il retourne le corps.",
      ],
      accentHtml: "L'enfant ouvre les yeux.<br>Il s'agit de Noé.",
      paragraphs: [
        "Depuis huit ans, sa disparition est la plaie que cette ville a appris à ne pas toucher. <strong>Un deuil sans corps, une enquête classée, un silence qui a fini par ressembler à de la paix.</strong> Mais à partir de ce matin-là, tout ce qui tenait se défait.",
        "Où était-il ? Pourquoi revient-il maintenant ? Qu'est-ce que son retour va réveiller chez ceux qui l'entourent ? Que vont-ils inventer pour habiter l'inexplicable ? Que sont-ils prêts à croire, à nier, à détruire pour ne pas avoir à vivre avec quelque chose qu'ils ne comprennent pas ?",
        "<strong>Marée Noire éclaire cet espace,</strong> cette frontière entre une réalité fabriquée et un phénomène qui la dépasse, la démantèle irrémédiablement. Cette communauté abîmée par l'absence, rongée par la culpabilité, le doute et la peur, va devoir assimiler une nouvelle version du monde.",
      ],
      beachImage: diveImages[1] ?? null,
    },
    characterFeatures: [
      {
        kicker: "Les personnages",
        nameHtml: "IROISE",
        metaGroups: [["42 ans", "Infirmière", "Cheffe des pompiers volontaires"]],
        hookHtml:
          "Elle connaît les noms, les visages<br>les histoires, les failles de chaque habitant.e.s<br>Cette ville est son territoire.",
        paragraphs: [
          "Iroise est une enfant du pays au sens le plus charnel du terme. Elle porte cette ville dans le corps. Son grand-père pêchait au large, son père aussi. Elle a choisi la terre ferme. Les gens. Infirmière le jour, cheffe des pompiers volontaires le reste du temps, et dans les deux cas la même chose : <strong>quelqu'un à qui on fait appel quand ça déborde.</strong>",
          "Elle est bourrue, directe, sans fioritures. Son humour est sec, rare, dévastateur. Elle arrive dans une pièce et prend toute la place sans même s'en rendre compte. <strong>À sa ceinture, le couteau de marin de son grand-père.</strong> Dans la poche de sa veste, des chewing-gums à la nicotine qu'elle mâche en permanence depuis qu'elle a décidé d'arrêter de fumer.",
          "Sa vie personnelle est un mystère que personne n'a vraiment percé. Elle est seule, et ça semble lui aller. Les gens l'aiment, la respectent, lui font confiance, personne ne la connaît vraiment. Elle est partout dans cette ville et nulle part en même temps. <strong>Comme si prendre soin de tout le monde était aussi une façon de rester à distance.</strong>",
        ],
        imageSrc: getSectionImages(legacyBody, "s6_perso_iroise.html")[0] ?? null,
        reverse: false,
      },
      {
        kicker: "Les personnages",
        nameHtml: "SOAZ &amp;<br>CAMILLE",
        metaGroups: [
          ["46 ans", "Sellière"],
          ["44 ans", "Illustratrice jeunesse"],
        ],
        hookHtml:
          "Elles ont traversé l'absence ensemble.<br>Elles vont découvrir qu'elles n'ont pas<br>survécu pour les mêmes raisons.",
        paragraphs: [
          "Soaz est née sur la côte. Sellière, elle travaille seule dans son atelier, les mains dans le cuir, dans l'odeur des matières, dans le bruit des outils. <strong>Dure en surface, économe en mots.</strong> Ce qu'elle porte depuis la disparition de Noé, elle le garde dans un endroit que personne n'atteint. Même pas Camille.",
          "Camille a grandi à Lyon, vécu à Paris, puis a tout quitté pour Soaz et pour cette vie qu'elles construisaient ensemble. Illustratrice de livres pour enfants, elle passe ses journées à dessiner des mondes doux, des enfants heureux, des histoires qui se terminent bien. <strong>Dans cette ville elle est restée une étrangère au sens profond, pas rejetée, juste jamais tout à fait des leurs.</strong>",
          "Depuis la disparition de Noé, elles fonctionnent en parallèle. Chacune dans sa bulle, chacune avec sa façon de tenir. Elles s'aiment, ça se voit dans les petits gestes. Mais quelque chose s'est creusé entre elles que ni l'une ni l'autre n'a voulu nommer.",
          "Quand Noé revient, ce creux devient un abîme. Camille reçoit son retour comme une grâce. Soaz, elle, comprend à la seconde où elle le voit que quelque chose va remonter avec lui. <strong>Ce qu'elle sait. Ce qu'elle a tu. Ce qu'elle a cru pouvoir garder enfoui pour toujours.</strong>",
        ],
        imageSrc: getSectionImages(legacyBody, "s6_perso_soaz_camille.html")[0] ?? null,
        reverse: true,
      },
      {
        kicker: "Les personnages",
        nameHtml: "VERA",
        metaGroups: [["37 ans", "Biologiste marine"]],
        hookHtml:
          "Elle est venue avec des certitudes scientifiques<br>elle repart avec quelque chose qu'aucune<br>équation ne peut contenir",
        paragraphs: [
          "Vera vit sur un vieux voilier qu'elle déplace au gré de ses missions, des ports provisoires, des amarres jamais définitives. Elle pose ses affaires, elle travaille, elle repart. Ici elle a loué un emplacement au port. Son bateau est encombré de matériel, de carnets couverts d'annotations, de bouteilles vides et de cartes marines punaisées partout. <strong>C'est à la fois un laboratoire et un champ de bataille.</strong>",
          "Vera est indépendante, solitaire, mystérieuse. Magnétique aussi, comme ces gens qui n'ont aucune conscience de leur capacité d'attraction. La liberté comme mode de survie.",
          "Dans son travail elle est obsessionnelle, précise, inarrêtable. Elle a passé des années sur des données que personne ne prenait au sérieux, des anomalies biologiques côtières, des corrélations que ses collègues trouvaient trop spéculatives. Elle a continué. <strong>Elle boit trop, surtout la nuit quand les chiffres ne s'alignent pas.</strong> Elle fume sur le pont à trois heures du matin en regardant la mer avec l'expression de quelqu'un qui cherche une réponse à une question qu'elle formule encore.",
          "Quelque chose l'a abîmée. On ne sait pas quoi. Elle n'en parle jamais. Le travail est peut-être la seule façon qu'elle a trouvée de tenir debout. Quand Noé revient, ce qu'elle trouve sur lui confirme des années de recherche. <strong>Elle garde ça pour elle. Trop longtemps.</strong>",
        ],
        imageSrc: getSectionImages(legacyBody, "s6_perso_vera.html")[0] ?? null,
        reverse: false,
      },
      {
        kicker: "Les personnages",
        nameHtml: "VIKRAM",
        metaGroups: [["43 ans", "Commissaire"]],
        hookHtml:
          "Il a classé le dossier Noé il y a huit ans<br>ce que ça lui a coûté, il commence<br>seulement à le mesurer",
        paragraphs: [
          "Vikram est arrivé ici par mutation il y a quinze ans. Il devait repartir, mais a décidé de rester pour sa femme, pour les enfants, pour cette vie tranquille qui s'est construite presque malgré lui. Deux étrangers qui ont trouvé leur place dans une ville qui les a acceptés sans jamais tout à fait les adopter.",
          "Poli à l'excès, précautionneux dans chaque mot, chaque geste. <strong>Cette politesse, c'est son armure.</strong> Construite patiemment, couche après couche, depuis le premier jour où quelqu'un lui a fait une remarque qu'il a fait semblant de ne pas entendre.",
          "Son équipe le trouve trop doux, trop précis, trop dans « bien comme il faut ». Ce qu'ils voient : un chef qui s'efface. Ce qu'ils ratent : <strong>un flic d'une rigueur et d'une intuition rares,</strong> capable de tenir un dossier sur des années sans perdre un détail, de lire une scène en quelques secondes, de sentir quand quelque chose cloche avant même de savoir quoi. C'est d'ailleurs pour ça qu'il occupe ce poste. Quelqu'un, quelque part, a reconnu ce qu'il valait vraiment.",
        ],
        imageSrc: getSectionImages(legacyBody, "s6_perso_vikram.html")[0] ?? null,
        reverse: true,
      },
    ],
    profiles: [
      {
        name: "Lenn",
        age: "54 ans",
        tags: ["Ancien instituteur", "Fondateur des Veilleurs"],
        introHtml:
          "Il a appris à lire à une génération entière.<br>Il sait parler, convaincre, tenir une salle.<br>Dans une petite ville, ce capital social vaut de l'or.",
        paragraphs: [
          "Lenn a appris à lire à une génération entière d'enfants de cette côte. Il sait parler, convaincre, tenir une salle. Il a ce don rare de faire sentir aux gens qu'ils comptent, qu'ils sont vus, qu'ils font partie de quelque chose. Les parents lui faisaient confiance. Les enfants l'adoraient. Dans une petite ville, ce type de capital social vaut de l'or.",
          "Sa vie personnelle a moins bien tenu. Divorcé, il n'a plus de lien avec ses enfants qui vivent ailleurs. Et c'est peut-être là que tout commence, dans ce besoin d'être au centre, d'être indispensable, de compter pour quelque chose.",
          "La nuit de la disparition de Noé, Lenn était là. Il n'a rien vu mais il a été parmi les premiers à organiser les recherches, à fédérer les gens, à prendre en main ce que les autres ne savaient pas comment tenir. Cette utilité-là, il l'a reconnue immédiatement. Elle lui allait bien.",
          "Les Veilleurs sont nés de ça. Au départ : des rondes, des battues, une présence organisée autour de la digue. Quelque chose de respectable, presque admirable. Avec le temps, Lenn a compris que le groupe avait besoin d'une lecture différente du monde pour continuer à exister et il a fourni ces réponses. Consciemment. Avec l'intelligence de quelqu'un qui sait exactement ce qu'il fait et pourquoi.",
          "Ce qui le rend magnétique et redoutable à la fois : il est cultivé, précis, toujours au bon niveau dans la conversation. Il adapte son discours à son interlocuteur avec une fluidité qui impressionne. Et il a cette façon de vous regarder, comme si vous étiez la seule personne dans la pièce.",
          "Quand Noé revient, Lenn a enfin la preuve que tout le monde attendait. Les Veilleurs se radicalisent. Et Lenn, pour la première fois depuis longtemps, se sent vraiment vivant.",
        ],
        imageSrc: getSectionImages(legacyBody, "lenn.html")[0] ?? null,
        reverse: false,
      },
      {
        name: "Le Braz",
        age: "Âge incertain",
        tags: ["Ancien ouvrier"],
        introHtml:
          "Il connaît ce lieu autrement que les autres.<br>De l'intérieur, littéralement.<br>Et c'est là qu'il a vu quelque chose.",
        paragraphs: [
          "Le Braz est une figure de la ville sans vraiment en faire partie. On le voit, on le connaît de nom, on l'évite un peu. Son âge est difficile à lire, il pourrait avoir soixante-cinq ans comme quatre-vingts, selon la lumière, selon le jour. Grand, massif, une présence physique qui étonne encore, comme si le corps avait décidé de tenir quoi qu'il arrive. On ne sait pas vraiment où il vit, ce qu'il a été, s'il a eu une famille. Il est là depuis toujours, c'est à peu près tout ce que la ville sait de lui.",
          "Il a travaillé sur la digue pendant des années, les chantiers, les fondations, les cavités sous le béton. Il connaît ce lieu autrement que les autres. De l'intérieur, littéralement. Et c'est là qu'il a vu quelque chose, il y a longtemps. Quelque chose qu'il a raconté, une fois, puis deux, puis différemment à chaque fois parce que personne n'écoutait et qu'il espérait que changer les mots ferait changer la réception. Ça n'a pas marché. Il a fini par se taire.",
          "Ce qui le distingue des illuminés que la ville a appris à ignorer : il est lucide. D'une lucidité tranquille et légèrement féroce qui surprend ceux qui l'approchent pour la première fois. Bourru, imprévisible, il peut passer de l'hostilité au trait d'esprit dévastateur en quelques secondes. Les gens qui le sous-estiment le regrettent assez vite.",
          "Quand Noé revient, Le Braz est le seul dans cette ville à ne pas être surpris. Et c'est précisément pour ça qu'il est terrorisé. Lenn veut le rallier aux Veilleurs, Le Braz représenterait une légitimité que leur doctrine seule ne peut pas avoir. Le Braz refuse. Ce qu'il a vu sous la digue n'a rien à voir avec ce que Lenn raconte. Et cette différence-là, pour lui, est fondamentale.",
        ],
        imageSrc: getSectionImages(legacyBody, "le_braz.html")[0] ?? null,
        reverse: true,
      },
      {
        name: "Noé",
        age: "8 ans",
        tags: ["Le disparu"],
        introHtml:
          "Ce Noé-là n'est pas revenu<br>celui qui est sorti de l'eau porte quelque chose<br>qui n'appartient pas à l'enfance.",
        paragraphs: [
          "Le mur du salon de la maison familiale est couvert de photos de la vie d'avant. On y voit un Noé espiègle, Noé riant ou courant sur la plage. On y devine un gamin malin, curieux de tout, joyeux.",
          "Celui qui est sorti de l'eau a bien huit ans, le même visage, les mêmes mains, la même oreille gauche légèrement décollée. Mais il porte en lui une gravité qui n'appartient pas à l'enfance. Il parle peu, observe beaucoup, répond aux questions avec une précision tranquille qui met les adultes mal à l'aise sans qu'ils sachent exactement pourquoi. L'insouciance a disparu. À la place, quelque chose de dense, de lourd semble habiter le jeune garçon.",
          "La nuit, il se lève. Silencieusement, les yeux ouverts, il marche vers la mer. Toujours vers la mer. Le matin il ne se souvient de rien. Il dit juste, parfois, qu'il a entendu quelque chose. Quand on lui demande quoi, il cherche ses mots un moment. Puis il hausse les épaules comme si la réponse était trop simple pour être expliquée.",
        ],
        imageSrc: getSectionImages(legacyBody, "noe.html")[0] ?? null,
        reverse: false,
      },
    ],
    arenas: {
      title: "Les arènes",
      columns: [
        {
          tag: "I — La ville",
          title: "Ce que l'on voit",
          paragraphs: [
            "La ville fonctionne comme toutes les petites villes de bord de mer : elle a ses hiérarchies invisibles, ses solidarités de façade, ses mémoires sélectives. On s'y connaît depuis toujours, ce qui signifie qu'on se doit des choses, qu'on se surveille, qu'on se couvre. Elle a appris à transformer ce qu'elle ne comprend pas en histoire partageable, à lisser les aspérités, à faire tenir ensemble des gens qui ont des raisons de ne pas se parler.",
            "Le retour de Noé brise ce mécanisme. Trop de contradictions, trop de douleur, trop de regards qui se croisent et se détournent. La ville se retrouve face à elle-même, face à ce qu'elle a accepté, à ce qu'elle a laissé se faire, à la distance exacte entre ce qu'elle croit être et ce qu'elle est. Elle fait alors ce qu'elle sait faire : elle se divise, choisit des camps, cherche un responsable. <strong>Le retour de Noé ne crée aucune de ces tensions. Il les révèle.</strong>",
          ],
        },
        {
          tag: "II — La mer & la digue",
          title: "Ce que l'on enfouit",
          paragraphs: [
            "La mer est dans le son des scènes d'intérieur, dans les corps des personnages, dans l'odeur qui ne quitte jamais les vêtements. Dans une ville comme celle-ci, la mer fait partie du quotidien au point qu'on a appris à vivre avec ses humeurs : la marée, le vent, la houle. Elle renvoie à la ville l'image de ce qu'elle refuse d'admettre : qu'il existe des forces qui la dépassent.",
            "La digue est l'endroit où ces deux réalités se touchent. Plus l'affaire avance, plus elle devient autre chose qu'un ouvrage de béton. Une sorte de seuil, un endroit qu'on évite, qu'on surveille, qu'on fantasme. Ce qui se passe en dessous, dans l'eau noire, dans les cavités sous le béton, répond à tout ce que la ville a choisi d'enfouir. <strong>Chaque secret que l'enquête remonte à la surface trouve son écho dans ce qui pulse sous la digue.</strong> Les deux réalités se répondent et s'alimentent jusqu'à ce qu'on ne puisse plus prétendre que l'une n'a rien à voir avec l'autre.",
          ],
        },
      ],
      gallery: [
        { src: arenaImages[0] ?? null, label: "Le bourg" },
        { src: arenaImages[1] ?? null, label: "Quartier Bellevue" },
        { src: arenaImages[2] ?? null, label: "Le port" },
        { src: arenaImages[3] ?? null, label: "Camping de la mer" },
        { src: arenaImages[4] ?? null, label: "L'école Dolto" },
      ],
      finaleImage: arenaImages[5] ?? null,
      finaleQuoteHtml:
        "Une ville. Une communauté. Un enfant.<br>Une vérité enfouie depuis huit ans.<br><br><span class=\"mn-highlight\">Et quelque chose, qui sous le béton et le sel,<br>attend que tout le monde ait fini de mentir.</span>",
      finaleSubline: "Marée Noire — Thriller fantastique — 6 × 52 min",
    },
    longArc: {
      opening: {
        kicker: "Le récit",
        titleHtml:
          "<span class=\"mn-title-line\">Quand une communauté</span><span class=\"mn-title-line\">perd son récit</span><span class=\"mn-title-line\">elle en fabrique un.</span>",
        paragraphs: [
          "Dans cette petite ville de bord de mer, la réapparition inexplicable de Noé ouvre une brèche. Il ramène à la surface une enquête classée, un deuil que tout le monde a appris à contourner, et une fausse vérité qui ne peut plus être digérée. Car si Noé est bien là, intact, l'histoire qui devrait expliquer son retour reste muette. Et quand une communauté se retrouve sans récit, elle en fabrique un, souvent le pire.",
        ],
      },
      teleImage: longArcImages[0] ?? null,
      teleCaption: "Flash info · Réapparition de Noé, 8 ans après sa disparition",
      secretsQuoteHtml:
        "Dans un endroit comme celui-<br>ci, les secrets se déposent,<br>couche après couche, sous<br>une pellicule de normalité.",
      splits: [
        {
          kicker: "L'enquête",
          blockKey: "investigation",
          titleHtml: "<span class=\"mn-title-line\">Une affaire classée.</span>",
          paragraphs: [
            "Vikram rouvre le dossier de la disparition. Très vite, il comprend que le passé a été arrangé. Des détails clochent, des témoignages sonnent faux, des zones ont été évitées.",
            "Le genre de choses qui arrive dans une petite ville quand on protège quelqu'un, ou tout le monde.",
          ],
          imageSrc: longArcImages[1] ?? null,
          reverse: false,
        },
        {
          kicker: "Le point fixe",
          blockKey: "fixed-point",
          titleHtml: "Elle voit ce que<br>le retour va déclencher.",
          paragraphs: [
            "Iroise devient le point fixe dans la tempête. Elle connaît les marées, les accidents, les coups de vent. Elle connaît surtout les gens.",
            "Dans les jours qui suivent, le village se divise sans même en avoir conscience. Certains veulent croire au miracle. D'autres veulent le détruire ou le récupérer. Et beaucoup veulent surtout que tout redevienne comme avant, quitte à tordre la réalité.",
          ],
          imageSrc: longArcImages[2] ?? null,
          reverse: true,
        },
        {
          kicker: "L'intime",
          blockKey: "intimacy",
          titleHtml:
            "<span class=\"mn-title-line\">Comment aimer</span><span class=\"mn-title-line\">cet enfant qui</span><span class=\"mn-title-line\">n'est plus le même ?</span>",
          paragraphs: [
            "Camille et Soaz tentent de garder Noé au monde, de le protéger, de le ramener au quotidien, de rester mères face à ce qui leur échappe. Mais elles portent des absences différentes, et des passés qui ne se ressemblent pas autant qu'elles le croyaient.",
            "Soaz comprend, à la seconde où Noé revient, que quelque chose va remonter avec lui. Camille, elle, s'accroche à l'évidence du retour. Entre elles, la tension grandit en silence.",
          ],
          imageSrc: longArcImages[3] ?? null,
          reverse: false,
        },
        {
          kicker: "La science",
          blockKey: "science",
          titleHtml: "<span class=\"mn-title-line\">Un regard différent.</span>",
          paragraphs: [
            "Vera apporte une cohérence, une forme de rationalité : des signes, des indices, une réponse scientifique possible. Son travail donne un poids au mystère. Et si ce phénomène suit une logique, alors il pourrait se reproduire, s'étendre, intéresser d'autres regards que ceux de la ville et rendre la situation incontrôlable.",
          ],
          imageSrc: longArcImages[5] ?? null,
          reverse: false,
        },
      ],
      seaImage: longArcImages[4] ?? null,
      investigationQuoteHtml:
        "À mesure que Vikram avance,<br>l'enquête éclaire la ville<br>autant que la disparition.",
      watchers: {
        kicker: "Les Veilleurs",
        titleHtml:
          "<span class=\"mn-title-line\">Lenn invente le narratif qui</span><span class=\"mn-title-line\">soulage les consciences.</span>",
        paragraphs: [
          "Lenn a transformé ces huit années en quelque chose. Il a fédéré autour de lui des gens qui ne supportaient pas l'inaction. Avec le temps, ce groupe s'est resserré, s'est donné des rites et un symbole : un bracelet noué en signe d'appartenance, de dette partagée, de mission.",
          "Le Braz a toujours su, lui. Il a vu des choses près de la digue il y a longtemps. Le retour de Noé ne le soulage pas, il le terrifie. Cette fracture entre les deux hommes dit quelque chose d'essentiel sur ce que les Veilleurs sont en train de devenir.",
        ],
        gridImages: [longArcImages[6] ?? null, longArcImages[7] ?? null],
        cliffImage: longArcImages[8] ?? null,
      },
      seaConclusion: {
        kicker: "La mer",
        titleHtml:
          "<span class=\"mn-title-line\">Ce qu'elle</span><span class=\"mn-title-line\">donne,</span><span class=\"mn-title-line\">elle le</span><span class=\"mn-title-line\">compte.</span>",
        paragraphs: [
          "Noé s'en approche chaque nuit. Il se réveille, il se lève, il fixe la direction de la digue avec une attention que sa tête ne comprend pas mais que son corps reconnaît. Quelque chose d'ancien, de profond, comme si une partie de lui était restée là-bas et cherchait à revenir.",
          "La saison progresse ainsi : révélations et conséquences. Chaque vérité arrachée au passé déclenche une réaction immédiate dans le présent. Jusqu'au moment où tout converge vers la digue, vers l'endroit que personne ne voulait regarder.",
          "L'enquête finit par livrer une réponse humaine, ancrée, dérangeante. Et au moment où la ville croit pouvoir reprendre son souffle, la mer rappelle sa loi : ce qu'elle donne, elle le compte.",
        ],
      },
      finalImage: longArcImages[9] ?? null,
      finalActionLabel: "Lancer le test",
    },
    dossier: {
      story: {
        kicker: "Le récit",
        title: "Huit ans après sa disparition, Noé réapparaît sur la côte. Vivant. Il n'a pas vieilli.",
        paragraphs: [
          "Où était-il pendant tout ce temps, et pourquoi revient-il maintenant ? À mesure que l'enquête reprend, la ville se fracture : une partie cherche à comprendre, une autre veut reprendre le contrôle, une troisième cherche à transformer l'inexplicable en récit utile.",
          "Depuis huit ans, sa disparition est la plaie que cette ville a appris à ne pas toucher. Un deuil sans corps, une enquête classée, un silence qui a fini par ressembler à de la paix. Son retour éventre ce fragile équilibre.",
          "Autour de la digue, des maisons, du port et des falaises, chacun projette sur Noé une vérité différente. Marée Noire ne raconte pas seulement une enquête : la série met à nu ce qu'une communauté fait du manque, du doute et de l'inacceptable.",
        ],
        images: [...pitchImages.slice(0, 1), ...diveImages.slice(0, 2)],
      },
      intrigue: {
        kicker: "Plongée dans l'intrigue",
        title: "Un retour impossible, une ville à vif, une mer qui ne rend jamais sans contrepartie.",
        paragraphs: [
          "Un promeneur longe le rivage. Dans l'écume, une forme. Un enfant gisant sur le sable. Il retourne le corps. L'enfant ouvre les yeux. C'est Noé.",
          "Ce retour rouvre immédiatement ce que tout le monde avait refermé comme il pouvait : l'enquête, la culpabilité, les loyautés locales, les récits intimes qu'on avait bâtis pour survivre.",
          "Marée Noire avance comme un thriller de côte et de matière, où le réel se fissure sans jamais basculer dans le spectaculaire facile. Tout y est affaire de seuil, de contamination et de vérité impossible à contenir.",
        ],
      },
      characters: {
        kicker: "Les personnages",
        intro:
          "Chacun porte la ville à sa façon. Chacun lit le retour de Noé à travers son propre manque, sa propre mémoire ou sa propre obsession.",
        items: [
          {
            name: "Iroise",
            meta: "42 ans · Infirmière · Cheffe des pompiers volontaires",
            standfirst:
              "Elle connaît les noms, les visages, les histoires et les failles de chaque habitant·e. Cette ville est son territoire.",
            paragraphs: [
              "Iroise est une enfant du pays au sens le plus charnel du terme. Son grand-père pêchait au large, son père aussi. Elle a choisi de rester et de tenir.",
              "Le retour de Noé l'oblige à regarder autrement tout ce qu'elle croyait stable : les corps, les habitudes, les certitudes, la confiance dans ceux qu'elle protège.",
              "Elle incarne la ligne de crête de la série : celle qui veut comprendre sans se laisser avaler par ce que la ville préfère taire.",
            ],
            image: getSectionImages(legacyBody, "s6_perso_iroise.html")[0] ?? null,
          },
          {
            name: "Soaz & Camille",
            meta: "46 ans · Sellière / 44 ans · Illustratrice jeunesse",
            standfirst:
              "Elles ont traversé l'absence ensemble. Elles vont découvrir qu'elles n'ont pas survécu pour les mêmes raisons.",
            paragraphs: [
              "Soaz travaille seule dans son atelier, les mains dans le cuir, dans la matière et dans l'effort. Camille, elle, s'est reconstruite dans l'image, dans le récit, dans une forme de douceur plus fragile qu'il n'y paraît.",
              "Le retour de Noé ravive entre elles des tensions anciennes : ce qu'on a protégé, ce qu'on a tu, ce qu'on a réinventé pour pouvoir continuer à vivre.",
              "À travers elles, Marée Noire regarde comment l'intime, le couple et le deuil collectif se déforment quand le réel revient frapper à la porte.",
            ],
            image: getSectionImages(legacyBody, "s6_perso_soaz_camille.html")[0] ?? null,
          },
          {
            name: "Vera",
            meta: "37 ans · Biologiste marine",
            standfirst:
              "Elle est venue avec des certitudes scientifiques. Elle repart avec quelque chose qu'aucune équation ne peut contenir.",
            paragraphs: [
              "Vera vit sur un vieux voilier qu'elle déplace au gré de ses missions. Ici, elle pensait observer, mesurer, comprendre.",
              "Le retour de Noé fissure sa posture rationnelle : les phénomènes qu'elle pensait contenir dans des données débordent, contaminent, troublent jusqu'à sa propre perception.",
              "Avec elle, la série ouvre la porte de la mer comme milieu, force et matière narrative, pas seulement comme décor.",
            ],
            image: getSectionImages(legacyBody, "s6_perso_vera.html")[0] ?? null,
          },
          {
            name: "Vikram",
            meta: "43 ans · Commissaire",
            standfirst:
              "Il a classé le dossier Noé il y a huit ans. Ce que ça lui a coûté, il commence seulement à le mesurer.",
            paragraphs: [
              "Vikram est arrivé ici par mutation. Il devait repartir, puis il est resté. Il a bâti une vie tranquille sur cette côte et sur ce qu'il pensait avoir refermé.",
              "Le retour de Noé fait remonter tout ce qu'il a rangé sous l'autorité, la méthode, le dossier clos. Il comprend que le prix d'une enquête classée ne disparaît jamais vraiment.",
              "Son regard fait basculer la série dans une vraie tension de thriller : ce qui a été enterré par prudence peut revenir comme faute active.",
            ],
            image: getSectionImages(legacyBody, "s6_perso_vikram.html")[0] ?? null,
          },
          {
            name: "Lenn",
            meta: "54 ans · Ancien instituteur · Fondateur des Veilleurs",
            standfirst:
              "Il a appris à lire à une génération entière. Il sait parler, convaincre, tenir une salle. Dans une petite ville, ce capital vaut de l'or.",
            paragraphs: [
              "Lenn transforme le manque en récit collectif. Il donne une forme, une parole, une consolation, et c'est précisément ce qui le rend dangereux.",
              "Les Veilleurs offrent à la ville une manière de croire, de tenir, de relier l'inexplicable à une structure, à une mission, à une morale.",
              "À travers lui, Marée Noire interroge la façon dont une communauté fabrique des autorités spirituelles quand le réel la dépasse.",
            ],
            image: getSectionImages(legacyBody, "lenn.html")[0] ?? null,
          },
          {
            name: "Le Braz",
            meta: "Âge incertain · Ancien ouvrier",
            standfirst:
              "Il connaît ce lieu autrement que les autres. De l'intérieur, littéralement. Et c'est là qu'il a vu quelque chose.",
            paragraphs: [
              "Le Braz est une figure périphérique de la ville : on le connaît, on l'évite un peu, on ne sait jamais trop quoi croire de ce qu'il raconte.",
              "Son savoir n'est pas académique, mais il est enraciné, souterrain, physique. Il a vu ce que d'autres refusent de regarder.",
              "Avec lui, la série fait entrer la mémoire ouvrière, la matière du lieu et un savoir trouble qui résiste aux explications officielles.",
            ],
            image: getSectionImages(legacyBody, "le_braz.html")[0] ?? null,
          },
          {
            name: "Noé",
            meta: "8 ans · Le disparu",
            standfirst:
              "Ce Noé-là n'est pas revenu. Celui qui est sorti de l'eau porte quelque chose qui n'appartient plus à l'enfance.",
            paragraphs: [
              "Les photos du salon racontent un enfant espiègle, curieux, vivant. Celui qui revient n'a pas vieilli, mais il n'est plus exactement lisible comme avant.",
              "Il concentre toutes les projections : miracle, anomalie, menace, preuve, appel, faute à réparer. Personne ne regarde le même enfant.",
              "Noé n'est pas seulement le mystère de la série. Il en est aussi la blessure vivante, le centre magnétique et le révélateur de tout ce qui craque.",
            ],
            image: getSectionImages(legacyBody, "noe.html")[0] ?? null,
          },
        ],
      },
      arenas: {
        kicker: "Les arènes",
        sections: [
          {
            title: "La ville",
            paragraphs: [
              "La ville fonctionne comme toutes les petites villes de bord de mer : hiérarchies invisibles, solidarités de façade, mémoires sélectives. On s'y connaît depuis toujours, ce qui signifie qu'on se doit des choses, qu'on se surveille et qu'on se couvre.",
              "Ce que le retour de Noé révèle, c'est que cet équilibre n'était pas de la paix mais une gestion élégante du refoulé.",
            ],
          },
          {
            title: "La mer et la digue",
            paragraphs: [
              "La mer n'est pas un décor. Elle est l'autre système de vérité de la série : une force, une matière, une loi. La digue, elle, est le seuil où les mondes se touchent.",
              "Chaque déplacement vers l'eau engage un autre niveau de lecture : sensoriel, collectif, intime. C'est là que Marée Noire devient pleinement elle-même.",
            ],
          },
        ],
        gallery: arenaImages.slice(0, 6),
      },
      season: {
        kicker: "La saison",
        beats: [
          "Dans cette petite ville de bord de mer, la réapparition inexplicable de Noé fissure immédiatement l'équilibre que tout le monde protégeait.",
          "Vikram rouvre l'enquête et découvre que le dossier clos repose sur beaucoup plus de compromis qu'il ne l'admettait.",
          "Iroise tente de maintenir le réel en place pendant que la communauté glisse vers des récits concurrents, des alliances cassées et des zones de contamination.",
          "Soaz, Camille et Vera sont forcées de relire leurs propres loyautés à la lumière de ce retour qui rend tout à nouveau instable.",
          "Les Veilleurs, sous l'influence de Lenn, offrent au phénomène une forme de croyance et déplacent encore davantage le centre de gravité de la ville.",
          "La saison converge vers une vérité qui n'efface rien : la mer rappelle sa loi, et ce qu'elle donne, elle le compte.",
        ],
        outro:
          "Marée Noire tient ainsi sa promesse de thriller fantastique : un retour impossible, une ville contaminée par le doute, et une matière profondément sensorielle où chaque réponse ouvre une question plus troublante.",
      },
    },
    footerLinks: [
      { href: "/mentions-legales", label: "Mentions légales" },
      { href: "/confidentialite", label: "Confidentialité" },
      { href: "/cgu", label: "CGU" },
      { href: "/cookies", label: "Cookies" },
    ],
  };
}
