import React from "react";
import { FeedPost as FeedPostType } from "../../../../types/posts";
import SleepPost from "./SleepPost";
import AttendancePost from "./AttendancePost";
import FoodPost from "./FoodPost";

interface PostFactoryProps {
  post: FeedPostType;
  isClosed?: boolean;
}

const PostFactory: React.FC<PostFactoryProps> = ({ post, isClosed }) => {
  switch (post.type) {
    case "SleepPost":
      return <SleepPost post={post} isClosed={isClosed} />;
    case "AttendancePost":
      return <AttendancePost post={post} />;
    case "FoodPost":
      return <FoodPost post={post} />;
    default:
      return null;
  }
};

export default PostFactory;
