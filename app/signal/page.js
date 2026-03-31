import { redirect } from "next/navigation";
import { PANEL_PUBLIC_CATALOGUE_PATH } from "../../lib/public-paths";

export function generateMetadata() {
  return {
    title: "Catalogue | Give Me The Pitch",
  };
}

export default function SignalCataloguePage() {
  redirect(PANEL_PUBLIC_CATALOGUE_PATH);
}
