import * as React from "react";
import type { HeadFC, PageProps } from "gatsby";

import MainLayout from "../components/MainLayout";

const BlogPage: React.FC<PageProps> = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <MainLayout>
        <h1>THIS IS A PLACEHOLDER MY FRIEND</h1>
      </MainLayout>
    </div>
  );
};

export default BlogPage;

export const Head: HeadFC = () => <title>Randy Tsao | Blog</title>;
