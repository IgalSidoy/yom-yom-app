import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  IconButton,
  useTheme,
  Chip,
} from "@mui/material";
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  MoreVert as MoreVertIcon,
  AccessTime as TimeIcon,
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
        mb: { xs: 0, sm: 3 },
        bgcolor: "background.paper",
        border: { xs: "none", sm: "1px solid" },
        borderColor: { xs: "transparent", sm: "rgba(255, 145, 77, 0.1)" },
        borderRadius: { xs: 0, sm: 3 },
        boxShadow: {
          xs: "none",
          sm: "0 8px 32px rgba(255, 145, 77, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04)",
        },
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        "&:hover": {
          transform: { xs: "none", sm: "translateY(-4px)" },
          boxShadow: {
            xs: "none",
            sm: "0 12px 40px rgba(255, 145, 77, 0.12), 0 8px 24px rgba(0, 0, 0, 0.06)",
          },
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: "linear-gradient(90deg, #FF914D 0%, #FFB366 100%)",
          opacity: { xs: 0, sm: 1 },
        },
      }}
      onClick={() => onViewDetails?.(id)}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Header - Date and Edit */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          {/* Date with icon */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TimeIcon
              sx={{
                fontSize: "1rem",
                color: "text.secondary",
                opacity: 0.7,
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontSize: "0.8rem",
                fontWeight: 500,
                opacity: 0.8,
              }}
            >
              {publishDate}
            </Typography>
          </Box>

          {/* Edit button */}
          <IconButton
            size="small"
            onClick={handleEdit}
            sx={{
              color: "text.secondary",
              p: 1,
              borderRadius: "50%",
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: "rgba(255, 145, 77, 0.1)",
                color: "#FF914D",
                transform: "scale(1.1)",
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
            mb: 3,
            fontSize: { xs: "1.1rem", sm: "1.25rem" },
            lineHeight: 1.3,
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </Typography>

        {/* Post Content - Rendered by child components */}
        <Box sx={{ mb: 3 }}>{children}</Box>

        {/* Footer - Reactions */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pt: 2,
            borderTop: "1px solid",
            borderColor: "rgba(255, 145, 77, 0.1)",
          }}
        >
          {/* Reactions */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              p: 1,
              borderRadius: 2,
              bgcolor: isLiked ? "rgba(255, 145, 77, 0.08)" : "transparent",
              border: isLiked
                ? "1px solid rgba(255, 145, 77, 0.2)"
                : "1px solid transparent",
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: isLiked
                  ? "rgba(255, 145, 77, 0.12)"
                  : "rgba(255, 145, 77, 0.04)",
                borderColor: "rgba(255, 145, 77, 0.3)",
              },
            }}
          >
            <IconButton
              size="small"
              onClick={handleLike}
              sx={{
                color: isLiked ? "#FF914D" : "text.secondary",
                p: 0.5,
                borderRadius: "50%",
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: isLiked
                    ? "rgba(255, 145, 77, 0.15)"
                    : "rgba(255, 145, 77, 0.08)",
                  transform: "scale(1.15)",
                },
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
                color: isLiked ? "#FF914D" : "text.secondary",
                fontSize: "0.8rem",
                fontWeight: 600,
                minWidth: "1.5rem",
                textAlign: "center",
              }}
            >
              {likeCount}
            </Typography>
          </Box>

          {/* View details hint */}
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontSize: "0.75rem",
              opacity: 0.6,
              fontWeight: 500,
            }}
          >
            לחץ לצפייה בפרטים
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PostContainer;
