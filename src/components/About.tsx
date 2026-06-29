import React, { FC } from "react";

const About: FC = () => {
  return (
    <section>
      <div className="container mx-auto px-4">
        <div className="m-6 w-full md:w-4/5 mx-auto relative">
          <div className="bg-white/55 backdrop-blur-md border border-white/40 rounded-2xl shadow-[0_8px_30px_rgba(80,110,110,0.18)] ring-1 ring-black/5 text-stone-800 relative">
            <div className="p-8">
              <h2 className="text-3xl font-bold mb-4 text-stone-800">
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
                <span className="text-blue-900 underline">
                  <a href="mailto:randytsao24@gmail.com">
                    randytsao24@gmail.com
                  </a>
                </span>
                , check out my work info at my{" "}
                <span className="text-blue-900 underline">
                  <a href="https://www.linkedin.com/in/randy-tsao/">LinkedIn</a>
                </span>
                , or see some really outdated repos at my{" "}
                <span className="text-blue-900 underline">
                  <a href="https://github.com/randytsao24">GitHub</a>
                </span>
                . I currently work at{" "}
                <span className="text-blue-900 underline">
                  <a href="https://www.ventera.com/">Ventera</a>
                </span>
                .
              </p>
            </div>
          </div>
        </div>

        <div className="m-6 w-full md:w-4/5 mx-auto relative">
          <div className="bg-white/55 backdrop-blur-md border border-white/40 rounded-2xl shadow-[0_8px_30px_rgba(80,110,110,0.18)] ring-1 ring-black/5 text-stone-800 relative">
            <div className="p-8">
              <h2 className="text-3xl font-bold mb-4 text-stone-800">
                Stuff I'm working on...
              </h2>
              <p className="text-lg font-mono mb-4">
                <span className="text-blue-900 underline">
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
