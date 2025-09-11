import React, { useEffect, useState } from "react";
import { assets, dummyPostsData } from "../assets/assets";
import Loading from "../components/Loading";
import StoriesBar from "../components/StoriesBar";
import PostCard from "../components/PostCard";
import RecentMessages from "../components/RecentMessages";

const Feed = () => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeeds = async () => {
    setFeeds(dummyPostsData);
    setLoading(false);
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  return !loading ? (
    <div className="h-full overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-start xl:gap-8">
      {/* Stories and Post Lists */}
      <div className="flex-1 max-w-3xl lg:max-w-4xl xl:max-w-5xl">
        <StoriesBar />
        <div className="p-4 space-y-7">
          {feeds.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>

{/* Right Sidebar */}
<div className="max-xl:hidden sticky top-0 w-120 flex-shrink-0">
  <div className="bg-white text-xs p-4 rounded-md inline-flex flex-col gap-2 shadow w-full">
    <h3 className="text-slate-800 font-semibold">Sponsored</h3>
    <img
      src={assets.sponsored_img}
      className="w-full h-50 rounded-md"
      alt=""
    />
    <p className="text-slate-600">Email Marketing</p>
    <p className="text-slate-400">
      Supercharge your marketing with a powerful, easy-to-use platform
      built for results.
    </p>
  </div>
  <RecentMessages />
</div>

    </div>
  ) : (
    <Loading />
  );
};

export default Feed;
