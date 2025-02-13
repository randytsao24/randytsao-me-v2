import React, { FC } from "react";

interface Post {
  id: string;
  frontmatter: {
    title: string;
    date: string;
    description: string;
  };
  html: string;
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
          const selected = posts.find((post) => post.id === e.target.value);
          if (selected) onSelectPost(selected);
        }}
        className="w-full p-3 bg-zinc-50 border-2 border-stone-200 rounded-xl font-mono text-lg focus:outline-none focus:ring-2 focus:ring-stone-300"
      >
        {posts.map((post) => (
          <option key={post.id} value={post.id}>
            {truncateTitle(post.frontmatter.title)}
          </option>
        ))}
      </select>
    </div>
  );

  const DesktopList = () => (
    <div className="bg-zinc-50 border-2 border-stone-200 rounded-xl shadow-lg p-4 h-[calc(100vh-200px)] overflow-y-auto">
      <h2 className="text-2xl font-extrabold mb-4 underline">Posts</h2>
      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            onClick={() => onSelectPost(post)}
            className={`cursor-pointer p-4 rounded-lg transition-colors ${
              selectedPost?.id === post.id
                ? "bg-blue-100 border-2 border-blue-200"
                : "hover:bg-gray-100"
            }`}
          >
            <h3 className="font-bold">
              {truncateTitle(post.frontmatter.title)}
            </h3>
            <p className="text-sm text-gray-600">
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
