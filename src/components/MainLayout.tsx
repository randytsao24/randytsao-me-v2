import React from 'react';

import About from './About';
import Header from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <>
    <Header />
      <main className="flex-grow bg-gradient-to-br from-amber-200 via-yellow-100 to-orange-100">
        <div className="container mx-auto px-4 py-20 pt-24">
          <div className="flex flex-col items-center justify-center">
            {children}
          </div>
        </div>
      </main>
    </>
  );
};

export default MainLayout;
