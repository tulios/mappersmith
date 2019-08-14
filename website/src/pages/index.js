/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react' // eslint-disable-line no-unused-vars
import classnames from 'classnames'
import Layout from '@theme/Layout' // eslint-disable-line no-unused-vars
import Link from '@docusaurus/Link' // eslint-disable-line no-unused-vars
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import withBaseUrl from '@docusaurus/withBaseUrl'
import styles from './styles.module.css'

const features = [
  {
    title: <>Lightweight</>,
    imageUrl: '',
    description: (
      <>Mappersmith is a lightweight rest client for node.js and the browser</>
    )
  },
  {
    title: <>Freeing your code</>,
    imageUrl: '',
    description: (
      <>
        Mappersmith creates a client for your API, gathering all configurations
        into a single place, freeing your code from HTTP configurations.
      </>
    )
  }
]

const Home = () => {
  const context = useDocusaurusContext()
  const { siteConfig = {} } = context

  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Mappersmith is a lightweight rest client for node.js and the browser. It creates a client for your API, gathering all configurations into a single place, freeing your code from HTTP configurations."
    >
      <header className={classnames('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link
              className={classnames(
                'button button--outline button--secondary button--lg',
                styles.getStarted
              )}
              to={withBaseUrl('docs/Installation')}
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        {!!features && features.length !== 0 && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map(({ imageUrl, title, description }, idx) => (
                  <div
                    key={idx}
                    className={classnames('col col--6', styles.feature)}
                  >
                    {imageUrl && (
                      <div className="text--center">
                        <img
                          className={styles.featureImage}
                          src={withBaseUrl(imageUrl)}
                          alt={title}
                        />
                      </div>
                    )}
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  )
}

export default Home
