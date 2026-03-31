import ProducerAccessPageClient from "../../../components/producteur/ProducerAccessPageClient";
import { getKeyAccessPageData } from "../../../lib/keyaccess-page";

export const metadata = {
  title: "Accès Producteur | Stories",
};

export default function ProducerAccessPage() {
  const page = getKeyAccessPageData();
  return <ProducerAccessPageClient styles={page?.styles || []} />;
}
