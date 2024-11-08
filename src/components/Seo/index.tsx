import { graphql, useStaticQuery } from 'gatsby';
import * as React from 'react';
import { Helmet } from 'react-helmet';

interface SeoProps {
  description?: string;
  title: string;
  children?: React.ReactNode;
}

interface SiteMetadata {
  site: {
    siteMetadata: {
      title: string;
      description: string;
      author: {
        name: string;
        nickname: string;
      };
      ogImage: string;
    };
  };
}

const Seo = ({ description, title }: SeoProps): JSX.Element => {
  const { site } = useStaticQuery<SiteMetadata>(
    graphql`
      query {
        site {
          siteMetadata {
            title
            description
            author {
              name
              nickname
            }
            ogImage
          }
        }
      }
    `,
  );

  const metaDescription = description || site.siteMetadata.description;
  const metaTitle = title || site.siteMetadata.title;

  return (
    <Helmet
      htmlAttributes={{ lang: 'en' }}
      title={metaTitle}
      defaultTitle={site.siteMetadata.title}
      meta={[
        {
          property: 'og:title',
          content: metaTitle,
        },
        {
          property: 'og:site_title',
          content: metaTitle,
        },
        {
          name: 'description',
          content: metaDescription,
        },
        {
          property: 'og:description',
          content: metaDescription,
        },
        {
          property: 'og:author',
          content: site.siteMetadata.author.name,
        },
        {
          property: 'og:author',
          content: site.siteMetadata.author.nickname,
        },
        {
          property: 'og:image',
          content: site.siteMetadata.ogImage,
        },
        {
          property: 'og:type',
          content: 'website',
        },
      ]}
    />
  );
};

export default Seo;
