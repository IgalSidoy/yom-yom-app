import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { Box, useTheme } from "@mui/material";
import "swiper/css";
import "swiper/css/pagination";

interface SwipeableCardsProps {
  slides: React.ReactNode[];
  autoplayDelay?: number;
  spaceBetween?: number;
  className?: string;
  style?: React.CSSProperties;
}

const SwipeableCards: React.FC<SwipeableCardsProps> = ({
  slides,
  autoplayDelay = 8000,
  spaceBetween = 30,
  className = "swipeable-cards",
  style,
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        height: "calc(100vh - 190px)", // Account for bottom navigation
        "& .swiper-pagination": {
          bottom: "10px",
          "& .swiper-pagination-bullet": {
            width: "10px",
            height: "10px",
            backgroundColor: theme.palette.grey[300],
            opacity: 1,
            margin: "0 4px",
            transition: "all 0.3s ease",
            "&.swiper-pagination-bullet-active": {
              backgroundColor: theme.palette.primary.main,
              transform: "scale(1.3)",
              boxShadow: `0 0 8px ${theme.palette.primary.main}40`,
            },
          },
        },
      }}
    >
      <Swiper
        spaceBetween={spaceBetween}
        slidesPerView={1}
        autoplay={{
          delay: autoplayDelay,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: false,
        }}
        modules={[Pagination, Autoplay]}
        className={className}
        style={{
          paddingBottom: "40px", // Space for pagination
          height: "100%", // Fill the container height
          ...style,
        }}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <Box sx={{ width: "100%", flexShrink: 0 }}>{slide}</Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};

export default SwipeableCards;
