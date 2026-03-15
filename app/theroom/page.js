import { notFound } from "next/navigation";
import TheRoomPageClient from "../../components/theroom/TheRoomPageClient";
import { getTheRoomPageData } from "../../lib/theroom-page";

export function generateMetadata() {
  const page = getTheRoomPageData();

  if (!page) {
    return {};
  }

  return {
    title: page.title || "Give Me The Pitch",
  };
}

export default function TheRoomPage() {
  const page = getTheRoomPageData();

  if (!page) {
    notFound();
  }

  return <TheRoomPageClient {...page} />;
}
