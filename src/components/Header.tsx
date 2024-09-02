import React from "react";
import { Link } from "gatsby";

const Header: React.FC = () => {
  return (
    <header className="text-gray-800 py-4 px-8 fixed w-full z-10">
      <div className="mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold font-mono">
          <Link to="/" className="transition duration-300 ease-in-out hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded px-2 py-1">
            Randy Tsao
          </Link>
        </h1>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link 
                to="/" 
                className="transition duration-300 ease-in-out hover:text-gray-600 hover:bg-gray-200 hover:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded px-3 py-2"
                activeClassName="bg-gray-200 bg-opacity-70"
              >
                About
              </Link>
            </li>
            <li>
              <Link 
                to="/blog" 
                className="transition duration-300 ease-in-out hover:text-gray-600 hover:bg-gray-200 hover:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded px-3 py-2"
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
