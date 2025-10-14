import React, { useEffect, useState } from "react";
import { Alert, Box } from "@mui/material";
import { useLocation } from "react-router-dom";
import {
  FeedContainer,
  FetchDailyReportButton,
  FeedDateSelector,
  FeedPost,
  AdminFeedFilters,
} from "../../features/feed/components";
import { useApp } from "../../contexts/AppContext";
import { useDailyReport } from "../../contexts/DailyReportContext";
import { useFeed } from "../../contexts/FeedContext";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../config/routes";
import MobileLayout from "../../shared/components/layout/MobileLayout";
import { Account, Group } from "../../services/api";

const AdminFeed: React.FC = () => {
  const { user } = useApp();
  const { dailyReport, fetchDailyReport } = useDailyReport();
  const {
    feedPosts,
    selectedDate,
    isFeedLoading,
    handleDateChange,
    fetchFeedData,
  } = useFeed();
  const navigate = useNavigate();
  const location = useLocation();

  // Admin-specific state for account and group selection
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // Load feed data when component mounts and when selections change
  useEffect(() => {
    if (selectedGroup) {
      fetchFeedData(selectedDate, selectedGroup.id);
    }
  }, [selectedGroup, selectedDate, fetchFeedData]);

  // Handle account change
  const handleAccountChange = (account: Account | null) => {
    setSelectedAccount(account);
    // Clear group selection when account changes
    setSelectedGroup(null);
  };

  // Handle group change
  const handleGroupChange = (group: Group | null) => {
    setSelectedGroup(group);
  };

  // Header content with filters and date selector
  const headerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Account and Group Filters */}
      <AdminFeedFilters
        selectedAccount={selectedAccount}
        selectedGroup={selectedGroup}
        onAccountChange={handleAccountChange}
        onGroupChange={handleGroupChange}
        isLoading={isFeedLoading}
      />

      {/* Date Selector */}
      <FeedDateSelector
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        label="בחר תאריך לצפייה בפיד"
      />
    </Box>
  );

  // Determine title based on selections
  const getTitle = () => {
    if (selectedGroup) {
      return `חדשות הקבוצה - ${selectedGroup.name}`;
    }
    if (selectedAccount) {
      return `חדשות הסניף - ${selectedAccount.branchName}`;
    }
    return "חדשות הקבוצה - מנהל";
  };

  const getSubtitle = () => {
    if (selectedGroup) {
      return `צפה בחדשות ועדכונים מקבוצת ${selectedGroup.name}`;
    }
    if (selectedAccount) {
      return `צפה בחדשות ועדכונים מסניף ${selectedAccount.branchName}`;
    }
    return "בחר סניף וקבוצה לצפייה בחדשות";
  };

  return (
    <MobileLayout showBottomNav={true}>
      <FeedContainer
        title={getTitle()}
        subtitle={getSubtitle()}
        isLoading={isFeedLoading}
        showFloatingButton={!!selectedGroup} // Only show floating button when group is selected
        headerContent={headerContent}
      >
        {!selectedAccount ? (
          <Alert
            severity="info"
            sx={{
              mb: 2,
              borderRadius: 3,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              border: "1px solid",
              borderColor: "info.light",
              "& .MuiAlert-icon": {
                fontSize: "1.5rem",
              },
            }}
          >
            בחר סניף לצפייה בחדשות
          </Alert>
        ) : !selectedGroup ? (
          <Alert
            severity="info"
            sx={{
              mb: 2,
              borderRadius: 3,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              border: "1px solid",
              borderColor: "info.light",
              "& .MuiAlert-icon": {
                fontSize: "1.5rem",
              },
            }}
          >
            בחר קבוצה לצפייה בחדשות
          </Alert>
        ) : (
          <>
            <Alert
              severity="success"
              sx={{
                mb: 2,
                borderRadius: 3,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                border: "1px solid",
                borderColor: "success.light",
                "& .MuiAlert-icon": {
                  fontSize: "1.5rem",
                },
              }}
            >
              צפה בחדשות ועדכונים מקבוצת {selectedGroup.name} בסניף{" "}
              {selectedAccount.branchName}
            </Alert>

            {/* Render feed posts from context */}
            {feedPosts.length > 0 ? (
              feedPosts.map((post) => (
                <FeedPost key={post.id} post={post} isClosed={post.isClosed} />
              ))
            ) : (
              <Alert
                severity="info"
                sx={{
                  mt: 2,
                  borderRadius: 3,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  border: "1px solid",
                  borderColor: "info.light",
                  "& .MuiAlert-icon": {
                    fontSize: "1.5rem",
                  },
                }}
              >
                אין עדיין חדשות להצגה לתאריך זה
              </Alert>
            )}
          </>
        )}
      </FeedContainer>
    </MobileLayout>
  );
};

export default AdminFeed;
