import ContractPageClient from "../../components/contract/ContractPageClient";
import { getContractPageData } from "../../lib/contract-page-data";

export function generateMetadata() {
  const page = getContractPageData();

  return {
    title: `${page.title} | Stories`,
  };
}

export default async function ContractPage({ searchParams }) {
  const page = getContractPageData();
  const params = (await searchParams) || {};
  const selectedPackCode = typeof params.pack === "string" ? params.pack : null;

  return <ContractPageClient page={page} selectedPackCode={selectedPackCode} />;
}
