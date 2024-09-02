import React from 'react';

const About: React.FC = () => {
  return (
    <section>
      <div className="container mx-auto px-4">
        <div className='m-6 w-4/5 md:w-4/5 sm:w-full mx-auto flex flex-col bg-zinc-50 border-2 border-stone-200 rounded-xl shadow-lg opacity-60 text-black'>
          <h2 className="p-4 text-3xl font-extrabold underline">Welcome!</h2>
          <p className="p-4 text-lg font-mono">
            Thanks for dropping by my site! I'm a software developer from sunny Southern California, and I'm currently based in Queens. I like web frameworks, dev tools, and obscure code editor themes.
          </p>
          <p className="p-4 text-lg font-mono">
            Reach out to me at
            {' '}
            <span className='text-blue-700 underline'>
              <a href='mailto:randytsao24@gmail.com'>randytsao24@gmail.com</a>
            </span>
            , check out my work info at my
            {' '}
            <span className='text-blue-700 underline'>
              <a href='https://www.linkedin.com/in/randy-tsao/'>LinkedIn</a>
            </span>
            , or see some really outdated repos at my
            {' '}
            <span className='text-blue-700 underline'>
              <a href='https://github.com/randytsao24'>GitHub</a>
            </span>
            . I currently work at
            {' '}
            <span className='text-blue-700 underline'>
              <a href='https://www.ventera.com/'>Ventera</a>
            </span>
            .
          </p>
        </div>
        <div className='m-6 w-4/5 md:w-1/2 mx-auto flex flex-col bg-zinc-50 border-2 border-stone-200 rounded-xl shadow-lg opacity-60 text-black'>
          <h2 className="p-4 text-3xl font-extrabold underline">More to come...</h2>
          <p className="p-4 text-lg font-mono">
            I'm currently dabbling in game development (specifically the Godot game engine), and the plan is to host some kind of 2D game on this site, as I've never actually applied my professional skillset to something truly creative. Stay tuned for more.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
