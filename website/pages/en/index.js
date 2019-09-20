/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react') // eslint-disable-line @typescript-eslint/no-var-requires

const CompLibrary = require('../../core/CompLibrary.js') // eslint-disable-line @typescript-eslint/no-var-requires

// const MarkdownBlock = CompLibrary.MarkdownBlock /* Used to read markdown */
const Container = CompLibrary.Container
const GridBlock = CompLibrary.GridBlock

const Button = props => (
  <div className="pluginWrapper buttonWrapper">
    <a className="button" href={props.href} target={props.target}>
      {props.children}
    </a>
  </div>
)

const createLinkGenerator = ({ siteConfig, language = '' }) => {
  const { baseUrl, docsUrl } = siteConfig
  const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`
  const langPart = `${language ? `${language}/` : ''}`
  return doc => `${baseUrl}${docsPart}${langPart}${doc}`
}

class HomeSplash extends React.Component {
  render() {
    const { siteConfig } = this.props
    const { baseUrl } = siteConfig
    const docUrl = createLinkGenerator(this.props)

    const SplashContainer = props => (
      <div className="homeContainer">
        <div className="homeSplashFade">
          <div className="wrapper homeWrapper">{props.children}</div>
        </div>
      </div>
    )

    const ProjectTitle = () => (
      <div>
        <img
          style={{ maxWidth: '350px' }}
          src={`${baseUrl}img/logo_black.svg`}
          alt={siteConfig.title}
          aria-label="https://github.com/tulios/mappersmith"
        />

        <h2 className="projectTitle">
          {siteConfig.title}

          <small>{siteConfig.tagline}</small>
        </h2>
      </div>
    )

    const PromoSection = props => (
      <div className="section promoSection">
        <div className="promoRow">
          <div className="pluginRowBlock">{props.children}</div>
        </div>
      </div>
    )

    return (
      <SplashContainer>
        <div className="inner">
          <ProjectTitle siteConfig={siteConfig} />
          <PromoSection>
            <Button href={docUrl('Installation')}>Documentation</Button>

            <Button target="_blank" href={siteConfig.repoUrl}>
              Github
            </Button>
          </PromoSection>
        </div>
      </SplashContainer>
    )
  }
}

class Index extends React.Component {
  render() {
    const { config: siteConfig, language = '' } = this.props
    // const docUrl = createLinkGenerator({ siteConfig, language })

    const Block = props => (
      <Container padding={['bottom', 'top']} id={props.id} background={props.background}>
        <GridBlock align="center" contents={props.children} layout={props.layout} />
      </Container>
    )

    const Features = props => (
      <div id="feature">
        <Block layout="fourColumn">
          {[
            {
              title: 'lightweight',
              content: `Mappersmith is a lightweight rest client for node.js and the browser`,
            },
            {
              title: 'Freeing your code',
              content: `Mappersmith creates a client for your API, gathering all configurations
              into a single place, freeing your code from HTTP configurations`,
            },
          ]}
        </Block>
      </div>
    )

    return (
      <div>
        <HomeSplash siteConfig={siteConfig} language={language} />

        <div className="mainContainer">
          <Features />
        </div>
      </div>
    )
  }
}

module.exports = Index
