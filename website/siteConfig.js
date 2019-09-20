/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// See https://docusaurus.io/docs/site-config for all the possible
// site configuration options.

const siteConfig = {
  title: 'Mappersmith',
  tagline: 'a lightweight rest client for node.js and the browser',
  url: 'https://tulios.github.io',
  baseUrl: '/mappersmith/',

  projectName: 'mappersmith',
  organizationName: 'tulios',

  headerLinks: [
    {
      doc: 'Installation',
      label: 'Docs',
    },
  ],

  /* path to images for header/footer */
  headerIcon: 'img/logo_white.svg',
  footerIcon: 'img/logo_white.svg',
  favicon: 'img/logo_black.ico',

  /* Colors for website */
  colors: {
    primaryColor: '#4a6286',
    secondaryColor: '#33445d',
  },

  // This copyright info is used in /core/Footer.js and blog RSS/Atom feeds.
  copyright: `Copyright © ${new Date().getFullYear()} Tulios`,

  highlight: {
    theme: 'github',
  },

  // Add custom scripts here that would be placed in <script> tags.
  scripts: ['https://buttons.github.io/buttons.js'],

  // On page navigation for the current documentation page.
  onPageNav: 'separate',
  // No .html extensions for paths.
  cleanUrl: true,

  // You may provide arbitrary config keys
  repoUrl: 'https://github.com/tulios/mappersmith',
}

module.exports = siteConfig
