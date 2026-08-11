import { createFileRoute } from "@tanstack/react-router";
import BookingPage from "@/pages/BookingPage";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/book/$businessLink")({
  loader: async ({ params }) => {
    try {
      const { data } = await supabase.rpc("get_business_public_data", {
        business_booking_link: params.businessLink,
      });
      const business: any = data?.[0] ?? null;
      return { business, businessLink: params.businessLink };
    } catch {
      return { business: null, businessLink: params.businessLink };
    }
  },
  head: (ctx) => {
    const business = (ctx.loaderData as any)?.business;
    const link = (ctx.loaderData as any)?.businessLink ?? "";
    if (!business) return {};
    const title = `Book with ${business.name} | bójí`;
    const description =
      business.description ||
      `Book an appointment with ${business.name} on bójí.`;
    const image =
      business.logo_url || business.banner_url || "https://bojiapp.me/boji-logo.png";
    const url = `https://bojiapp.me/book/${link}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: image },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:image", content: image },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: BookingPage,
});