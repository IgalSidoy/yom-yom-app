import React from "react";
import { useParams, Navigate } from "react-router-dom";
import CreateSleepPostPage from "./CreateSleepPostPage";
import CreateFoodPostPage from "./CreateFoodPostPage";

const CreatePostPage: React.FC = () => {
  const { type } = useParams<{ type: string }>();

  // Validate post type and render appropriate component
  switch (type) {
    case "sleep":
      return <CreateSleepPostPage />;
    case "food":
      return <CreateFoodPostPage />;
    default:
      // Invalid post type, redirect to feed
      return <Navigate to="/feed" replace />;
  }
};

export default CreatePostPage;

