import React, { FC } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";

interface Post {
  id: string;
  frontmatter: {
    title: string;
    date: string;
    description: string;
  };
  rawMarkdownBody: string;
}

interface PostViewProps {
  post: Post | null;
}

const PostView: FC<PostViewProps> = ({ post }) => {
  if (!post) {
    return (
      <div className="card-grain bg-gradient-to-b from-[rgba(255,252,246,0.62)] to-[rgba(243,235,221,0.50)] backdrop-blur-md border border-[rgba(255,252,245,0.55)] rounded-2xl shadow-[0_8px_30px_rgba(80,110,110,0.18)] ring-1 ring-[rgba(120,92,60,0.07)] p-6 mx-1 sm:mx-0 h-[calc(100vh-200px)] overflow-y-auto">
        <p className="text-lg text-stone-500 font-mono">Select a post to read</p>
      </div>
    );
  }

  return (
    <div className="card-grain bg-gradient-to-b from-[rgba(255,252,246,0.62)] to-[rgba(243,235,221,0.50)] backdrop-blur-md border border-[rgba(255,252,245,0.55)] rounded-2xl shadow-[0_8px_30px_rgba(80,110,110,0.18)] ring-1 ring-[rgba(120,92,60,0.07)] p-6 mx-1 sm:mx-0 w-[calc(100%-0.5rem)] sm:w-full h-[calc(100vh-200px)] overflow-y-auto">
      <h1 className="inline-block text-3xl font-bold mb-4 pb-1 text-stone-800 border-b-2 border-teal font-mono">{post.frontmatter.title}</h1>
      <p className="text-stone-500 mb-4 font-mono">
        {new Date(post.frontmatter.date).toLocaleDateString()}
      </p>
      <div className="prose max-w-none">
        <p className="text-lg italic text-stone-700 border-l-4 border-teal/30 pl-4 mb-8 font-mono">
          {post.frontmatter.description}
        </p>
        <div className="text-lg font-mono leading-relaxed">
          <ReactMarkdown
            className="whitespace-pre-wrap"
            remarkPlugins={[remarkBreaks]}
          >
            {post.rawMarkdownBody}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default PostView;
