import React, { useState } from "react";
import { Box } from "@mui/material";
import { PageLayout, TabNavigation, TabItem } from "../../../shared/components";
import ProfileSettings from "../components/settings/ProfileSettings";
import OrganizationSettings from "../components/settings/OrganizationSettings";
import AccountsSettings from "../components/settings/AccountsSettings";
import GroupsSettings from "../components/settings/GroupsSettings";
import UsersSettings from "../components/settings/UsersSettings";
import ChildrenSettings from "../components/settings/ChildrenSettings";

const AdminSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs: TabItem[] = [
    { id: "profile", label: "פרופיל אישי" },
    { id: "organization", label: "פרטי הגן" },
    { id: "accounts", label: "סניפים" },
    { id: "groups", label: "קבוצות" },
    { id: "users", label: "משתמשים" },
    { id: "children", label: "ילדים" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSettings />;
      case "organization":
        return <OrganizationSettings />;
      case "accounts":
        return <AccountsSettings />;
      case "groups":
        return <GroupsSettings />;
      case "users":
        return <UsersSettings />;
      case "children":
        return <ChildrenSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <PageLayout
      title="הגדרות מנהל"
      subtitle="ניהול הגדרות המערכת"
      showHeader={true}
      stickyHeader={true}
    >
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <Box sx={{ mt: 2 }}>{renderTabContent()}</Box>
      </Box>
    </PageLayout>
  );
};

export default AdminSettingsPage;
