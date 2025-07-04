import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  IconButton,
  useTheme,
} from "@mui/material";
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";

interface PostContainerProps {
  id: string;
  publishDate: string;
  title: string;
  isLiked?: boolean;
  likeCount?: number;
  onLike?: (id: string) => void;
  onEdit?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  children: React.ReactNode; // The specific post content
}

const PostContainer: React.FC<PostContainerProps> = ({
  id,
  publishDate,
  title,
  isLiked = false,
  likeCount = 0,
  onLike,
  onEdit,
  onViewDetails,
  children,
}) => {
  const theme = useTheme();

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike?.(id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(id);
  };

  return (
    <Card
      sx={{
        mb: 2,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        transition: "all 0.3s ease",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
        },
      }}
      onClick={() => onViewDetails?.(id)}
    >
      <CardContent sx={{ p: 2.5 }}>
        {/* Header - Date and Edit */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontSize: "0.75rem",
            }}
          >
            {publishDate}
          </Typography>

          <IconButton
            size="small"
            onClick={handleEdit}
            sx={{
              color: "text.secondary",
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            mb: 2,
            fontSize: "1.1rem",
          }}
        >
          {title}
        </Typography>

        {/* Post Content - Rendered by child components */}
        <Box sx={{ mb: 2 }}>{children}</Box>

        {/* Footer - Reactions */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            pt: 1.5,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <IconButton
            size="small"
            onClick={handleLike}
            sx={{
              color: isLiked ? theme.palette.error.main : "text.secondary",
              borderRadius: "20px",
              padding: "8px",
              "&:hover": {
                bgcolor: isLiked
                  ? `${theme.palette.error.main}15`
                  : "action.hover",
                transform: "scale(1.1)",
              },
              transition: "all 0.2s ease",
            }}
          >
            {isLiked ? (
              <FavoriteIcon fontSize="small" />
            ) : (
              <FavoriteBorderIcon fontSize="small" />
            )}
          </IconButton>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontSize: "0.8rem",
              fontWeight: 500,
              ml: 0.5,
            }}
          >
            {likeCount}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PostContainer;
