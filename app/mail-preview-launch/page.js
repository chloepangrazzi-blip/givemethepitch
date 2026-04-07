import { buildPanelLaunchEmailHtml } from "../../lib/access-email";

export const metadata = {
  title: "Mail Preview Launch",
};

export default function MailPreviewLaunchPage() {
  const html = buildPanelLaunchEmailHtml({
    fullName: "Chloe Pangrazzi",
    theRoomUrl: "https://www.givemethepitch.com/theroom?invite=OL-00001",
  });

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
