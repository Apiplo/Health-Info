# HealthInfo Website

A modern, responsive health information website built with React.js featuring login functionality, video upload capabilities, and mobile-responsive design.

## Features

- **Modern UI Design**: Clean, professional interface with health-focused branding
- **User Authentication**: Login/logout functionality with protected routes
- **Video Upload**: Upload and display video content (requires authentication)
- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **Mock Data**: Pre-populated content for demonstration purposes
- **Article Management**: Featured articles and categorized content sections

## Screenshots

The website includes:
- Login page with "Healthy" branding
- Home page with featured health articles
- Health news and living style sections
- Article detail pages with video upload functionality
- Responsive navigation header

## Technologies Used

- React 18.2.0
- React Router DOM 6.8.1
- Styled Components 5.3.9
- CSS3 with responsive design
- HTML5 semantic markup

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd health-info-website
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
   Navigate to `http://localhost:3000`

## Project Structure

```
src/
├── components/
│   ├── Header.js          # Navigation header with auth
│   ├── Login.js           # Login form component
│   ├── Home.js            # Home page with articles
│   └── ArticleDetail.js   # Article detail with video upload
├── contexts/
│   └── AuthContext.js     # Authentication state management
├── data/
│   └── mockData.js        # Mock data for articles
├── App.js                 # Main app component with routing
└── index.js               # Entry point
```

## Usage

### Authentication
- Use any username/password combination to login (mock authentication)
- Protected routes require authentication
- Logout functionality available in header

### Video Upload
- Navigate to any article detail page
- Click "Choose Video File" button (requires login)
- Select a video file to upload
- Video will be displayed with HTML5 video player

### Navigation
- **Disease, Trendings, Style**: Navigation categories
- **Login/Sign Up**: Authentication buttons
- **Mobile Menu**: Hamburger menu for mobile devices

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

## Mock Data

The website uses mock data for:
- Health news articles
- Living style content
- Featured articles
- User authentication

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

## Customization

### Styling
- Modify styled-components in each component
- Update color scheme in `src/index.css`
- Adjust responsive breakpoints as needed

### Content
- Update mock data in `src/data/mockData.js`
- Modify article content and structure
- Add new article categories

### Features
- Integrate real API endpoints
- Add user registration
- Implement real video storage
- Add search functionality

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



