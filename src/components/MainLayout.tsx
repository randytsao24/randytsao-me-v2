import React, { FC, ReactNode } from "react";

import Header from "./Header";
import ImpressionistBeach from "./ImpressionistBeach";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  return (
    <>
      <Header />
      <ImpressionistBeach />
      <main className="flex-grow relative">
        <div className="container mx-auto px-4 py-16 pt-20">
          <div className="flex flex-col items-center justify-center">
            {children}
          </div>
        </div>
      </main>
    </>
  );
};

export default MainLayout;
