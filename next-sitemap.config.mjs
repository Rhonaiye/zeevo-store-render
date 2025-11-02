/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://zeevo.shop',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/*', '/private*'],
      },
    ],
    additionalSitemaps: [
      // Add our dynamic sitemap
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://zeevo.shop'}/api/sitemap.xml`,
    ],
  },
  exclude: ['/api/*', '/private*'],
}