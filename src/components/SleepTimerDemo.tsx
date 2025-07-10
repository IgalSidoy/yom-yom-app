import React, { useState } from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import SleepTimer from "./SleepTimer";

const SleepTimerDemo: React.FC = () => {
  const [currentTime] = useState(new Date().toISOString());
  const [sleepStartTime] = useState(
    new Date(Date.now() - 45 * 60 * 1000).toISOString()
  ); // 45 minutes ago
  const [sleepEndTime] = useState(
    new Date(Date.now() - 15 * 60 * 1000).toISOString()
  ); // 15 minutes ago

  // Test timer that started 2 minutes ago
  const [testStartTime, setTestStartTime] = useState(
    new Date(Date.now() - 2 * 60 * 1000).toISOString()
  );

  const handleStartNewTimer = () => {
    setTestStartTime(new Date().toISOString());
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
        SleepTimer Animation Demo
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Active Sleep Timers */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Active Sleep Timers (Currently Sleeping)
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2">Test (2 min ago):</Typography>
              <SleepTimer
                startTime={testStartTime}
                isSleeping={true}
                size="medium"
                animationIntensity="normal"
              />
              <Button
                variant="outlined"
                size="small"
                onClick={handleStartNewTimer}
                sx={{ ml: 1 }}
              >
                Start New
              </Button>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2">Subtle:</Typography>
              <SleepTimer
                startTime={sleepStartTime}
                isSleeping={true}
                size="medium"
                animationIntensity="subtle"
              />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2">Normal:</Typography>
              <SleepTimer
                startTime={sleepStartTime}
                isSleeping={true}
                size="medium"
                animationIntensity="normal"
              />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2">Prominent:</Typography>
              <SleepTimer
                startTime={sleepStartTime}
                isSleeping={true}
                size="medium"
                animationIntensity="prominent"
              />
            </Box>
          </Box>
        </Paper>

        {/* Completed Sleep Timers */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Completed Sleep Timers (Awake)
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2">Completed:</Typography>
              <SleepTimer
                startTime={sleepStartTime}
                endTime={sleepEndTime}
                isSleeping={false}
                size="medium"
                animationIntensity="normal"
              />
            </Box>
          </Box>
        </Paper>

        {/* Different Sizes */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Different Sizes
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2">Small:</Typography>
              <SleepTimer
                startTime={sleepStartTime}
                isSleeping={true}
                size="small"
                animationIntensity="normal"
              />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2">Medium:</Typography>
              <SleepTimer
                startTime={sleepStartTime}
                isSleeping={true}
                size="medium"
                animationIntensity="normal"
              />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2">Large:</Typography>
              <SleepTimer
                startTime={sleepStartTime}
                isSleeping={true}
                size="large"
                animationIntensity="normal"
              />
            </Box>
          </Box>
        </Paper>

        {/* Without Icon */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Without Icon
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2">No Icon:</Typography>
              <SleepTimer
                startTime={sleepStartTime}
                isSleeping={true}
                size="medium"
                showIcon={false}
                animationIntensity="normal"
              />
            </Box>
          </Box>
        </Paper>

        {/* Without Pulse */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Without Pulse
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2">No Pulse:</Typography>
              <SleepTimer
                startTime={sleepStartTime}
                isSleeping={true}
                size="medium"
                showPulse={false}
                animationIntensity="normal"
              />
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default SleepTimerDemo;

// This ensures the file is treated as a module
export {};
