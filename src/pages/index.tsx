import React, { FC, useEffect } from "react";
import type { HeadFC, PageProps } from "gatsby";
import { Randalytics } from "randalytics";

import About from "../components/About";
import MainLayout from "../components/MainLayout";

const IndexPage: FC<PageProps> = () => {
  useEffect(() => {
    const analytics = Randalytics.getInstance();

    analytics.init();
  }, []);

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
