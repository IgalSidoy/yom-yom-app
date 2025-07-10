import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { Box, useTheme } from "@mui/material";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/pagination";

export interface SwipeableCardsRef {
  swipeTo: (index: number) => void;
  getCurrentIndex: () => number;
}

interface SwipeableCardsProps {
  slides: React.ReactNode[];
  autoplayDelay?: number;
  spaceBetween?: number;
  className?: string;
  style?: React.CSSProperties;
}

const SwipeableCards = forwardRef<SwipeableCardsRef, SwipeableCardsProps>(
  (
    {
      slides,
      autoplayDelay = 8000,
      spaceBetween = 30,
      className = "swipeable-cards",
      style,
    },
    ref
  ) => {
    const theme = useTheme();
    const swiperRef = useRef<SwiperType | null>(null);

    useImperativeHandle(ref, () => ({
      swipeTo: (index: number) => {
        if (swiperRef.current) {
          swiperRef.current.slideTo(index);
        }
      },
      getCurrentIndex: () => {
        return swiperRef.current?.activeIndex || 0;
      },
    }));

    return (
      <Box
        sx={{
          height: { xs: "calc(100vh - 210px)", sm: "calc(100vh - 240px)" }, // Responsive height for mobile/desktop
          border: { xs: "none", sm: "1px solid" },
          borderColor: { xs: "transparent", sm: "divider" },
          borderRadius: { xs: 0, sm: 2 },
          boxShadow: { xs: "none", sm: "0 2px 8px rgba(0, 0, 0, 0.1)" },
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
          onSwiper={(swiper: SwiperType) => {
            swiperRef.current = swiper;
          }}
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
  }
);

export default SwipeableCards;
