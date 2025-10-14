import React from "react";
import { Box } from "@mui/material";
import { FeedPost as FeedPostType } from "../../../types/posts";
import PostFactory from "./posts/PostFactory";

interface FeedPostProps {
  post: FeedPostType;
  isClosed?: boolean;
}

const FeedPost: React.FC<FeedPostProps> = ({ post, isClosed = false }) => {
  return (
    <Box
      sx={{
        mb: 2,
        bgcolor: "background.paper",
        borderRadius: 3,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        border: "1px solid",
        borderColor: "divider",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          transform: "translateY(-2px)",
          borderColor: "primary.light",
        },
        "&:last-child": {
          mb: 0,
        },
      }}
    >
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <PostFactory post={post} isClosed={isClosed} />
      </Box>
    </Box>
  );
};

export default FeedPost;