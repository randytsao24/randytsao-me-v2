import React, { FC } from "react";

const About: FC = () => {
  const cardClass =
    "card-grain bg-gradient-to-b from-[rgba(255,252,246,0.62)] to-[rgba(243,235,221,0.50)] backdrop-blur-md border border-[rgba(255,252,245,0.55)] rounded-2xl shadow-[0_8px_30px_rgba(80,110,110,0.18)] ring-1 ring-[rgba(120,92,60,0.07)] text-stone-800 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(80,110,110,0.24)]";

  return (
    <section>
      <div className="container mx-auto px-4">
        <div className="m-6 w-full md:w-4/5 mx-auto relative">
          <div className={cardClass}>
            {/* relative z-10 lifts text above the .card-grain ::before overlay */}
            <div className="p-8 relative z-10">
              <h2 className="inline-block text-3xl font-bold mb-4 pb-1 text-stone-800 border-b-2 border-teal">
                Welcome!
              </h2>
              <p className="text-lg font-mono mb-4 leading-relaxed">
                Thanks for dropping by my site! I'm a software developer from
                sunny Southern California and I'm currently based in Queens, New
                York. I like web frameworks, dev tools, and obscure code editor
                themes.
              </p>
              <p className="text-lg font-mono leading-relaxed">
                Reach out to me at{" "}
                <span className="text-[#1A5453] hover:text-[#0F3C3B] underline">
                  <a href="mailto:randytsao24@gmail.com">
                    randytsao24@gmail.com
                  </a>
                </span>
                , check out my work info at my{" "}
                <span className="text-[#1A5453] hover:text-[#0F3C3B] underline">
                  <a href="https://www.linkedin.com/in/randy-tsao/">LinkedIn</a>
                </span>
                , or see some really outdated repos at my{" "}
                <span className="text-[#1A5453] hover:text-[#0F3C3B] underline">
                  <a href="https://github.com/randytsao24">GitHub</a>
                </span>
                . I currently work at{" "}
                <span className="text-[#1A5453] hover:text-[#0F3C3B] underline">
                  <a href="https://www.ventera.com/">Ventera</a>
                </span>
                .
              </p>
            </div>
          </div>
        </div>

        <div className="m-6 w-full md:w-4/5 mx-auto relative">
          <div className={cardClass}>
            {/* relative z-10 lifts text above the .card-grain ::before overlay */}
            <div className="p-8 relative z-10">
              <h2 className="inline-block text-3xl font-bold mb-4 pb-1 text-stone-800 border-b-2 border-teal">
                Stuff I'm working on...
              </h2>
              <p className="text-lg font-mono mb-4 leading-relaxed">
                <span className="text-[#1A5453] hover:text-[#0F3C3B] underline">
                  <a href="https://emteeayy.fly.dev/">emteeayy</a>
                </span>
                {" - "}
                simple NYC subway and bus times
              </p>
              <p className="text-lg font-mono leading-relaxed">
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
