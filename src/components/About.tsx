import React from 'react';

const About: React.FC = () => {
  return (
    <section>
      <div className="container mx-auto px-4">
        <div className='m-6 w-full md:w-4/5 mx-auto flex flex-col bg-zinc-50 border-2 border-stone-200 rounded-xl shadow-lg opacity-66 text-black'>
          <h2 className="p-4 text-3xl font-extrabold underline">Welcome!</h2>
          <p className="p-4 text-lg font-mono">
            Thanks for dropping by my site! I'm a software developer from sunny Southern California, and I'm currently based in Queens, New York. I like web frameworks, dev tools, and obscure code editor themes.
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
        <div className='m-6 w-full md:w-4/5 mx-auto flex flex-col bg-zinc-50 border-2 border-stone-200 rounded-xl shadow-lg opacity-66 text-black'>
          <h2 className="p-4 text-3xl font-extrabold underline">About the site...</h2>
          <p className="p-4 text-lg font-mono">
            I'm currently dabbling in game development (specifically the Godot game engine), and the plan is to host some kind of 2D game on this site along with some random blogposts about stuff I like, such as music, games, history, or travels.
          </p>
          <p className="p-4 text-lg font-mono">
            This site was built in{' '}
            <span className='text-blue-700 underline'>
              <a href='https://www.cursor.com/'>Cursor</a>
            </span>
            , a very nifty AI-first code editor which provides a pretty novel way to write code, especially when using Claude 3.5 Sonnet. This site is basically going to be a way for me to get acquainted with the brave new world of AI-driven software development.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
