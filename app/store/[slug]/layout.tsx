import { Store, Product } from "@/store/useAppStore";
import SeoProvider from "@/components/SeoProvider";

function makeAbsolute(path?: string, domain?: string, slug?: string) {
  if (!path) return undefined;

  // If already absolute
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  // Use custom domain if present, else fallback to slug.zeevo.shop
  const base = domain
    ? domain.startsWith("http") ? domain : `https://${domain}`
    : `https://${slug}.zeevo.shop`;

  return base.replace(/\/$/, "") + (path.startsWith("/") ? path : `/${path}`);
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/store/by/${slug}`,
      { next: { revalidate: 300 } } // cache for 5 mins
    );

    if (!res.ok) throw new Error("Failed to fetch store data");
    const { data: store }: { data: Store } = await res.json();

    const baseUrl = store.domain
      ? store.domain.startsWith("http")
        ? store.domain
        : `https://${store.domain}`
      : `https://${store.slug}.zeevo.shop`;

    const logoUrl = makeAbsolute(store.logo, store.domain, store.slug);
    const heroUrl = makeAbsolute(store.heroImage, store.domain, store.slug);

    return {
      title: store.name || "Online Store",
      description:
        store.description ||
        "Welcome to our online store. Shop our curated collection of products.",
      keywords: [
        "Online Store",
        "Shop",
        "E-commerce",
        store.name,
        ...((store.products || []).map((p: Product) => p.name) || []).slice(0, 5),
      ].filter(Boolean),
      openGraph: {
        title: store.name,
        description:
          store.description ||
          "Welcome to our online store. Shop our curated collection of products.",
        url: baseUrl,
        siteName: store.name,
        locale: "en_US",
        type: "website",
        images: [
          ...(logoUrl
            ? [
                {
                  url: logoUrl,
                  width: 512,
                  height: 512,
                  alt: `${store.name} Logo`,
                },
              ]
            : []),
          ...(heroUrl
            ? [
                {
                  url: heroUrl,
                  width: 1200,
                  height: 630,
                  alt: `${store.name} Banner`,
                },
              ]
            : []),
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: store.name,
        description:
          store.description ||
          "Welcome to our online store. Shop our curated collection of products.",
        creator: store.socialLinks?.twitter || undefined,
        images: [logoUrl || heroUrl || `${baseUrl}/store-banner.jpg`],
      },
      icons: {
        icon: logoUrl || `${baseUrl}/store-icon.png`,
        shortcut: logoUrl || `${baseUrl}/store-icon.png`,
        apple: logoUrl || `${baseUrl}/store-icon.png`,
      },
      metadataBase: new URL(baseUrl),
    };
  } catch (error) {
    console.error("Metadata generation failed:", error);

    // fallback if API fails
    return {
      title: "Online Store",
      description:
        "Welcome to our online store. Shop our curated collection of products.",
      openGraph: {
        title: "Online Store",
        description:
          "Welcome to our online store. Shop our curated collection of products.",
        type: "website",
        locale: "en_US",
      },
    };
  }
}

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  let storeData: Store | null = null;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/store/by/${slug}`,
      { next: { revalidate: 300 } }
    );
    if (res.ok) {
      const { data } = await res.json();
      storeData = data;
    }
  } catch (error) {
    console.error("Error fetching store data:", error);
  }

  if (storeData) {
    storeData.logo = makeAbsolute(storeData.logo, storeData.domain, storeData.slug);
    storeData.heroImage = makeAbsolute(storeData.heroImage, storeData.domain, storeData.slug);
  }

  return (
    <>
      <SeoProvider initialStore={storeData} />
      {children}
    </>
  );
}
