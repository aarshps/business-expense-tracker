# Logging System

The Business Expense Tracker implements a comprehensive logging system to track application events, errors, and debug information.

## Overview

The logging system is implemented in `lib/logger.js` and provides three different log levels (INFO, ERROR, DEBUG) to track different types of events in the application. All logs are written to both the console and a file (`logs/app.log`) for development and production monitoring.

## Log Types

### INFO Level
- Used for general application events and successful operations
- Information about API endpoints being accessed
- Data retrieval and processing events
- User login/logout events

### ERROR Level
- Used for error conditions and exceptional situations
- Database connection failures
- API request failures
- Unhandled exceptions and errors

### DEBUG Level
- Used for detailed information during development
- Parameter values and function inputs
- Flow control information
- Detailed tracing of operations

## Implementation

The logging system uses Node.js's built-in `fs` module to write logs to a file, and creates the `logs` directory if it doesn't exist. Each log entry includes:

- ISO-formatted timestamp
- Log level (INFO, ERROR, DEBUG)
- Custom message

## Usage

### Import the logging functions
```javascript
import { logInfo, logError, logDebug } from '../../../lib/logger';
```

### Call the appropriate logging function
```javascript
logInfo('User successfully authenticated');
logError('Database connection failed: ' + error.message);
logDebug('Processing transaction with ID: ' + transactionId);
```

## Log File Structure

- Logs are written to `logs/app.log` in the application root
- Each log entry is written on a single line with the format:
  `[YYYY-MM-DDTHH:mm:ss.sssZ] LEVEL: message`
- Log files are not automatically rotated or cleaned up
- The logs directory is created automatically if it doesn't exist

## Security Considerations

- The logging system does not log sensitive information like passwords or tokens
- PII (Personally Identifiable Information) should be carefully considered before logging
- Log files should be protected from unauthorized access

## Monitoring in Production

- Regularly monitor log files for error patterns
- Set up alerts for critical errors
- Consider implementing log rotation in production environments
- Ensure the application has write permissions to the logs directory