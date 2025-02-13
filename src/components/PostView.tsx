import React, { FC } from "react";

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
      <div className="bg-zinc-50 border-2 border-stone-200 rounded-xl shadow-lg p-6">
        <p className="text-lg text-gray-600">Select a post to read</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-50 border-2 border-stone-200 rounded-xl shadow-lg p-6">
      <h1 className="text-3xl font-extrabold mb-2">{post.frontmatter.title}</h1>
      <p className="text-gray-600 mb-4">
        {new Date(post.frontmatter.date).toLocaleDateString()}
      </p>
      <div className="prose max-w-none">
        <p className="text-lg italic text-gray-700 border-l-4 border-stone-300 pl-4 mb-8">
          {post.frontmatter.description}
        </p>
        <div
          className="text-lg font-mono [&>p]:mb-6 last:[&>p]:mb-0"
          dangerouslySetInnerHTML={{ __html: post.rawMarkdownBody }}
        />
      </div>
    </div>
  );
};

export default PostView;
