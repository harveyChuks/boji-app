/** Always build public links against the live domain, never a preview/localhost origin. */
export const PUBLIC_SITE_URL = "https://bojiapp.me";

export const getPublicOrigin = () => {
  if (typeof window === "undefined") return PUBLIC_SITE_URL;
  const host = window.location.hostname;
  const isPreview = /localhost|127\.0\.0\.1|lovableproject\.com|lovable\.app|lovable\.dev/.test(host);
  return isPreview ? PUBLIC_SITE_URL : window.location.origin;
};

export const getBookingUrl = (bookingLink: string) => `${getPublicOrigin()}/book/${bookingLink}`;
