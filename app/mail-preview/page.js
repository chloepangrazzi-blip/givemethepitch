import {
  buildAccessEmailHtml,
  buildPanelCampaignClosingEmailHtml,
  buildPanelLaunchEmailHtml,
  buildPanelLaunchReminderEmailHtml,
} from "../../lib/access-email";
import { PANEL_PUBLIC_KEYACCESS_PATH } from "../../lib/public-paths";

export const metadata = {
  title: "Mail Preview",
};

export const dynamic = "force-dynamic";

export default async function MailPreviewPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const variant = String(resolvedSearchParams?.variant || "access").toLowerCase();

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
    reminder: buildPanelLaunchReminderEmailHtml({
      fullName: "Chloe Pangrazzi",
      theRoomUrl: "https://www.givemethepitch.com/theroom?invite=OL-00001",
    }),
    closing: buildPanelCampaignClosingEmailHtml({
      fullName: "Chloe Pangrazzi",
      voteUrl: "https://www.givemethepitch.com/catalogue",
    }),
  };

  const html = htmlByVariant[variant] || htmlByVariant.access;

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
