# Activity Timeout Feature

This feature automatically logs out users after 10 minutes of inactivity.

## Implementation Details

- The `InactivityDetector` component is integrated into the `AuthProvider` in `components/AuthContext.js`
- It tracks user activity through various DOM events: `mousedown`, `mousemove`, `keypress`, `scroll`, `touchstart`, `click`, and `wheel`
- When no activity is detected for 10 minutes (or 5 minutes in development), the user is automatically logged out
- The logout redirects the user to the sign-in page (`/auth/signin`)
- The timeout only activates when a user is authenticated

## Configuration

- The timeout duration is configurable via `lib/inactivityConfig.js`
- In development, the timeout is set to 5 minutes for easier testing
- In production, the timeout is set to 10 minutes as requested

## Testing

To test this feature:
1. Log in to the application
2. Observe the console logs showing the timer starting
3. Do not perform any user activity for the timeout duration
4. The user should be automatically logged out and redirected to the sign-in page