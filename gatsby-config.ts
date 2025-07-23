import type { GatsbyConfig } from "gatsby";

require("dotenv").config({ path: `.env` });

const config: GatsbyConfig = {
  siteMetadata: {
    title: `randytsao-me`,
    siteUrl: `https://randy-tsao.com`,
  },
  // More easily incorporate content into your pages through automatic TypeScript type generation and better GraphQL IntelliSense.
  // If you use VSCode you can also use the GraphQL plugin
  // Learn more at: https://gatsby.dev/graphql-typegen
  graphqlTypegen: true,
  flags: {
    DEV_SSR: false,
  },
  plugins: [
    "gatsby-plugin-postcss",
    "gatsby-plugin-decap-cms",
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `posts`,
        path: `${__dirname}/src/content/blog`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {},
    },
  ],
};

export default config;
