import React from "react";
import { Typography, Box, useTheme, useMediaQuery } from "@mui/material";
import { Skeleton, Fade, Slide, Box as MuiBox } from "@mui/material";
import Container from "../Container";
import { FeedFloatingButton } from "./index";

interface FeedContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  isPostsLoading?: boolean;
  headerContent?: React.ReactNode;
  showFloatingButton?: boolean;
  onPostTypeSelect?: (postType: string) => Promise<void>;
}

const FeedContainer: React.FC<FeedContainerProps> = ({
  title,
  subtitle,
  children,
  isLoading = false,
  isPostsLoading = false,
  headerContent,
  showFloatingButton = false,
  onPostTypeSelect,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Skeleton components
  const PostSkeleton = () => (
    <Slide direction="up" in={true} timeout={600}>
      <MuiBox
        sx={{
          p: 2,
          mb: 2,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 1,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* Header skeleton */}
        <MuiBox sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <MuiBox sx={{ ml: 2, flex: 1 }}>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="40%" height={16} />
          </MuiBox>
          <Skeleton variant="text" width={80} height={16} />
        </MuiBox>

        {/* Title skeleton */}
        <Skeleton variant="text" width="80%" height={28} sx={{ mb: 1 }} />

        {/* Content skeleton */}
        <MuiBox sx={{ display: "flex", gap: 1, mb: 2 }}>
          <Skeleton
            variant="rectangular"
            width={60}
            height={24}
            sx={{ borderRadius: 1 }}
          />
          <Skeleton
            variant="rectangular"
            width={80}
            height={24}
            sx={{ borderRadius: 1 }}
          />
        </MuiBox>

        {/* Stats skeleton */}
        <MuiBox
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 1.5,
            bgcolor: "background.default",
            borderRadius: 1.5,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <MuiBox>
            <Skeleton variant="text" width={60} height={32} />
            <Skeleton variant="text" width={50} height={16} />
          </MuiBox>
          <MuiBox sx={{ textAlign: "center" }}>
            <Skeleton variant="text" width={40} height={24} />
            <Skeleton variant="text" width={80} height={16} />
          </MuiBox>
        </MuiBox>

        {/* Actions skeleton */}
        <MuiBox
          sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
        >
          <Skeleton
            variant="rectangular"
            width={100}
            height={32}
            sx={{ borderRadius: 1 }}
          />
          <MuiBox sx={{ display: "flex", gap: 1 }}>
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
          </MuiBox>
        </MuiBox>
      </MuiBox>
    </Slide>
  );

  const FeedSkeleton = () => (
    <Fade in={true} timeout={800}>
      <MuiBox>
        {[1, 2, 3].map((index) => (
          <PostSkeleton key={index} />
        ))}
      </MuiBox>
    </Fade>
  );

  return (
    <Container>
      <Box
        sx={{
          height: { xs: "calc(100vh - 72px)", sm: "100vh" },
          bgcolor: "background.default",
          p: { xs: 0, sm: 2, md: 3 },
          dir: "rtl",
          overflow: "hidden",
        }}
      >
        {/* Mobile Container */}
        {isMobile && (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              bgcolor: "background.paper",
              borderRadius: 0,
              boxShadow: "none",
              overflow: "hidden",
              border: "none",
              display: "flex",
              flexDirection: "column",
              px: 0,
            }}
          >
            {/* Mobile Header */}
            <Box
              sx={{
                px: 2,
                py: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: "text.primary",
                  textAlign: "center",
                  fontSize: "1.25rem",
                }}
              >
                {title}
              </Typography>
              {headerContent && <Box sx={{ mt: 2 }}>{headerContent}</Box>}
            </Box>

            {/* Mobile Content */}
            <Box
              sx={{
                px: 0,
                py: 1,
                flex: 1,
                bgcolor: "background.default",
                overflow: "auto",
              }}
            >
              {isLoading ? (
                <FeedSkeleton />
              ) : (
                <>
                  {isPostsLoading && (
                    <Slide direction="down" in={true} timeout={400}>
                      <MuiBox
                        sx={{
                          p: 2,
                          mb: 2,
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
                          borderRadius: 2,
                          textAlign: "center",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                        }}
                      >
                        <Skeleton variant="circular" width={16} height={16} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          מוסיף פוסט חדש...
                        </Typography>
                      </MuiBox>
                    </Slide>
                  )}
                  {children}
                </>
              )}
            </Box>
          </Box>
        )}

        {/* Desktop/Tablet Container */}
        {!isMobile && (
          <Box
            sx={{
              width: "100%",
              maxWidth: {
                sm: "95vw",
                md: "90vw",
                lg: "85vw",
                xl: "80vw",
              },
              height: "calc(100vh - 150px)",
              mx: "auto",
              bgcolor: "background.paper",
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Desktop Header */}
            <Box
              sx={{
                p: { sm: 3, md: 4 },
                borderBottom: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: "text.primary",
                  textAlign: "center",
                  fontSize: { sm: "1.5rem", md: "1.75rem" },
                }}
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    textAlign: "center",
                    mt: 1,
                    fontSize: { sm: "0.875rem", md: "1rem" },
                  }}
                >
                  {subtitle}
                </Typography>
              )}
              {headerContent && <Box sx={{ mt: 2 }}>{headerContent}</Box>}
            </Box>

            {/* Desktop Content */}
            <Box
              sx={{
                p: { sm: 3, md: 4 },
                flex: 1,
                bgcolor: "background.default",
                overflow: "auto",
              }}
            >
              {isLoading ? (
                <FeedSkeleton />
              ) : (
                <>
                  {isPostsLoading && (
                    <Slide direction="down" in={true} timeout={400}>
                      <MuiBox
                        sx={{
                          p: 2,
                          mb: 2,
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
                          borderRadius: 2,
                          textAlign: "center",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                        }}
                      >
                        <Skeleton variant="circular" width={16} height={16} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          מוסיף פוסט חדש...
                        </Typography>
                      </MuiBox>
                    </Slide>
                  )}
                  {children}
                </>
              )}
            </Box>
          </Box>
        )}

        {/* Floating Action Button - Only show if enabled */}
        {showFloatingButton && onPostTypeSelect && (
          <FeedFloatingButton onPostTypeSelect={onPostTypeSelect} />
        )}
      </Box>
    </Container>
  );
};

export default FeedContainer;
