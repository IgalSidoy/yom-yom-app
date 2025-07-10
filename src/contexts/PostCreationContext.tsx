import React, { createContext, useContext } from "react";

// Context for post creation
const PostCreationContext = createContext<{
  handlePostTypeSelect: (postType: string) => Promise<void>;
} | null>(null);

export const usePostCreation = () => {
  const context = useContext(PostCreationContext);
  if (!context) {
    throw new Error("usePostCreation must be used within PostCreationProvider");
  }
  return context;
};

export const PostCreationProvider: React.FC<{
  children: React.ReactNode;
  value: { handlePostTypeSelect: (postType: string) => Promise<void> };
}> = ({ children, value }) => {
  return (
    <PostCreationContext.Provider value={value}>
      {children}
    </PostCreationContext.Provider>
  );
};
