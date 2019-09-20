/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react')

const styles = {
  badgeWrapper: {
    textAlign: 'right',
  },
  badge: {
    // marginRight: 5,
  },
}

class Footer extends React.Component {
  docUrl = (doc, language) => {
    const baseUrl = this.props.config.baseUrl
    const docsUrl = this.props.config.docsUrl
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`
    const langPart = `${language ? `${language}/` : ''}`

    return `${baseUrl}${docsPart}${langPart}${doc}`
  }

  pageUrl = (doc, language) => `${this.props.config.baseUrl}${language ? `${language}/` : ''}${doc}`

  render() {
    return (
      <footer className="nav-footer" id="footer">
        <section className="sitemap">
          <a href={this.props.config.baseUrl} className="nav-home">
            {this.props.config.footerIcon && (
              <img
                src={this.props.config.baseUrl + this.props.config.footerIcon}
                alt={this.props.config.title}
                width="66"
                height="58"
              />
            )}
          </a>
          <div>
            <a href="https://github.com/tulios/mappersmith">GitHub</a>
            <a
              className="github-button"
              href={this.props.config.repoUrl}
              data-icon="octicon-star"
              data-count-href="/tulios/mappersmith"
              data-show-count="true"
              data-count-aria-label="# stargazers on GitHub"
              aria-label="Star this project on GitHub"
            >
              Star
            </a>
          </div>

          <div style={styles.badgeWrapper}>
            <a href="https://travis-ci.org/tulios/mappersmith" style={styles.badge}>
              <img alt="licence" src="https://img.shields.io/travis/tulios/mappersmith?style=flat" />
            </a>

            <a href="https://www.npmjs.com/package/mappersmith" style={styles.badge}>
              <img alt="npm downloads" src="https://img.shields.io/npm/dm/mappersmith.svg?style=flat" />
            </a>

            <a href="https://github.com/tulios/mappersmith/blob/master/LICENSE" style={styles.badge}>
              <img alt="licence" src="https://img.shields.io/npm/l/mappersmith.svg?style=flat" />
            </a>

            <a href="https://www.npmjs.com/package/mappersmith?activeTab=versions" style={styles.badge}>
              <img alt="npm" src="https://img.shields.io/npm/v/mappersmith" />
            </a>

            <a href="https://snyk.io/test/github/tulios/mappersmith" style={styles.badge}>
              <img alt="snyk" src="https://snyk.io/test/github/tulios/mappersmith/badge.svg" />
            </a>
          </div>
        </section>

        <section className="copyright">{this.props.config.copyright}</section>
      </footer>
    )
  }
}

module.exports = Footer
