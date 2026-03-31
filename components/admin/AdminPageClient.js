"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Paris",
  }).format(new Date(value));
}

function formatScore(value) {
  if (value == null || value === "") {
    return "-";
  }

  const score = Number(value);
  return Number.isFinite(score) ? `${score.toFixed(2)}/100` : String(value);
}

function Section({ title, children, subtitle }) {
  return (
    <section style={styles.section}>
      <div style={styles.sectionHeader}>
        <div>
          <h2 style={styles.sectionTitle}>{title}</h2>
          {subtitle ? <p style={styles.sectionSubtitle}>{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function LoginForm({ configured }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    startTransition(async () => {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setError(payload.error || "Connexion admin impossible.");
        return;
      }

      router.refresh();
    });
  };

  return (
    <main style={styles.shell}>
      <section style={styles.loginCard}>
        <h1 style={styles.pageTitle}>Admin GMTP</h1>
        <p style={styles.sectionSubtitle}>
          {configured
            ? "Accès privé lancement. Mot de passe requis."
            : "ADMIN_PASSWORD n'est pas configuré côté serveur."}
        </p>
        <form onSubmit={handleSubmit} style={styles.loginForm}>
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            style={styles.input}
            disabled={!configured || isPending}
          />
          <button type="submit" style={styles.primaryButton} disabled={!configured || isPending}>
            {isPending ? "Connexion..." : "Entrer"}
          </button>
        </form>
        {error ? <p style={styles.error}>{error}</p> : null}
      </section>
    </main>
  );
}

export default function AdminPageClient({ authenticated, configured, initialData }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");
  const [activeReportId, setActiveReportId] = useState("");
  const [isPending, startTransition] = useTransition();

  const restitutions = useMemo(() => initialData?.restitutions || [], [initialData]);
  const storiesProjects = useMemo(() => initialData?.storiesProjects || [], [initialData]);

  const handleLogout = async () => {
    await fetch("/api/admin/session", { method: "DELETE" });
    router.refresh();
  };

  const handlePublish = (reportId) => {
    setFeedback("");
    setActiveReportId(reportId);

    startTransition(async () => {
      const response = await fetch("/api/reports/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, publish: true }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setFeedback(payload.error || "Publication impossible.");
        setActiveReportId("");
        return;
      }

      setFeedback("Restitution générée et publiée.");
      setActiveReportId("");
      router.refresh();
    });
  };

  if (!authenticated) {
    return <LoginForm configured={configured} />;
  }

  return (
    <main style={styles.shell}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>Admin GMTP</h1>
          <p style={styles.sectionSubtitle}>
            Outil de lancement : restitutions, publication et suivi Stories.
          </p>
        </div>
        <button type="button" style={styles.secondaryButton} onClick={handleLogout}>
          Se déconnecter
        </button>
      </header>

      {feedback ? <p style={styles.success}>{feedback}</p> : null}

      <Section
        title="Restitutions"
        subtitle="Une ligne = un rapport SIGNAL. Le bouton génère le document HTML, l’envoie dans Storage puis publie le projet."
      >
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Projet</th>
                <th>Campagne</th>
                <th>Statut</th>
                <th>Échantillon</th>
                <th>Score</th>
                <th>Fichier</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {restitutions.map((report) => (
                <tr key={report.id}>
                  <td>
                    <strong>{report.project?.name || "-"}</strong>
                    <div style={styles.metaText}>{report.project?.code || "-"}</div>
                  </td>
                  <td>
                    <strong>{report.campaign?.name || "-"}</strong>
                    <div style={styles.metaText}>{report.campaign?.code || "-"}</div>
                  </td>
                  <td>{report.status || "-"}</td>
                  <td>{report.sampleSize ?? "-"}</td>
                  <td>{formatScore(report.score)}</td>
                  <td style={styles.pathCell}>{report.reportStoragePath || "-"}</td>
                  <td>
                    <button
                      type="button"
                      style={styles.primaryButton}
                      onClick={() => handlePublish(report.id)}
                      disabled={isPending && activeReportId === report.id}
                    >
                      {isPending && activeReportId === report.id
                        ? "Publication..."
                        : "Générer et publier"}
                    </button>
                  </td>
                </tr>
              ))}
              {!restitutions.length ? (
                <tr>
                  <td colSpan={7} style={styles.empty}>
                    Aucune restitution trouvée.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="Projets Stories"
        subtitle="Lecture rapide de ce qui est en scoring, prêt à publier ou déjà en vente."
      >
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Projet</th>
                <th>Statut</th>
                <th>Pack</th>
                <th>Score</th>
                <th>Fin scoring</th>
                <th>Mise en vente</th>
                <th>Restitution</th>
              </tr>
            </thead>
            <tbody>
              {storiesProjects.map((project) => (
                <tr key={project.id}>
                  <td>
                    <strong>{project.name}</strong>
                    <div style={styles.metaText}>
                      {project.code} · {project.genre || "-"} · {project.format || "-"}
                    </div>
                  </td>
                  <td>{project.status || "-"}</td>
                  <td>{project.pack || "-"}</td>
                  <td>{formatScore(project.score)}</td>
                  <td>{formatDate(project.dateFinScoring)}</td>
                  <td>{formatDate(project.dateMiseEnVente)}</td>
                  <td style={styles.pathCell}>{project.restitutionStoragePath || "-"}</td>
                </tr>
              ))}
              {!storiesProjects.length ? (
                <tr>
                  <td colSpan={7} style={styles.empty}>
                    Aucun projet Stories trouvé.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Section>
    </main>
  );
}

const styles = {
  shell: {
    minHeight: "100vh",
    background: "#f4f0e8",
    color: "#191612",
    padding: "32px",
    fontFamily: 'Georgia, "Times New Roman", serif',
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "24px",
  },
  loginCard: {
    maxWidth: "420px",
    margin: "10vh auto 0",
    background: "#fffdf9",
    border: "1px solid #191612",
    padding: "28px",
  },
  loginForm: {
    display: "grid",
    gap: "12px",
    marginTop: "16px",
  },
  input: {
    border: "1px solid #191612",
    background: "#fffdf9",
    padding: "12px 14px",
    fontSize: "16px",
  },
  pageTitle: {
    margin: 0,
    fontSize: "34px",
    lineHeight: 1.05,
  },
  section: {
    background: "#fffdf9",
    border: "1px solid #191612",
    padding: "20px",
    marginBottom: "18px",
  },
  sectionHeader: {
    marginBottom: "16px",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "24px",
  },
  sectionSubtitle: {
    margin: "8px 0 0",
    fontSize: "15px",
    lineHeight: 1.5,
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  metaText: {
    marginTop: "4px",
    opacity: 0.72,
    fontSize: "12px",
  },
  pathCell: {
    maxWidth: "280px",
    wordBreak: "break-word",
    fontSize: "12px",
  },
  primaryButton: {
    border: "1px solid #191612",
    background: "#191612",
    color: "#fffdf9",
    padding: "10px 14px",
    cursor: "pointer",
    fontSize: "14px",
  },
  secondaryButton: {
    border: "1px solid #191612",
    background: "#fffdf9",
    color: "#191612",
    padding: "10px 14px",
    cursor: "pointer",
    fontSize: "14px",
  },
  success: {
    background: "#e4f2e2",
    border: "1px solid #2f5e2a",
    padding: "12px 14px",
    marginBottom: "18px",
  },
  error: {
    color: "#8b1e1e",
    marginTop: "12px",
  },
  empty: {
    textAlign: "center",
    padding: "16px",
    opacity: 0.7,
  },
};
