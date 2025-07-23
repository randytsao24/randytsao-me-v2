import React, { FC, ReactNode } from "react";

import Header from "./Header";
import ThreeBackground from "./ThreeBackground";
import ClientOnly from "./ClientOnly";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  return (
    <>
      <ClientOnly>
        <ThreeBackground />
      </ClientOnly>
      <Header />
      <main className="flex-grow bg-gradient-to-br from-amber-100/80 via-yellow-50/70 to-amber-50/80 relative">
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
