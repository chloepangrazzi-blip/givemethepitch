import { buildAccessEmailHtml } from "../../lib/access-email";
import { PANEL_PUBLIC_KEYACCESS_PATH } from "../../lib/public-paths";

export const metadata = {
  title: "Mail Preview",
};

export default function MailPreviewPage() {
  const html = buildAccessEmailHtml({
    fullName: "Chloe Pangrazzi",
    accessCode: "A1B2C3",
    keyaccessUrl: `https://www.givemethepitch.com${PANEL_PUBLIC_KEYACCESS_PATH}`,
  });

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
