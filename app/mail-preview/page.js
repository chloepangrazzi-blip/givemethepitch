import { buildAccessEmailHtml } from "../../lib/access-email";

export const metadata = {
  title: "Mail Preview",
};

export default function MailPreviewPage() {
  const html = buildAccessEmailHtml({
    fullName: "Chloe Pangrazzi",
    accessCode: "A1B2C3",
    keyaccessUrl: "https://www.givemethepitch.com/keyaccess",
  });

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
