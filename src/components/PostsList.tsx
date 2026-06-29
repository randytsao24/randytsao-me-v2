import React, { FC, useMemo } from "react";

interface Post {
  id: string;
  frontmatter: {
    title: string;
    date: string;
    description: string;
  };
  rawMarkdownBody: string;
}

interface PostsListProps {
  posts: Post[];
  selectedPost: Post | null;
  onSelectPost: (post: Post) => void;
}

const PostsList: FC<PostsListProps> = ({
  posts,
  selectedPost,
  onSelectPost,
}) => {
  const sortedPosts = useMemo(
    () =>
      [...posts].sort(
        (a, b) =>
          new Date(b.frontmatter.date).getTime() -
          new Date(a.frontmatter.date).getTime()
      ),
    [posts]
  );

  const truncateTitle = (title: string, maxLength: number = 50) => {
    return title.length > maxLength
      ? `${title.substring(0, maxLength)}...`
      : title;
  };

  const MobileSelect = () => (
    <div className="w-full mb-6">
      <select
        value={selectedPost?.id || ""}
        onChange={(e) => {
          const selected = sortedPosts.find(
            (post) => post.id === e.target.value
          );
          if (selected) onSelectPost(selected);
        }}
        className="w-full p-3 bg-gradient-to-b from-[rgba(255,252,246,0.62)] to-[rgba(243,235,221,0.50)] backdrop-blur-md border border-[rgba(255,252,245,0.55)] rounded-2xl font-mono text-lg text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal/30"
      >
        {sortedPosts.map((post) => (
          <option key={post.id} value={post.id}>
            {truncateTitle(post.frontmatter.title)}
          </option>
        ))}
      </select>
    </div>
  );

  const DesktopList = () => (
    <div className="card-grain bg-gradient-to-b from-[rgba(255,252,246,0.62)] to-[rgba(243,235,221,0.50)] backdrop-blur-md border border-[rgba(255,252,245,0.55)] rounded-2xl shadow-[0_8px_30px_rgba(80,110,110,0.18)] ring-1 ring-[rgba(120,92,60,0.07)] p-6 h-[calc(100vh-200px)] overflow-y-auto max-w-xl mx-auto">
      <h2 className="inline-block text-2xl font-bold mb-4 pb-1 text-stone-800 border-b-2 border-teal font-mono">Posts</h2>
      <div className="space-y-3">
        {sortedPosts.map((post) => (
          <div
            key={post.id}
            onClick={() => onSelectPost(post)}
            className={`cursor-pointer p-4 rounded-xl transition-colors font-mono ${
              selectedPost?.id === post.id
                ? "bg-teal/10 border border-teal/30"
                : "hover:bg-[rgba(255,252,246,0.5)]"
            }`}
          >
            <h3 className="font-bold text-stone-800">
              {truncateTitle(post.frontmatter.title)}
            </h3>
            <p className="text-sm text-stone-500 font-mono">
              {new Date(post.frontmatter.date).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <div className="md:hidden">
        <MobileSelect />
      </div>
      <div className="hidden md:block">
        <DesktopList />
      </div>
    </>
  );
};

export default PostsList;
