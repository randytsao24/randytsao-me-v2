import React, { FC } from "react";
import { Link } from "gatsby";
import { useLocation } from "@reach/router";

const Header: FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  console.log(location.pathname);

  const linkStyles = (path: string) => `
    font-mono text-lg
    transition-all duration-200
    rounded px-2 sm:px-3 py-1
    border-2 border-black
    shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
    active:shadow-none active:translate-x-[2px] active:translate-y-[2px]
    hover:bg-black hover:text-white
    focus:outline-none focus:ring-2 focus:ring-gray-500
    ${
      isActive(path)
        ? "bg-black text-white shadow-none translate-x-[2px] translate-y-[2px]"
        : ""
    }
  `;

  const titleStyles = `
    font-mono
    transition-all duration-200
    rounded px-2 sm:px-3 py-1 sm:py-2
    border-2 border-black
    shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
    active:shadow-none active:translate-x-[3px] active:translate-y-[3px]
    hover:bg-black hover:text-white
    focus:outline-none focus:ring-2 focus:ring-gray-500
  `;

  return (
    <header className="text-gray-800 py-4 px-4 sm:px-8 w-full z-10 bg-transparent absolute top-0 left-0 right-0">
      <div className="mx-auto flex justify-between items-center">
        <h1 className="text-2xl sm:text-2xl font-bold font-mono relative">
          <Link to="/" className={titleStyles}>
            Randy Tsao
          </Link>
        </h1>
        <nav className="flex gap-4 items-center">
          <Link to="/" className={linkStyles("/")}>
            Home
          </Link>
          <Link to="/blog" className={linkStyles("/blog/")}>
            Blog
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
