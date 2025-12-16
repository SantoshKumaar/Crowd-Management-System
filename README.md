# Crowd Management System

A React application for monitoring live crowd occupancy, understanding visitor behavior, and managing safety and comfort in public venues such as malls, offices, and campuses.

## Features

- 🔐 **Secure Authentication**: Login with email/login ID and password visibility toggle
- 📊 **Overview Dashboard**: 
  - Live Occupancy, Today's Footfall, and Average Dwell Time metrics with comparison indicators
  - Overall Occupancy timeline chart
  - Demographics pie chart and timeline analysis
- 📋 **Crowd Entries Page**: Paginated table showing visitor entry/exit records with dwell time
- 🔔 **Real-time Alerts**: Socket.IO integration for live alerts and occupancy updates
- 🔌 **API Integration**: Axios-based API service with all required endpoints
- 🎨 **Modern UI**: Clean teal-themed design matching the specification
- 🛡️ **Protected Routes**: Route protection based on authentication state

## Tech Stack

- **React 18** - UI library
- **React Router DOM** - Routing
- **Vite** - Build tool and dev server
- **Axios** - HTTP client for API calls
- **Recharts** - Charting library for graphs
- **Socket.IO Client** - Real-time updates for alerts and live occupancy
- **CSS3** - Styling

## Project Structure

```
src/
├── assets/              # Static assets
│   ├── icons/          # Icon files (SVG, PNG)
│   └── img/            # Image files (PNG, JPG, SVG)
├── components/          # React components
│   ├── screens/        # Screen/page components organized by feature
│   │   ├── auth/       # Authentication screens
│   │   │   ├── Login.jsx
│   │   │   └── Login.css
│   │   ├── dashboard/  # Dashboard screens
│   │   │   ├── Dashboard.jsx
│   │   │   └── Dashboard.css
│   │   └── crowdEntries/ # Crowd entries screens
│   │       ├── CrowdEntries.jsx
│   │       └── CrowdEntries.css
│   └── shared/         # Shared/reusable components
│       ├── Layout.jsx
│       └── Layout.css
├── config/             # Configuration files
│   ├── AppUrl.js       # API endpoint URLs
│   └── Constants.js    # Application constants
├── context/            # React Context providers
│   └── AuthContext.jsx # Authentication context
├── interceptor/        # HTTP interceptors
│   └── http-interceptor.js # Axios interceptor configuration
├── route/              # Routing configuration
│   ├── Router.jsx      # Main router component
│   └── ProtectedRoutes.jsx # Protected route wrapper
├── services/           # API services
│   ├── AuthService.js      # Authentication service
│   ├── AnalyticsService.js # Analytics service
│   └── SocketService.js     # Socket.IO service
├── util/               # Utility functions
│   └── index.js        # Common utility functions
├── App.jsx             # Main app component
├── App.css
├── main.jsx            # Entry point
└── index.css           # Global styles
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file for API configuration:
```env
VITE_API_BASE_URL=https://hiring-dev.internal.kloudspot.com/api
VITE_SOCKET_URL=https://hiring-dev.internal.kloudspot.com
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

### Login
- Enter your email/login ID and password
- Toggle password visibility using the eye icon
- After successful authentication, you'll be redirected to the Overview dashboard

### Overview Dashboard
- **Summary Cards**: 
  - Live Occupancy with comparison to yesterday
  - Today's Footfall with trend indicator
  - Average Dwell Time with percentage change
- **Charts**:
  - Overall Occupancy: Time-series line chart showing occupancy over time
  - Demographics Pie Chart: Distribution of crowd demographics
  - Demographics Analysis: Timeline chart comparing Male vs Female over time
- Select different dates using the "Today" button

### Crowd Entries Page
- View paginated table of visitor entry/exit records
- Columns include: Name (with avatar), Sex, Entry time, Exit time, Dwell time
- Navigate through pages using pagination controls
- **Alerts Sidebar**: Real-time alerts showing zone entries with priority levels (High, Medium, Low)

## API Integration

The app includes a complete API service setup in `src/services/api.js` with all required endpoints:

### API Endpoints

- **POST** `/api/auth/login` - Authentication
- **POST** `/api/analytics/dwell` - Average Dwell Time
- **POST** `/api/analytics/footfall` - Today's Footfall
- **POST** `/api/analytics/occupancy` - Overall Occupancy Timeseries Chart
- **POST** `/api/analytics/demographics` - Demographics PIE Chart/Timeseries Chart
- **POST** `/api/analytics/entry-exit` - Entries (Paginated)

### API Methods Available

- **Auth API**: `authAPI.login(credentials)`
- **Analytics API**: 
  - `analyticsAPI.getDwellTime(data)`
  - `analyticsAPI.getFootfall(data)`
  - `analyticsAPI.getOccupancy(data)`
  - `analyticsAPI.getDemographics(data)`
  - `analyticsAPI.getEntryExit(data)`

### Socket.IO Integration

Real-time updates are handled via Socket.IO:
- **Alert Event**: Triggered when entry/exit occurs in a zone
- **Live Occupancy Event**: Provides up-to-date occupancy counts

The app automatically connects to Socket.IO after successful login. See `src/services/socket.js` for implementation details.

## Building for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## Development

- **Dev Server**: `npm run dev`
- **Build**: `npm run build`
- **Preview**: `npm run preview` (preview production build)

## Customization

### Adding New Pages

1. Create a new component in `src/components/screens/[feature-name]/`
2. Add a route in `src/route/Router.jsx`
3. Add navigation link in `src/components/shared/Layout.jsx`

### Adding New API Endpoints

1. Add endpoint URL to `src/config/AppUrl.js`
2. Create or update service method in `src/services/[ServiceName]Service.js`
3. Use the service in your component

### Adding Assets

1. Place icons in `src/assets/icons/`
2. Place images in `src/assets/img/`
3. Import in your component: `import asset from '../assets/icons/icon.svg'`

### Styling

- Global styles: `src/index.css`
- Component styles: Individual CSS files in respective component directories
- Colors can be customized by updating CSS variables or direct color values

## Notes

- The app includes fallback mock data for development/testing when APIs are unavailable
- All API endpoints are configured and ready to use
- Socket.IO connection is established automatically after login
- The app is fully responsive and works on mobile devices
- All styling matches the teal color scheme (#009688) as specified

## License

This project is created for educational/assignment purposes.

