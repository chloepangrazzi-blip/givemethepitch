import {
  buildAccessEmailHtml,
  buildPanelCampaignClosingEmailHtml,
  buildPanelLaunchEmailHtml,
  buildPanelLaunchAccessReminderEmailHtml,
  buildPanelLaunchStartReminderEmailHtml,
} from "../../lib/access-email";
import { getCataloguePageData } from "../../lib/catalogue-data";
import { buildPanelVoteUrl } from "../../lib/panel-launch";
import { PANEL_PUBLIC_KEYACCESS_PATH } from "../../lib/public-paths";

export const metadata = {
  title: "Mail Preview",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function MailPreviewPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const rawVariant = Array.isArray(resolvedSearchParams?.variant)
    ? resolvedSearchParams.variant[0]
    : resolvedSearchParams?.variant;
  const variant = String(rawVariant || "access").toLowerCase();

  const voteOptions = getCataloguePageData("signal").projects
    .filter((project) => project.id !== "maree-noire")
    .map((project) => ({
      id: project.id,
      title: project.title,
      genre: project.genre,
      format: project.format,
      shortPitch: project.shortPitch,
      voteUrl: buildPanelVoteUrl("https://www.givemethepitch.com", {
        operationCode: "OL-00001",
        projectId: project.id,
      }),
    }));

  const htmlByVariant = {
    access: buildAccessEmailHtml({
      fullName: "Chloe Pangrazzi",
      accessCode: "A1B2C3",
      keyaccessUrl: `https://www.givemethepitch.com${PANEL_PUBLIC_KEYACCESS_PATH}`,
    }),
    launch: buildPanelLaunchEmailHtml({
      fullName: "Chloe Pangrazzi",
      theRoomUrl: "https://www.givemethepitch.com/theroom?invite=OL-00001",
    }),
    "reminder-start": buildPanelLaunchStartReminderEmailHtml({
      fullName: "Chloe Pangrazzi",
      theRoomUrl: "https://www.givemethepitch.com/theroom?invite=OL-00001",
    }),
    "reminder-access": buildPanelLaunchAccessReminderEmailHtml({
      fullName: "Chloe Pangrazzi",
      accessCode: "A1B2C3",
      keyaccessUrl: `https://www.givemethepitch.com${PANEL_PUBLIC_KEYACCESS_PATH}?code=A1B2C3`,
      ndaAlreadySigned: true,
    }),
    reminder: buildPanelLaunchStartReminderEmailHtml({
      fullName: "Chloe Pangrazzi",
      theRoomUrl: "https://www.givemethepitch.com/theroom?invite=OL-00001",
    }),
    closing: buildPanelCampaignClosingEmailHtml({
      fullName: "Chloe Pangrazzi",
      voteOptions,
    }),
  };

  const html = htmlByVariant[variant] || htmlByVariant.access;

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
