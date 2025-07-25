import React from "react";
import {
  Box,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Restaurant,
  BreakfastDining,
  LunchDining,
  DinnerDining,
  Cake,
  Coffee,
  CheckCircle,
  Cancel,
  RemoveCircle,
  Warning,
} from "@mui/icons-material";
import { FeedChildFoodData, FoodEvent } from "../../types/posts";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  getChildColor,
  getContrastTextColor,
  getMealTypeColors,
  POST_TYPE_COLORS,
  UI_COLORS,
} from "../../config/colors";
import dayjs from "dayjs";

interface FoodPostProps {
  foodEvents: FoodEvent[];
  groupName: string;
  activityDate: string;
}

const FoodPost: React.FC<FoodPostProps> = ({
  foodEvents,
  groupName,
  activityDate,
}) => {
  const { language } = useLanguage();

  const getMealTypeIcon = (type: string) => {
    switch (type) {
      case "Breakfast":
        return <BreakfastDining />;
      case "MorningSnack":
        return <Coffee />;
      case "Lunch":
        return <LunchDining />;
      case "AfternoonSnack":
        return <Cake />;
      case "Dinner":
        return <DinnerDining />;
      default:
        return <Restaurant />;
    }
  };

  const getMealTypeLabel = (type: string) => {
    const labels = {
      heb: {
        Breakfast: "ארוחת בוקר",
        MorningSnack: "חטיף בוקר",
        Lunch: "ארוחת צהריים",
        AfternoonSnack: "חטיף אחר הצהריים",
        Dinner: "ארוחת ערב",
      },
      rus: {
        Breakfast: "Завтрак",
        MorningSnack: "Утренний перекус",
        Lunch: "Обед",
        AfternoonSnack: "Полдник",
        Dinner: "Ужин",
      },
      eng: {
        Breakfast: "Breakfast",
        MorningSnack: "Morning Snack",
        Lunch: "Lunch",
        AfternoonSnack: "Afternoon Snack",
        Dinner: "Dinner",
      },
    };
    return (labels[language] as any)[type] || type;
  };

  const getFoodStatusIcon = (status: string) => {
    switch (status) {
      case "FullyEaten":
        return <CheckCircle color="success" />;
      case "PartiallyEaten":
        return <RemoveCircle color="warning" />;
      case "NotEaten":
        return <Cancel color="error" />;
      case "Refused":
        return <Warning color="error" />;
      default:
        return <CheckCircle />;
    }
  };

  const getFoodStatusLabel = (status: string) => {
    const labels = {
      heb: {
        FullyEaten: "אכל הכל",
        PartiallyEaten: "אכל חלקית",
        NotEaten: "לא אכל",
        Refused: "סירב לאכול",
      },
      rus: {
        FullyEaten: "Съел всё",
        PartiallyEaten: "Съел частично",
        NotEaten: "Не ел",
        Refused: "Отказался есть",
      },
      eng: {
        FullyEaten: "Fully Eaten",
        PartiallyEaten: "Partially Eaten",
        NotEaten: "Not Eaten",
        Refused: "Refused",
      },
    };
    return (labels[language] as any)[status] || status;
  };

  const getFoodStatusColor = (status: string) => {
    switch (status) {
      case "FullyEaten":
        return "success";
      case "PartiallyEaten":
        return "warning";
      case "NotEaten":
      case "Refused":
        return "error";
      default:
        return "default";
    }
  };

  const formatTime = (timestamp: string) => {
    return dayjs(timestamp).format("HH:mm");
  };

  const renderChildFoodCard = (child: FeedChildFoodData) => {
    const childName = `${child.childFirstName} ${child.childLastName}`.trim();
    const childColor = getChildColor(child.childId);
    const textColor = getContrastTextColor(childColor);

    return (
      <Box
        key={child.childId}
        sx={{
          mb: 1,
          border: `1px solid ${childColor}`,
          borderRadius: 1,
          backgroundColor: `${childColor}10`,
          p: { xs: 1, sm: 1.5 },
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: childColor,
                color: textColor,
                fontSize: "0.875rem",
                fontWeight: "bold",
              }}
            >
              {childName.charAt(0)}
            </Avatar>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: "text.primary",
                maxWidth: { xs: "100%", sm: 120 },
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {childName}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title={getFoodStatusLabel(child.status)}>
              <IconButton size="small" sx={{ p: 0.5 }}>
                {getFoodStatusIcon(child.status)}
              </IconButton>
            </Tooltip>
            <Chip
              label={getFoodStatusLabel(child.status)}
              size="small"
              color={getFoodStatusColor(child.status) as any}
              variant="outlined"
              sx={{ fontSize: "0.75rem" }}
            />
          </Box>
        </Box>
        {child.foodDetails && (
          <Typography
            variant="body1"
            sx={{
              mt: 1.5,
              color: "text.primary",
              lineHeight: 1.5,
              fontWeight: 500,
              fontSize: "0.95rem",
            }}
          >
            {child.foodDetails}
          </Typography>
        )}
      </Box>
    );
  };

  const renderMealEvent = (event: FoodEvent) => {
    const mealTypeLabel = getMealTypeLabel(event.type);
    const mealTime = formatTime(event.timestamp);
    const mealColors = getMealTypeColors(event.type);

    return (
      <Box
        key={event.id}
        sx={{
          mb: 2,
          border: "1px solid",
          borderColor: mealColors.primary,
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            background: mealColors.gradient,
            color: "white",
            p: { xs: 1.5, sm: 2 },
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              <Avatar
                sx={{
                  bgcolor: UI_COLORS.AVATAR_OVERLAY,
                  color: UI_COLORS.TEXT_WHITE,
                }}
              >
                {getMealTypeIcon(event.type)}
              </Avatar>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: UI_COLORS.TEXT_WHITE }}
                >
                  {mealTypeLabel}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: UI_COLORS.TEXT_WHITE_90 }}
                >
                  {mealTime}
                </Typography>
              </Box>
            </Box>
            <Chip
              label={`${event.children.length} ילדים`}
              size="small"
              sx={{
                bgcolor: UI_COLORS.AVATAR_OVERLAY,
                color: UI_COLORS.TEXT_WHITE,
                fontWeight: 600,
              }}
            />
          </Box>
        </Box>
        <Box sx={{ p: { xs: 1, sm: 2 } }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr", // Full width on mobile
                sm: "repeat(auto-fit, minmax(280px, 1fr))", // Responsive grid on larger screens
              },
              gap: { xs: 0.5, sm: 1 },
            }}
          >
            {event.children.map((child) => (
              <Box key={child.childId}>{renderChildFoodCard(child)}</Box>
            ))}
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 2,
          p: 2,
          background: POST_TYPE_COLORS.FOOD_POST.gradient,
          color: UI_COLORS.TEXT_WHITE,
          borderRadius: 2,
        }}
      >
        <Avatar
          sx={{
            bgcolor: UI_COLORS.AVATAR_OVERLAY,
            color: UI_COLORS.TEXT_WHITE,
          }}
        >
          <Restaurant />
        </Avatar>
        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: UI_COLORS.TEXT_WHITE }}
          >
            דיווח מזון - {groupName}
          </Typography>
          <Typography variant="caption" sx={{ color: UI_COLORS.TEXT_WHITE_90 }}>
            {dayjs(activityDate).format("DD/MM/YYYY")}
          </Typography>
        </Box>
      </Box>

      {foodEvents.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 4,
            color: "text.secondary",
          }}
        >
          <Restaurant sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
          <Typography variant="body1">אין דיווחי מזון ליום זה</Typography>
        </Box>
      ) : (
        <Box>{foodEvents.map((event) => renderMealEvent(event))}</Box>
      )}
    </Box>
  );
};

export default FoodPost;
