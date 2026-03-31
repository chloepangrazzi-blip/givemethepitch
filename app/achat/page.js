import PaymentPageClient from "../../components/payment/PaymentPageClient";
import { getPaymentPageData } from "../../lib/payment-page-data";

export function generateMetadata() {
  const page = getPaymentPageData();

  return {
    title: `${page.title} | Stories`,
  };
}

export default async function PaymentPage({ searchParams }) {
  const page = getPaymentPageData();
  const params = (await searchParams) || {};
  const selectedPackCode = typeof params.pack === "string" ? params.pack : null;

  return <PaymentPageClient page={page} selectedPackCode={selectedPackCode} />;
}
