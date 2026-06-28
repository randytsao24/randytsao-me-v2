import React, { FC } from "react";
import { Link } from "gatsby";

const Header: FC = () => {
  const titleStyles = `
    font-mono
    rounded px-2 sm:px-3 py-1 sm:py-2
    border-2 border-black
    shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
    sm:transition-all sm:duration-200
    sm:hover:bg-black sm:hover:text-white
    sm:active:shadow-none sm:active:translate-x-[3px] sm:active:translate-y-[3px]
    focus:outline-none focus:ring-2 focus:ring-gray-500
  `;

  return (
    <header className="text-gray-800 py-6 px-6 w-full z-50 bg-transparent absolute top-0 left-0 right-0">
      <div className="mx-auto flex justify-start items-center">
        <h1 className="text-2xl sm:text-2xl font-bold font-mono relative">
          <Link to="/" className={titleStyles}>
            Randy Tsao
          </Link>
        </h1>
      </div>
    </header>
  );
};

export default Header;
