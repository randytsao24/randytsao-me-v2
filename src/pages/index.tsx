import * as React from "react";
import type { HeadFC, PageProps } from "gatsby";

import Main from "../components/Main";

const IndexPage: React.FC<PageProps> = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Main />
    </div>
  );
};

export default IndexPage;

export const Head: HeadFC = () => <title>Home Page</title>;
