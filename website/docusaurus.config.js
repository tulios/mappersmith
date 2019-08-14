/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
  title: 'Mappersmith',
  tagline: 'is a lightweight rest client for node.js and the browser',
  url: 'https://tulios.github.io/mappersmith',
  baseUrl: '/',
  favicon: 'img/logo_black.svg',
  organizationName: 'tulios', // Usually your GitHub org/user name.
  projectName: 'mappersmith', // Usually your repo name.
  themeConfig: {
    navbar: {
      title: 'Mappersmith',
      logo: {
        alt: 'Mappersmith logo',
        src: 'img/logo_white.svg'
      },
      links: [
        { to: 'docs/Installation', label: 'Docs', position: 'left' },
        {
          href: 'https://github.com/tulios/mappersmith',
          label: 'GitHub',
          position: 'right'
        }
      ]
    },
    footer: {
      style: 'dark',
      logo: {
        alt: 'Mappersmith logo',
        src: 'img/logo_white.svg'
      },
      copyright: `Copyright © ${new Date().getFullYear()} Tulios. Built with Docusaurus.`
    }
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js')
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css')
        }
      }
    ]
  ]
}
