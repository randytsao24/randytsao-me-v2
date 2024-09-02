import React from 'react';

const About: React.FC = () => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-extrabold mb-6 text-left underline">Hello, viewer.</h2>
        <p className="text-lg text-center max-w-2xl mx-auto">
          I'm a software engineer raised in Southern California and based in Queens, and I like to make cool things with other people.
        </p>
      </div>
    </section>
  );
};

export default About;
