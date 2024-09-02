import React from "react";
import { Link } from "gatsby";

const Header: React.FC = () => {
  return (
    <header className="text-gray-800 py-4 px-4 sm:px-8 fixed w-full z-10 mt-2">
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
        <nav className="font-roboto">
          <ul className="flex space-x-2 sm:space-x-4">
            <li>
              <Link 
                to="/" 
                className="text-xl sm:text-lg transition duration-300 ease-in-out hover:text-gray-600 hover:bg-gray-200 hover:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded px-2 sm:px-3 py-1 sm:py-2"
                activeClassName="bg-gray-200 bg-opacity-70"
              >
                About
              </Link>
            </li>
            <li>
              <Link 
                to="/blog" 
                className="text-xl sm:text-lg transition duration-300 ease-in-out hover:text-gray-600 hover:bg-gray-200 hover:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded px-2 sm:px-3 py-1 sm:py-2"
                activeClassName="bg-gray-200 bg-opacity-70"
              >
                Blog
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
