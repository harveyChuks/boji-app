import { createFileRoute } from "@tanstack/react-router";
import FAQs from "@/pages/FAQs";

export const Route = createFileRoute("/faqs")({
  component: FAQs,
});