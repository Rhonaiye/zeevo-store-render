/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://zeevo.shop',
  generateRobotsTxt: true,
  exclude: ['/api/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/*'],
      },
    ],
  },
  // Disable static sitemap generation since we're using a dynamic one
  generateIndexSitemap: false,
  outDir: 'public',
  transform: async (config, path) => {
    // Return null for any paths we don't want in the static sitemap
    return null;
  },
}
