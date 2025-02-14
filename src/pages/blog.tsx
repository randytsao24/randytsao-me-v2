import React, { FC, useState } from "react";
import { useStaticQuery, graphql } from "gatsby";
import type { HeadFC, PageProps } from "gatsby";
import MainLayout from "../components/MainLayout";
import PostsList from "../components/PostsList";
import PostView from "../components/PostView";

interface Post {
  id: string;
  frontmatter: {
    title: string;
    date: string;
    description: string;
  };
  rawMarkdownBody: string;
}

const BlogPage: FC<PageProps> = () => {
  const { allMarkdownRemark } = useStaticQuery(graphql`
    query PostsQuery {
      allMarkdownRemark {
        edges {
          node {
            id
            rawMarkdownBody
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

  const [selectedPost, setSelectedPost] = useState<Post | null>(
    allMarkdownRemark.edges[0]?.node || null
  );

  const posts = allMarkdownRemark.edges.map(({ node }: any) => node);

  return (
    <div className="flex flex-col min-h-screen">
      <MainLayout>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:gap-6">
            <div className="md:w-1/3">
              <PostsList
                posts={posts}
                selectedPost={selectedPost}
                onSelectPost={setSelectedPost}
              />
            </div>
            <div className="md:w-2/3">
              <PostView post={selectedPost} />
            </div>
          </div>
        </div>
      </MainLayout>
    </div>
  );
};

export default BlogPage;

export const Head: HeadFC = () => <title>Randy Tsao | Blog</title>;
