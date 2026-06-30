import React, { FC } from "react";

const About: FC = () => {
  // Card glass driven by CSS custom properties set by MainLayout.
  // The properties --card-bg-start, --card-bg-end, --card-border, --card-shadow,
  // --card-ring, --text-color, --link-color, --link-hover-color are updated
  // every 500ms by the time-of-day system. CSS transitions on the card provide
  // smooth DOM-side interpolation between updates.
  const cardClass =
    "card-grain bg-gradient-to-b from-[var(--card-bg-start)] to-[var(--card-bg-end)] backdrop-blur-md border border-[var(--card-border)] rounded-2xl shadow-[0_8px_30px_var(--card-shadow)] ring-1 ring-[var(--card-ring)] text-[var(--text-color)] transition-all duration-1000 ease-out hover:-translate-y-0.5 hover:shadow-[0_14px_40px_var(--card-shadow)]";

  const linkClass = "text-[var(--link-color)] hover:text-[var(--link-hover-color)] underline";

  return (
    <section>
      <div className="container mx-auto px-4">
        <div className="m-6 w-full md:w-4/5 mx-auto relative">
          <div className={cardClass}>
            {/* relative z-10 lifts text above the .card-grain ::before overlay */}
            <div className="p-8 relative z-10">
              <h2 className="inline-block text-3xl font-bold mb-4 pb-1 text-[var(--text-color)] border-b-2 border-[var(--link-color)]">
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
                <a href="mailto:randytsao24@gmail.com" className={linkClass}>
                  randytsao24@gmail.com
                </a>
                , check out my work info at my{" "}
                <a href="https://www.linkedin.com/in/randy-tsao/" className={linkClass}>
                  LinkedIn
                </a>
                , or see some really outdated repos at my{" "}
                <a href="https://github.com/randytsao24" className={linkClass}>
                  GitHub
                </a>
                . I currently work at{" "}
                <a href="https://www.ventera.com/" className={linkClass}>
                  Ventera
                </a>
                .
              </p>
            </div>
          </div>
        </div>

        <div className="m-6 w-full md:w-4/5 mx-auto relative">
          <div className={cardClass}>
            {/* relative z-10 lifts text above the .card-grain ::before overlay */}
            <div className="p-8 relative z-10">
              <h2 className="inline-block text-3xl font-bold mb-4 pb-1 text-[var(--text-color)] border-b-2 border-[var(--link-color)]">
                Stuff I'm working on...
              </h2>
              <p className="text-lg font-mono mb-4 leading-relaxed">
                <a href="https://emteeayy.fly.dev/" className={linkClass}>
                  emteeayy
                </a>
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
