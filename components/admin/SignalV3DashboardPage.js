const DIMENSION_ITEM_LABELS = {
  hook_discovery_score: "Découverte",
  curiosity_score: "Curiosité",
  felt_something_score: "Ressenti",
  atmosphere_stay_score: "Atmosphère",
  character_intrigue_score: "Intrigue",
  character_fate_interest_score: "Destin",
  continue_intent_score: "Continuer",
  watch_intent_score: "Regarder",
  recommendation_score: "Recommander",
  talkability_score: "En parler",
};

function formatScore(value, digits = 1) {
  if (value == null || value === "") {
    return "—";
  }

  const number = Number(value);
  if (!Number.isFinite(number)) {
    return "—";
  }

  return number % 1 === 0 ? String(number) : number.toFixed(digits);
}

function formatRaw(value) {
  if (value == null || value === "") {
    return "—";
  }

  const number = Number(value);
  if (!Number.isFinite(number)) {
    return "—";
  }

  return `${number % 1 === 0 ? number : number.toFixed(1)}/5`;
}

function scoreWidth(value, max = 100) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return "0%";
  }

  return `${Math.max(0, Math.min(100, (number / max) * 100))}%`;
}

function joinList(values) {
  return values?.length ? values.join(", ") : "—";
}

function SampleBadge({ sampleSize, isDemo }) {
  if (isDemo) {
    return <span style={styles.sampleBadgeDemo}>DÉMO UX — 30 réponses simulées</span>;
  }

  if (sampleSize === 1) {
    return <span style={styles.sampleBadgeWarning}>ÉCHANTILLON TEST — 1 réponse</span>;
  }

  if (!sampleSize) {
    return <span style={styles.sampleBadgeNeutral}>AUCUNE RÉPONSE</span>;
  }

  if (sampleSize < 10) {
    return <span style={styles.sampleBadgeWarning}>ÉCHANTILLON FAIBLE — {sampleSize} réponses</span>;
  }

  return <span style={styles.sampleBadge}>{sampleSize} réponses</span>;
}

function StatusPage({ title, detail, campaign }) {
  return (
    <main style={styles.shell}>
      <StatePanel title={title} detail={detail} campaign={campaign} />
    </main>
  );
}

function StatePanel({ title, detail, campaign }) {
  return (
    <section style={styles.statePanel}>
      <p style={styles.kicker}>SIGNAL V3</p>
      <h1 style={styles.stateTitle}>{title}</h1>
      <p style={styles.stateText}>{detail}</p>
      {campaign ? (
        <div style={styles.stateMeta}>
          <span>{campaign.code}</span>
          <span>{campaign.status || "—"}</span>
          <span>{campaign.projectVersion || "—"}</span>
          <span>{campaign.formVersion || "—"}</span>
        </div>
      ) : null}
    </section>
  );
}

function TopScore({ summary }) {
  return (
    <section style={styles.verdictSection}>
      <div style={styles.desirabilityBlock}>
        <p style={styles.kicker}>Verdict immédiat</p>
        <div style={styles.desirabilityNumber}>{formatScore(summary.desirabilityScore)}</div>
        <p style={styles.scoreLabel}>Desirability</p>
      </div>
      <div style={styles.dimensionGrid}>
        {summary.dimensions.map((dimension) => (
          <article key={dimension.key} style={styles.dimensionMini}>
            <div style={styles.miniHeader}>
              <span>{dimension.label}</span>
              <strong>{formatScore(dimension.score)}</strong>
            </div>
            <div style={styles.barTrack} aria-hidden="true">
              <span style={{ ...styles.barFill, width: scoreWidth(dimension.score) }} />
            </div>
          </article>
        ))}
      </div>
      <div style={styles.forceGrid}>
        <div style={styles.forcePanel}>
          <span style={styles.forceLabel}>Force</span>
          <strong>{joinList(summary.strongestDimensions)}</strong>
        </div>
        <div style={styles.forcePanelWeak}>
          <span style={styles.forceLabel}>Point faible</span>
          <strong>{joinList(summary.weakestDimensions)}</strong>
        </div>
      </div>
    </section>
  );
}

function DimensionDetails({ dimensions }) {
  return (
    <section style={styles.section}>
      <div style={styles.sectionHeader}>
        <p style={styles.kicker}>Détail des dimensions</p>
        <h2 style={styles.sectionTitle}>Les 10 items scorés</h2>
      </div>
      <div style={styles.detailGrid}>
        {dimensions.map((dimension) => (
          <article key={dimension.key} style={styles.dimensionCard}>
            <div style={styles.dimensionCardHeader}>
              <h3>{dimension.label}</h3>
              <strong>{formatScore(dimension.score)}</strong>
            </div>
            <div style={styles.cardBarTrack} aria-hidden="true">
              <span style={{ ...styles.cardBarFill, width: scoreWidth(dimension.score) }} />
            </div>
            <div style={styles.itemList}>
              {dimension.items.map((item) => (
                <div key={item.key} style={styles.itemRow}>
                  <span>{DIMENSION_ITEM_LABELS[item.key] || item.label}</span>
                  <strong>{formatRaw(item.average)}</strong>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Diagnostics({ diagnostics }) {
  const first = diagnostics[0] || {};

  return (
    <section style={styles.section}>
      <div style={styles.sectionHeader}>
        <p style={styles.kicker}>Indicateurs de lecture · hors score</p>
        <h2 style={styles.sectionTitle}>Pourquoi ?</h2>
      </div>
      <div style={styles.diagnosticsGrid}>
        <article style={styles.infoPanel}>
          <h3>Hook</h3>
          <dl style={styles.dl}>
            <dt>Réaction immédiate</dt>
            <dd>{first.immediateReactionLabel || "—"}</dd>
            <dt>Promesse</dt>
            <dd>{formatRaw(first.promiseClarityScore)}</dd>
          </dl>
        </article>
        <article style={styles.infoPanel}>
          <h3>Feel</h3>
          <dl style={styles.dl}>
            <dt>Univers</dt>
            <dd>{formatRaw(first.worldClarityScore)}</dd>
            <dt>Dramatique</dt>
            <dd>{formatRaw(first.dramaticClarityScore)}</dd>
            <dt>Émotionnel</dt>
            <dd>{formatRaw(first.emotionalClarityScore)}</dd>
            <dt>Émotion dominante</dt>
            <dd>{first.feelEmotion || "—"}</dd>
          </dl>
        </article>
        <article style={styles.infoPanel}>
          <h3>Care</h3>
          <dl style={styles.dl}>
            <dt>Personnages cités</dt>
            <dd>{joinList(first.carePersonnagesOptions)}</dd>
            <dt>Aucun personnage</dt>
            <dd>{first.aucunPersonnagePourLInstant ? "Oui" : "Non"}</dd>
            <dt>Risque personnages</dt>
            <dd>{first.risquePersonnagesPeuEngageants ? "Oui" : "Non"}</dd>
          </dl>
        </article>
        <article style={styles.infoPanel}>
          <h3>Continue</h3>
          <dl style={styles.dl}>
            <dt>Risques de décrochage</dt>
            <dd>{joinList(first.continueDecrocheOptions)}</dd>
          </dl>
        </article>
      </div>
    </section>
  );
}

function Verbatims({ groups }) {
  return (
    <section style={styles.section}>
      <div style={styles.sectionHeader}>
        <p style={styles.kicker}>Les mots du public</p>
        <h2 style={styles.sectionTitle}>Verbatims</h2>
      </div>
      <div style={styles.verbatimGrid}>
        {groups.map((group) => (
          <article key={group.key} style={styles.verbatimPanel}>
            <h3>{group.title}</h3>
            <div style={styles.verbatimList}>
              {group.items.length ? (
                group.items.map((item) => (
                  <blockquote key={item.id} style={styles.quote}>
                    “{item.text}”
                  </blockquote>
                ))
              ) : (
                <p style={styles.emptyText}>{group.empty}</p>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function RoomExperience({ rows }) {
  const first = rows[0] || {};

  return (
    <section style={styles.roomSection}>
      <div style={styles.sectionHeader}>
        <p style={styles.kickerRoom}>Expérience The Room</p>
        <h2 style={styles.roomTitle}>Lecture du matériau</h2>
      </div>
      <div style={styles.roomGrid}>
        <article style={styles.roomMetric}>
          <span>Fluidité de lecture</span>
          <strong>{formatRaw(first.readingFluidityScore)}</strong>
        </article>
        <article style={styles.roomMetric}>
          <span>Matériel suffisant</span>
          <strong>{formatRaw(first.materialSufficiencyScore)}</strong>
        </article>
        <article style={styles.roomMetric}>
          <span>Durée / longueur</span>
          <strong>{formatRaw(first.durationRelevanceScore)}</strong>
        </article>
      </div>
      {first.freeComment ? <p style={styles.roomComment}>“{first.freeComment}”</p> : null}
    </section>
  );
}

export default function SignalV3DashboardPage({ data }) {
  if (data.state === "error") {
    return (
      <StatusPage
        title="Lecture impossible"
        detail={data.error || "Une erreur est survenue pendant la lecture des vues SIGNAL V3."}
      />
    );
  }

  if (data.state === "missing_campaign") {
    return (
      <StatusPage
        title="Campagne introuvable"
        detail={`Aucune campagne ne correspond à ${data.campaignCode || "ce code"}.`}
      />
    );
  }

  if (data.state === "wrong_version") {
    return (
      <StatusPage
        title="Version non compatible"
        detail="Cette route affiche uniquement les campagnes Marée Noire SIGNAL V3."
        campaign={data.campaign}
      />
    );
  }

  if (data.state === "demo_blocked") {
    return (
      <StatusPage
        title="Mode démo indisponible"
        detail="Le mode démo SIGNAL V3 est réservé au développement local et ne peut pas être activé en production."
      />
    );
  }

  const sampleSize = data.summary?.sampleSize || 0;
  const isDemo = data.mode === "demo";

  return (
    <main style={styles.shell}>
      <header style={styles.header}>
        <div>
          <p style={styles.kicker}>Marée Noire · SIGNAL V3</p>
          <h1 style={styles.title}>{data.campaign?.name || "Marée Noire"}</h1>
          <div style={styles.metaLine}>
            <span>{data.campaignCode}</span>
            <span>{data.campaign?.status || "—"}</span>
            <span>{data.campaign?.projectVersion || "—"}</span>
            <span>{data.campaign?.formVersion || "—"}</span>
            <span>{isDemo ? "MODE DÉMO" : "MODE LIVE"}</span>
          </div>
        </div>
        <div style={styles.samplePanel}>
          <SampleBadge sampleSize={sampleSize} isDemo={isDemo} />
          <strong>{sampleSize}</strong>
          <span>réponse{sampleSize > 1 ? "s" : ""}</span>
        </div>
      </header>

      {data.state === "no_responses" ? (
        <StatePanel
          title="Aucune réponse SIGNAL V3"
          detail="La campagne existe, mais aucune réponse complétée et scorée n’est encore disponible."
          campaign={data.campaign}
        />
      ) : (
        <>
          <TopScore summary={data.summary} />
          <DimensionDetails dimensions={data.dimensionDetails} />
          <Diagnostics diagnostics={data.diagnostics} />
          <Verbatims groups={data.verbatimGroups} />
          <RoomExperience rows={data.roomExperience} />
        </>
      )}
    </main>
  );
}

const styles = {
  shell: {
    minHeight: "100vh",
    background: "#f7f3ea",
    color: "#171411",
    padding: "32px",
    fontFamily:
      'Georgia, "Times New Roman", ui-serif, Cambria, "Times New Roman", Times, serif',
  },
  header: {
    display: "flex",
    alignItems: "stretch",
    justifyContent: "space-between",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "26px",
  },
  kicker: {
    margin: "0 0 8px",
    color: "#7b3228",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0",
    textTransform: "uppercase",
  },
  kickerRoom: {
    margin: "0 0 8px",
    color: "#9fd1c8",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0",
    textTransform: "uppercase",
  },
  title: {
    margin: 0,
    maxWidth: "780px",
    fontSize: "56px",
    lineHeight: 0.94,
    fontWeight: 500,
    wordBreak: "break-word",
  },
  metaLine: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "16px",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "13px",
  },
  samplePanel: {
    minWidth: "220px",
    border: "1px solid #171411",
    background: "#fffdf8",
    padding: "18px",
    display: "grid",
    alignContent: "space-between",
    gap: "10px",
  },
  sampleBadge: {
    color: "#0f4f48",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "12px",
    fontWeight: 700,
  },
  sampleBadgeWarning: {
    color: "#8b2f22",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "12px",
    fontWeight: 800,
  },
  sampleBadgeNeutral: {
    color: "#5a534a",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "12px",
    fontWeight: 700,
  },
  sampleBadgeDemo: {
    color: "#5f2aa8",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "12px",
    fontWeight: 800,
  },
  verdictSection: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
    marginBottom: "22px",
  },
  desirabilityBlock: {
    background: "#171411",
    color: "#fffaf0",
    padding: "24px",
  },
  desirabilityNumber: {
    fontSize: "74px",
    lineHeight: 0.9,
  },
  scoreLabel: {
    margin: "10px 0 0",
    color: "#d9c9ad",
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  dimensionGrid: {
    display: "grid",
    gap: "10px",
  },
  dimensionMini: {
    border: "1px solid #171411",
    background: "#fffdf8",
    padding: "14px",
  },
  miniHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "15px",
  },
  barTrack: {
    display: "block",
    height: "8px",
    marginTop: "10px",
    background: "#e3d8c8",
  },
  barFill: {
    display: "block",
    height: "100%",
    background: "#0f665b",
  },
  forceGrid: {
    display: "grid",
    gap: "12px",
  },
  forcePanel: {
    border: "1px solid #0f665b",
    background: "#e6f2ee",
    padding: "18px",
  },
  forcePanelWeak: {
    border: "1px solid #8b2f22",
    background: "#f5e4de",
    padding: "18px",
  },
  forceLabel: {
    display: "block",
    marginBottom: "10px",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "12px",
    fontWeight: 700,
    textTransform: "uppercase",
  },
  section: {
    borderTop: "1px solid #171411",
    paddingTop: "24px",
    marginTop: "26px",
  },
  sectionHeader: {
    marginBottom: "16px",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "34px",
    lineHeight: 1,
    fontWeight: 500,
  },
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
  },
  dimensionCard: {
    border: "1px solid #171411",
    background: "#fffdf8",
    padding: "16px",
  },
  dimensionCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
  },
  cardBarTrack: {
    display: "block",
    height: "10px",
    margin: "12px 0",
    background: "#e3d8c8",
  },
  cardBarFill: {
    display: "block",
    height: "100%",
    background: "#7b3228",
  },
  itemList: {
    display: "grid",
    gap: "8px",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "14px",
  },
  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
  },
  diagnosticsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "12px",
  },
  infoPanel: {
    border: "1px solid #171411",
    background: "#fffdf8",
    padding: "16px",
  },
  dl: {
    display: "grid",
    gridTemplateColumns: "minmax(110px, 0.75fr) 1fr",
    gap: "8px 12px",
    margin: 0,
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "14px",
  },
  verbatimGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "14px",
  },
  verbatimPanel: {
    border: "1px solid #171411",
    background: "#fffdf8",
    padding: "18px",
    minHeight: "180px",
  },
  verbatimList: {
    display: "grid",
    gap: "10px",
    maxHeight: "320px",
    overflow: "auto",
  },
  quote: {
    margin: 0,
    padding: "12px 0 12px 14px",
    borderLeft: "3px solid #0f665b",
    lineHeight: 1.45,
  },
  emptyText: {
    margin: 0,
    color: "#6d6258",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "14px",
  },
  roomSection: {
    marginTop: "28px",
    background: "#171411",
    color: "#fffaf0",
    padding: "24px",
  },
  roomTitle: {
    margin: 0,
    fontSize: "34px",
    fontWeight: 500,
  },
  roomGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "12px",
  },
  roomMetric: {
    border: "1px solid #d9c9ad",
    padding: "16px",
    display: "grid",
    gap: "14px",
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  roomComment: {
    margin: "18px 0 0",
    paddingTop: "16px",
    borderTop: "1px solid #d9c9ad",
    fontSize: "18px",
    lineHeight: 1.45,
  },
  statePanel: {
    maxWidth: "720px",
    margin: "12vh auto 0",
    border: "1px solid #171411",
    background: "#fffdf8",
    padding: "28px",
  },
  stateTitle: {
    margin: 0,
    fontSize: "42px",
    lineHeight: 1,
  },
  stateText: {
    margin: "14px 0 0",
    fontFamily: "Arial, Helvetica, sans-serif",
    lineHeight: 1.5,
  },
  stateMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "18px",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "13px",
  },
};
