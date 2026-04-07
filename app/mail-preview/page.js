import { buildAccessEmailHtml, buildPanelLaunchEmailHtml } from "../../lib/access-email";
import { PANEL_PUBLIC_KEYACCESS_PATH } from "../../lib/public-paths";

export const metadata = {
  title: "Mail Preview",
};

export const dynamic = "force-dynamic";

export default function MailPreviewPage({ searchParams }) {
  const variant = searchParams?.variant === "launch" ? "launch" : "access";
  const html =
    variant === "launch"
      ? buildPanelLaunchEmailHtml({
          fullName: "Chloe Pangrazzi",
          theRoomUrl: "https://www.givemethepitch.com/theroom?invite=OL-00001",
        })
      : buildAccessEmailHtml({
          fullName: "Chloe Pangrazzi",
          accessCode: "A1B2C3",
          keyaccessUrl: `https://www.givemethepitch.com${PANEL_PUBLIC_KEYACCESS_PATH}`,
        });

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
