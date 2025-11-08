# Sidebar Navigation

The sidebar navigation provides the primary method for users to navigate between different sections of the Business Expense Tracker application.

## Overview

The sidebar is implemented in `components/layout/Sidebar.tsx` and provides a collapsible navigation menu with access to different application sections. It also displays user information, database name, and environment context.

## Components

### Menu Items
- Dashboard: Links to the dashboard view, showing financial summaries
- Transactions: Links to the transaction management view

### User Information Section
- User avatar display with fallback to UI Avatars service
- User name and email display
- Database name display with truncation for long names
- Environment indicator (development/production)

### Action Buttons
- Logout button that triggers NextAuth.js signOut function

## Functionality

### Navigation
- Clicking menu items updates the active state and changes the displayed content
- Title and subtitle update dynamically based on the selected menu item
- Content switching is handled by the renderContent function

### Database Information
- Fetches the user's database name from the `/api/user/dbName` endpoint
- Implements fallback logic if the API call fails
- Displays the database name with truncation for readability
- Shows the current environment (development/production)

### Responsive Design
- The sidebar is designed to work on different screen sizes
- Includes proper spacing and layout for all elements
- Maintains usability on mobile and desktop devices

## Implementation Details

### Icons
- Uses react-icons (Feather Icons) for navigation icons
- Includes FiHome for Dashboard, FiCreditCard for Transactions, etc.
- Icons are properly sized and aligned within menu items

### Styling
- Uses CSS Modules for encapsulated styling
- Responsive layout that adapts to screen size
- Hover effects and active state indicators
- Proper spacing and typography

### State Management
- Uses React hooks (useState, useEffect) for state management
- Tracks the active menu item
- Manages dynamic title and subtitle updates
- Handles database name loading and display

## Integration with Other Components

### Dashboard Integration
- When Dashboard is selected, renders the Dashboard component as children
- Updates header title to "Dashboard" with appropriate subtitle
- Displays summary cards and financial data tables

### Transactions Integration
- When Transactions is selected, renders the Transactions component
- Updates header title to "Transactions" with appropriate subtitle
- Shows the transaction management interface

## Security Considerations

- Only visible to authenticated users
- Database name is tied to the authenticated user's session
- Proper authentication checks are in place before displaying sensitive information