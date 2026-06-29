import { TextbausteineView } from "@/components/textbausteine/textbausteine-view";
import { getTextbausteine } from "@/lib/textbausteine/storage";

export const dynamic = "force-dynamic";

export default async function TextbausteinePage() {
  const items = await getTextbausteine();

  return <TextbausteineView initialItems={items} />;
}
