# Hello World App

A simple Hello World application built with Next.js and TypeScript.

## Features

- **Simple UI**: Displays "Hello World" on the main page
- **Minimal Dependencies**: Only essential packages for Next.js functionality

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Run the Application

For development:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

For production build:
```bash
npm run build
```

To start the production server:
```bash
npm start
```

## Project Structure

```
├── public/                  # Static assets
├── src/
│   └── app/                 # Next.js app router pages
│       ├── globals.css      # Global styles
│       ├── layout.tsx       # Root layout
│       └── page.tsx         # Main page
├── package.json             # Project dependencies and scripts
├── README.md                # This file
└── tsconfig.json            # TypeScript configuration
```

## Technologies Used

- Next.js 16 with App Router
- TypeScript
- React for frontend components

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a pull request