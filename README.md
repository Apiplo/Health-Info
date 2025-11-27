# BlogInfo Website

A modern, responsive blog information website built with React.js featuring user authentication, multi-language support, article management, and category-based content organization.

## Features

- **Modern UI Design**: Clean, professional interface with health-focused branding
- **User Authentication**: Complete login/register/logout system with protected routes
- **Multi-Language Support**: English-Bangla translation toggle for accessibility
- **Category Pages**: Dedicated pages for Sport, Health, and Technology content
- **Article Management**: Featured articles with detailed views and comment system
- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **Admin Panel**: Administrative interface for content management
- **Backend Ready**: Structured for seamless backend API integration

## Key Pages

The website includes:
- **Home**: Featured articles and latest content
- **Login/Register**: User authentication with forgot password functionality
- **Category Pages**: Sport, Health, and Technology sections
- **Article Detail**: Full article view with comments and engagement
- **Admin Panel**: Content management interface
- **Language Toggle**: Switch between English and Bangla

## Technologies Used

- **React** 18.2.0
- **React Router DOM** 6.8.1
- **Styled Components** 5.3.11
- **React Icons** 5.5.0
- **CSS3** with responsive design
- **HTML5** semantic markup

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Health-Info
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   - Frontend runs on: `http://localhost:3001`
   - Backend API (when running): `http://localhost:3000`

## Project Structure

```
src/
├── components/
│   ├── Admin/             # Admin panel components
│   ├── ArticleDetail/     # Article detail page with comments
│   ├── Footer/            # Footer component
│   ├── ForgotPassword/    # Password recovery
│   ├── Header/            # Navigation header with auth
│   ├── HealthPage/        # Health category page
│   ├── Home/              # Home page with featured articles
│   ├── LanguageToggle/    # English-Bangla language switcher
│   ├── Login/             # Login form component
│   ├── Register/          # User registration
│   ├── SportPage/         # Sport category page
│   └── TechnologyPage/    # Technology category page
├── contexts/
│   └── AuthContext.js     # Authentication state management
├── data/
│   └── mockData.js        # Data structure examples
├── services/
│   └── api.js             # API service layer for backend calls
├── hooks/                 # Custom React hooks
├── utils/                 # Utility functions
├── App.js                 # Main app component with routing
├── index.js               # Entry point
└── index.css              # Global styles
```

## Usage

### Authentication
- Register a new account or login with existing credentials
- Protected routes require authentication
- Forgot password functionality available
- Logout functionality in header

### Language Toggle
- Click the language toggle button in the header
- Switch between English and Bangla
- Translation applies across the entire site

### Navigation
- **Sport, Health, Technology**: Category pages for different content types
- **Login/Register**: Authentication pages
- **Admin Panel**: Content management (requires admin privileges)
- **Mobile Menu**: Hamburger menu for mobile devices

### Article Interaction
- Browse articles on the home page or category pages
- Click on an article to view full details
- Read and post comments (requires authentication)
- View related content

## Responsive Design

The website is fully responsive with breakpoints at:
- **Desktop**: 1200px and above
- **Tablet**: 768px - 1199px
- **Mobile**: Below 768px

Mobile features include:
- Collapsible navigation menu
- Stacked article layouts
- Optimized touch targets
- Responsive typography

## Backend Integration

The project is structured for backend integration:
- **API Service Layer**: Centralized API calls in `src/services/api.js`
- **Environment Variables**: Configure `REACT_APP_API_BASE_URL` for backend URL
- **Ready Endpoints**: Pre-configured for auth, articles, comments, and categories
- **Empty States**: Components show appropriate messages when no backend data

### API Endpoints Expected
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/articles` - Fetch articles (with optional category filter)
- `GET /api/articles/:id` - Fetch single article
- `POST /api/comments` - Post a comment
- `GET /api/comments/:articleId` - Fetch article comments

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

## Configuration

### Port Configuration
- Frontend runs on port **3001** (configured in `package.json`)
- Backend should run on port **3000**
- Update `REACT_APP_API_BASE_URL` in `.env` file if needed

### Styling
- Each component uses styled-components for scoped styling
- Global styles in `src/index.css`
- Responsive breakpoints: 768px (mobile), 1024px (tablet), 1200px (desktop)

### Adding Features
- Connect to backend API by setting environment variables
- Extend API service layer in `src/services/api.js`
- Add new category pages following existing patterns
- Implement search functionality
- Add user profile management

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available under the MIT License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For questions or support, please open an issue in the repository.



