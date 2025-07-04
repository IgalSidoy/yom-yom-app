import React from "react";
import { Button, Box, Typography } from "@mui/material";

interface TestErrorComponentProps {
  shouldThrow?: boolean;
  onToggleError: () => void;
}

const TestErrorComponent: React.FC<TestErrorComponentProps> = ({
  shouldThrow = false,
  onToggleError,
}) => {
  if (shouldThrow) {
    throw new Error(
      "This is a test error to demonstrate error boundary functionality!"
    );
  }

  return (
    <Box sx={{ p: 2, border: "1px dashed #ccc", borderRadius: 1, mb: 2 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Test Error Component
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        This component can be used to test error boundaries. Click the button
        below to simulate an error.
      </Typography>
      <Button
        variant="outlined"
        color="error"
        onClick={onToggleError}
        size="small"
      >
        Simulate Error
      </Button>
    </Box>
  );
};

export default TestErrorComponent;
