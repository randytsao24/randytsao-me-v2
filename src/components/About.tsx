import React, { FC } from "react";

const About: FC = () => {
  return (
    <section>
      <div className="container mx-auto px-4">
        <div className="m-6 w-full md:w-4/5 mx-auto relative opacity-80">
          <div className="bg-white/90 backdrop-blur-sm border-2 border-stone-300 rounded-xl shadow-2xl text-black relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-300 via-green-300 to-blue-400 opacity-60 rounded-t-xl"></div>
            <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-green-300 via-blue-300 to-green-400 opacity-60 rounded-b-xl"></div>
            <div className="absolute left-0 top-0 w-2 h-full bg-gradient-to-b from-blue-300 via-green-300 to-blue-400 opacity-60 rounded-l-xl"></div>
            <div className="absolute right-0 top-0 w-2 h-full bg-gradient-to-b from-green-300 via-blue-300 to-green-400 opacity-60 rounded-r-xl"></div>

            <div className="p-8">
              <h2 className="text-3xl font-extrabold underline mb-4">
                Welcome!
              </h2>
              <p className="text-lg font-mono mb-4">
                Thanks for dropping by my site! I'm a software developer from
                sunny Southern California and I'm currently based in Queens, New
                York. I like web frameworks, dev tools, and obscure code editor
                themes.
              </p>
              <p className="text-lg font-mono">
                Reach out to me at{" "}
                <span className="text-blue-700 underline">
                  <a href="mailto:randytsao24@gmail.com">
                    randytsao24@gmail.com
                  </a>
                </span>
                , check out my work info at my{" "}
                <span className="text-blue-700 underline">
                  <a href="https://www.linkedin.com/in/randy-tsao/">LinkedIn</a>
                </span>
                , or see some really outdated repos at my{" "}
                <span className="text-blue-700 underline">
                  <a href="https://github.com/randytsao24">GitHub</a>
                </span>
                . I currently work at{" "}
                <span className="text-blue-700 underline">
                  <a href="https://www.ventera.com/">Ventera</a>
                </span>
                .
              </p>
            </div>
          </div>
        </div>

        <div className="m-6 w-full md:w-4/5 mx-auto relative opacity-80">
          <div className="bg-white/90 backdrop-blur-sm border-2 border-stone-300 rounded-xl shadow-2xl text-black relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 via-blue-400 to-green-500 opacity-60 rounded-t-xl"></div>
            <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-green-400 to-blue-500 opacity-60 rounded-b-xl"></div>
            <div className="absolute left-0 top-0 w-2 h-full bg-gradient-to-b from-green-400 via-blue-400 to-green-500 opacity-60 rounded-l-xl"></div>
            <div className="absolute right-0 top-0 w-2 h-full bg-gradient-to-b from-blue-400 via-green-400 to-blue-500 opacity-60 rounded-r-xl"></div>

            <div className="p-8">
              <h2 className="text-3xl font-extrabold underline mb-4">
                Stuff I'm working on...
              </h2>
              <p className="text-lg font-mono mb-4">
                <span className="text-blue-700 underline">
                  <a href="https://emteeayy.fly.dev/">emteeayy</a>
                </span>
                {" - "}
                simple NYC subway and bus times
              </p>
              <p className="text-lg font-mono">
                jerb-getter - AI-assisted job posting analysis and retrieval
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
