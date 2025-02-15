import React, { FC, useState } from "react";
import { Link } from "gatsby";
import { useLocation } from "@reach/router";

const Header: FC = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isActive = (path: string) => location.pathname === path;

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
    rounded px-2 sm:px-3 py-1 sm:py-2
    border-2 border-black
    sm:transition-all sm:duration-200
    sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
    sm:active:shadow-none sm:active:translate-x-[3px] sm:active:translate-y-[3px]
    sm:hover:bg-black sm:hover:text-white
    focus:outline-none focus:ring-2 focus:ring-gray-500
  `;

  const mobileMenuStyles = `
    fixed top-0 left-0 right-0
    bg-white/90 backdrop-blur-sm
    transform transition-transform duration-300 ease-in-out
    ${isMenuOpen ? "translate-y-0" : "-translate-y-full"}
    flex justify-center items-center gap-4 py-4 px-4
    border-b-2 border-black
    sm:hidden
    z-40
  `;

  return (
    <header className="text-gray-800 py-4 px-4 sm:px-8 w-full z-50 bg-transparent absolute top-0 left-0 right-0">
      <div className="mx-auto flex justify-between items-center">
        <h1 className="text-2xl sm:text-2xl font-bold font-mono relative">
          <Link to="/" className={titleStyles}>
            Randy Tsao
          </Link>
        </h1>

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex gap-4 items-center">
          <Link to="/" className={linkStyles("/")}>
            Home
          </Link>
          <Link to="/blog" className={linkStyles("/blog/")}>
            Blog
          </Link>
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="sm:hidden p-2 focus:outline-none z-50"
          aria-label="Toggle menu"
        >
          <div className="w-6 h-5 relative flex flex-col justify-between">
            <span
              className={`w-full h-0.5 bg-black transition-opacity duration-300 ${
                isMenuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`w-full h-0.5 bg-black transition-opacity duration-300 ${
                isMenuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`w-full h-0.5 bg-black transition-opacity duration-300 ${
                isMenuOpen ? "opacity-0" : ""
              }`}
            />
          </div>
        </button>

        {/* Mobile Menu */}
        <div className={mobileMenuStyles}>
          <Link
            to="/"
            className={linkStyles("/")}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/blog"
            className={linkStyles("/blog/")}
            onClick={() => setIsMenuOpen(false)}
          >
            Blog
          </Link>
        </div>

        {/* Invisible Overlay for Click Outside */}
        {isMenuOpen && (
          <div
            className="fixed inset-0 z-30 sm:hidden"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />
        )}
      </div>
    </header>
  );
};

export default Header;
