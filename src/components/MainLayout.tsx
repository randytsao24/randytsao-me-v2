import React from 'react';

import Header from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <>
    <Header />
      <main className="flex-grow bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-50">
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
