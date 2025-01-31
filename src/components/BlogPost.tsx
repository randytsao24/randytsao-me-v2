import React, { FC } from "react";

interface BlogPostProps {
  content: string;
  date: string;
  title: string;
}

const BlogPost: FC<BlogPostProps> = ({ title, date, content }) => {
  return (
    <article className="prose max-w-4xl mx-auto">
      <h1>{title}</h1>
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-600">{date}</span>
      </div>
      <p>{content}</p>
    </article>
  );
};

export default BlogPost;
