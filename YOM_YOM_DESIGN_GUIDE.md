# Yom-Yom App Design Guide & Development Rules

## 🎨 **WDYYT? (What Do You Want Your Team?)**

This guide serves as the definitive reference for developing the Yom-Yom kindergarten management app. It defines our design philosophy, implementation rules, and ensures consistency across all platforms and user experiences.

---

## 🌈 **Color System & Brand Identity**

### **Primary Theme Colors**

```typescript
PRIMARY: "#FF914D"; // Warm Orange - Main brand color
SECONDARY: "#F9EEDB"; // Soft Beige - Complementary
BACKGROUND: "#FFF9F3"; // Light Cream - Page backgrounds
TEXT_PRIMARY: "#4E342E"; // Rich Brown - Primary text
TEXT_SECONDARY: "#FF914D"; // Orange - Secondary text
```

### **Status Colors**

- **Present/Arrived**: `#FF914D` (Orange)
- **Late**: `#2196F3` (Blue)
- **Absent/Missing**: `#F44336` (Red)
- **Sick**: `#FFB74D` (Yellow)
- **Vacation**: `#4CAF50` (Green)
- **Unreported**: `#9E9E9E` (Gray)

### **Meal Time Colors** (Time-based progression)

- **Breakfast**: `#FF9800` → `#FFCC02` (Golden sunrise)
- **Morning Snack**: `#FFB74D` → `#FFD54F` (Warm morning)
- **Lunch**: `#FF6B35` → `#FF8A65` (Midday energy)
- **Afternoon Snack**: `#FF7043` → `#FFAB91` (Cool afternoon)
- **Dinner**: `#E64A19` → `#FF7043` (Evening warmth)

---

## 📱 **Platform-Specific Design Philosophy**

### **Mobile Experience** 📱

**Goal**: Intuitive, touch-friendly, mobile-first experience

**Key Principles**:

- **100% Width Utilization**: Use full screen width for content
- **Card-Based Layout**: All data displayed in cards, not tables
- **Touch-Friendly**: Minimum 44px touch targets
- **Bottom Navigation**: Sticky bottom nav with scrollable content above
- **Thumb-Friendly**: Important actions within thumb reach

**Implementation Rules**:

```typescript
// Mobile-first responsive design
sx={{
  width: "100%",                    // Full width
  px: { xs: 2, sm: 3 },            // Responsive padding
  py: { xs: 1, sm: 2 },            // Responsive vertical spacing
  borderRadius: { xs: 2, sm: 3 },   // Rounded corners
  boxShadow: { xs: 1, sm: 2 },     // Subtle shadows
}}
```

### **Desktop Experience** 💻

**Goal**: Professional management system with efficient data handling

**Key Principles**:

- **Table-Based Layout**: Use tables for data-heavy sections (branches, users, children)
- **Multi-Column Layout**: Leverage screen real estate
- **Keyboard Navigation**: Full keyboard support
- **Hover States**: Rich hover interactions
- **Sidebar Navigation**: Traditional desktop navigation patterns

**Implementation Rules**:

```typescript
// Desktop-optimized layouts
sx={{
  display: { xs: "none", md: "table" },     // Tables on desktop only
  minWidth: { md: "800px" },                // Minimum table width
  "&:hover": {                              // Rich hover states
    boxShadow: 3,
    transform: "translateY(-2px)",
  },
}}
```

---

## 🧭 **Navigation System**

### **Mobile Navigation**

- **Position**: Fixed bottom navigation
- **Behavior**: Sticky, always visible
- **Scroll**: Content scrolls above navigation
- **Items**: Role-based navigation items
- **Styling**: Rounded top corners, subtle shadow

```typescript
// Bottom navigation implementation
<Paper sx={{
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  borderRadius: "16px 16px 0 0",
  zIndex: 1000,
  height: "calc(72px + env(safe-area-inset-bottom))",
}}>
```

### **Desktop Navigation**

- **Position**: Top navigation bar or sidebar
- **Behavior**: Traditional desktop patterns
- **Breadcrumbs**: For deep navigation
- **Quick Actions**: Contextual action buttons

---

## 📊 **Data Display Patterns**

### **Mobile: Card-Based Layout**

```typescript
// Card pattern for mobile
<Paper
  sx={{
    p: 3,
    mb: 2,
    borderRadius: 2,
    border: "1px solid",
    borderColor: "divider",
    "&:hover": { boxShadow: 2 },
  }}
>
  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
    <Typography variant="h6">{item.name}</Typography>
    <Chip label={item.status} color="primary" size="small" />
  </Box>
  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
    <Typography variant="body2">{item.details}</Typography>
  </Box>
</Paper>
```

### **Desktop: Table-Based Layout**

```typescript
// Table pattern for desktop
<TableContainer component={Paper} elevation={0}>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Name</TableCell>
        <TableCell>Status</TableCell>
        <TableCell>Actions</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {items.map((item) => (
        <TableRow key={item.id} hover>
          <TableCell>{item.name}</TableCell>
          <TableCell>
            <Chip label={item.status} color="primary" size="small" />
          </TableCell>
          <TableCell>
            <Button variant="outline" size="small">
              Edit
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>
```

---

## 🎯 **Component Design Rules**

### **Buttons**

```typescript
// Primary button styling
<Button
  variant="contained"
  sx={{
    borderRadius: 2,
    textTransform: "none",
    fontWeight: 600,
    px: 3,
    py: 1.5,
    boxShadow: "0 2px 8px rgba(255, 145, 77, 0.3)",
    "&:hover": {
      boxShadow: "0 4px 12px rgba(255, 145, 77, 0.4)",
      transform: "translateY(-1px)",
    },
  }}
>
```

### **Cards**

```typescript
// Card component styling
<Card sx={{
  borderRadius: 3,
  border: "1px solid",
  borderColor: "divider",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
    transform: "translateY(-2px)",
  },
}}>
```

### **Notifications**

```typescript
// Notification system
<Notification
  open={notification.open}
  message={notification.message}
  severity={notification.severity}
  onClose={handleCloseNotification}
/>
```

---

## 📐 **Layout Guidelines**

### **Spacing System**

- **Mobile**: `px: 2, py: 1` (16px horizontal, 8px vertical)
- **Desktop**: `px: 3, py: 2` (24px horizontal, 16px vertical)
- **Card Padding**: `p: 3` (24px all around)
- **Section Spacing**: `mb: 4` (32px between sections)

### **Typography Scale**

```typescript
// Typography hierarchy
h1: { fontSize: "2.5rem", fontWeight: 700 }    // Page titles
h2: { fontSize: "2rem", fontWeight: 700 }     // Section titles
h3: { fontSize: "1.5rem", fontWeight: 600 }   // Card titles
h4: { fontSize: "1.25rem", fontWeight: 600 }  // Subsection titles
h5: { fontSize: "1.125rem", fontWeight: 600 } // Small headings
h6: { fontSize: "1rem", fontWeight: 600 }     // Labels
body1: { fontSize: "1rem", fontWeight: 400 }  // Body text
body2: { fontSize: "0.875rem", fontWeight: 400 } // Small text
```

### **Border Radius**

- **Small Elements**: `borderRadius: 1` (8px)
- **Cards**: `borderRadius: 2` (16px)
- **Large Containers**: `borderRadius: 3` (24px)
- **Navigation**: `borderRadius: "16px 16px 0 0"` (Rounded top)

---

## 🔄 **Responsive Breakpoints**

```typescript
// Material-UI breakpoints
xs: 0px      // Mobile phones
sm: 600px    // Tablets
md: 900px    // Small laptops
lg: 1200px   // Desktops
xl: 1536px   // Large screens
```

### **Responsive Patterns**

```typescript
// Common responsive patterns
sx={{
  display: { xs: "flex", md: "table" },           // Flex on mobile, table on desktop
  flexDirection: { xs: "column", sm: "row" },     // Stack on mobile, row on tablet+
  gap: { xs: 2, sm: 3 },                          // Smaller gaps on mobile
  px: { xs: 2, sm: 3, md: 4 },                   // Progressive padding increase
  fontSize: { xs: "0.875rem", sm: "1rem" },      // Smaller text on mobile
}}
```

---

## 🎨 **Visual Design Principles**

### **Shadows & Elevation**

- **Cards**: `boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)"`
- **Hover States**: `boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)"`
- **Navigation**: `boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.08)"`
- **Modals**: `boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)"`

### **Transitions**

```typescript
// Standard transition timing
transition: "all 0.2s ease-in-out"

// Hover animations
"&:hover": {
  transform: "translateY(-2px)",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
}
```

### **Focus States**

```typescript
// Accessibility-focused styling
"&:focus-visible": {
  outline: "2px solid #FF914D",
  outlineOffset: "2px",
}
```

---

## 🚀 **Implementation Checklist**

### **Before Starting Development**

- [ ] Review this design guide
- [ ] Check existing color system in `src/config/colors.ts`
- [ ] Verify theme configuration in `src/theme.ts`
- [ ] Understand responsive breakpoints

### **During Development**

- [ ] Use mobile-first approach
- [ ] Implement card-based layout for mobile
- [ ] Use table-based layout for desktop
- [ ] Apply consistent spacing and typography
- [ ] Test on multiple screen sizes
- [ ] Ensure touch-friendly interactions on mobile

### **Before Deployment**

- [ ] Test notification system
- [ ] Verify responsive behavior
- [ ] Check accessibility compliance
- [ ] Validate color contrast ratios
- [ ] Test navigation flow

---

## 📝 **Code Examples**

### **Responsive Data Display Component**

```typescript
const ResponsiveDataDisplay = ({ items }) => {
  return (
    <Box>
      {/* Mobile: Card Layout */}
      <Box sx={{ display: { xs: "block", md: "none" } }}>
        {items.map((item) => (
          <Card key={item.id} sx={{ mb: 2, p: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {item.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item.description}
            </Typography>
          </Card>
        ))}
      </Box>

      {/* Desktop: Table Layout */}
      <TableContainer sx={{ display: { xs: "none", md: "block" } }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>
                  <Button variant="outline" size="small">
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
```

---

## 🎯 **Key Takeaways**

1. **Mobile-First**: Always design for mobile first, then enhance for desktop
2. **Platform-Appropriate**: Cards for mobile, tables for desktop
3. **Consistent Colors**: Use the defined color system throughout
4. **Touch-Friendly**: Ensure all interactions work well on touch devices
5. **Responsive**: Test on all breakpoints
6. **Accessible**: Maintain proper contrast and focus states
7. **Performance**: Optimize for smooth animations and transitions

---

_This guide is a living document. Update it as the app evolves and new patterns emerge._
