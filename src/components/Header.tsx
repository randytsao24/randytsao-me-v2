import React, { FC } from "react";
import { Link } from "gatsby";

const Header: FC = () => {
  return (
    <header className="text-gray-800 py-4 px-4 sm:px-8 w-full z-10 bg-transparent absolute top-0 left-0 right-0">
      <div className="mx-auto flex justify-between items-center">
        <h1 className="text-2xl sm:text-2xl font-bold font-mono relative">
          <Link
            to="/"
            className="
              transition duration-300 ease-in-out 
              hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 
              rounded px-2 sm:px-3 py-1 sm:py-2
              border-2 border-black
              shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]
              hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] sm:hover:translate-x-[5px] sm:hover:translate-y-[5px]
            "
          >
            Randy Tsao
          </Link>
        </h1>
      </div>
    </header>
  );
};

export default Header;
