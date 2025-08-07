/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://zeevo.shop', // Replace with your domain
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: 'daily',
  priority: 0.7,
  exclude: ['/private-page'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },
}
