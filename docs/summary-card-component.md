# Summary Card Component

The Summary Card component is a reusable UI element that displays key metrics in a visually appealing card format.

## Overview

The Summary Card component provides a consistent way to display financial metrics and other important data points throughout the application. It includes visual styling, icons, and color coding to help users quickly identify different types of information.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| title | string | Yes | - | The title of the card |
| value | string \| number | Yes | - | The value to display |
| description | string | No | - | Optional description text |
| icon | React.ReactNode | No | - | Icon to display in the card |
| color | 'blue' \| 'green' \| 'yellow' \| 'red' \| 'brand' \| 'buffer' | No | 'blue' | Color scheme for the card |

## Color Schemes

The component supports several color schemes to provide visual context:

- **brand**: Light red background with a red left border - typically used for investor-specific cards
- **buffer**: Light green background with a green left border - typically used for buffer amounts or credit/debit cards
- **blue, green, yellow, red**: General purpose color schemes for different types of metrics

## Usage Examples

```tsx
import SummaryCard from '../components/ui/SummaryCard';
import { FiCreditCard } from 'react-icons/fi';

// Basic usage
<SummaryCard 
  title="Total Investments" 
  value={totalInvestment.toLocaleString()} 
  icon={<FiCreditCard />} 
  color="buffer"
/>

// With description
<SummaryCard 
  title="Anup Investments" 
  value={anupInvestment.toLocaleString()} 
  description="Current investor contribution"
  icon={<FiCreditCard />} 
  color="brand"
/>
```

## Styling

The Summary Card uses CSS Modules for styling, ensuring no conflicts with other components:

- Responsive layout that adapts to container width
- Hover effects with subtle elevation
- Consistent padding and typography
- Proper spacing between elements
- Color-coded borders and backgrounds for quick recognition

## Implementation Details

- Built with TypeScript for type safety
- Uses CSS Modules for encapsulated styling
- Responsive design that works on all screen sizes
- Accessibility-friendly with proper semantic HTML
- Efficient rendering with React.memo potential