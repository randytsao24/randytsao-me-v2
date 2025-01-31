import React, { FC } from "react";
import type { HeadFC, PageProps } from "gatsby";

import About from "../components/About";
import MainLayout from "../components/MainLayout";

const IndexPage: FC<PageProps> = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <MainLayout>
        <About />
      </MainLayout>
    </div>
  );
};

export default IndexPage;

export const Head: HeadFC = () => <title>Randy Tsao</title>;
