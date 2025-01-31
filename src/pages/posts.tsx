import React, { FC } from "react";
import { useStaticQuery, graphql, Link } from "gatsby";
import type { HeadFC, PageProps } from "gatsby";

import MainLayout from "../components/MainLayout";

const BlogPage: FC<PageProps> = () => {
  const { allMarkdownRemark } = useStaticQuery(graphql`
    query PostsQuery {
      allMarkdownRemark {
        edges {
          node {
            id
            frontmatter {
              title
              date
              description
            }
          }
        }
      }
    }
  `);

  return (
    <div className="flex flex-col min-h-screen">
      <MainLayout>
        <h1>Blog</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allMarkdownRemark.edges.map(({ node }: any) => {
            const { frontmatter } = node;
            return (
              <Link to={`/blog/${node.id}`} key={node.id}>
                <article className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <h2>{frontmatter.title}</h2>
                  <p className="text-gray-600">
                    {new Date(frontmatter.date).toLocaleDateString()}
                  </p>
                  <p className="text-gray-700 mt-2">
                    {frontmatter.description}
                  </p>
                </article>
              </Link>
            );
          })}
        </div>
      </MainLayout>
    </div>
  );
};

export default BlogPage;

export const Head: HeadFC = () => <title>Randy Tsao | Blog</title>;
