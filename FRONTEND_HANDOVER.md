# Health-Info Frontend Handover Document

**Project:** Health-Info Website  
**Framework:** React 18.2.0  
**Last Updated:** December 1, 2025
**Frontend Port:** 3001  
**Backend API Port:** 3000  

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Key Features](#key-features)
5. [Configuration](#configuration)
6. [Component Architecture](#component-architecture)
7. [State Management](#state-management)
8. [API Integration](#api-integration)
9. [Styling Approach](#styling-approach)
10. [Running the Application](#running-the-application)
11. [Known Issues & Limitations](#known-issues--limitations)
12. [Future Enhancements](#future-enhancements)
13. [Troubleshooting](#troubleshooting)

---

## Project Overview

Health-Info is a modern, responsive health information website that provides articles across multiple categories (Health, Technology, Sport). The application features user authentication, multi-language support (English/Bangla), and a clean, professional UI designed for optimal user experience.

### Key Objectives
- Provide health-related articles and information
- Support bilingual content (English and Bangla)
- Implement user authentication and authorization
- Create a responsive, mobile-first design
- Prepare for backend integration

---

## Technology Stack

### Core Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.8.1",
  "styled-components": "^5.3.11",
  "react-icons": "^5.5.0",
  "react-scripts": "^5.0.1",
  "web-vitals": "^2.1.4"
}
```

### Development Tools
- **Build Tool:** Create React App (react-scripts)
- **CSS-in-JS:** Styled Components
- **Icons:** React Icons (Font Awesome)
- **Routing:** React Router DOM v6

---

## Project Structure

```
Health-Info/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Admin/
│   │   │   ├── AdminHome.js
│   │   │   ├── AdminArticles.js
│   │   │   ├── AdminUsers.js
│   │   │   ├── AdminTags.js
│   │   │   ├── AdminCategories.js
│   │   │   ├── AdminCategoryArticles.js
│   │   │   ├── AdminHealth.js
│   │   │   ├── AdminLayout.js
│   │   │   └── AdminNav.js
│   │   ├── ArticleDetail/
│   │   │   ├── ArticleDetail.js
│   │   │   └── ArticleDetail.css
│   │   ├── Footer/
│   │   │   ├── Footer.js
│   │   │   └── Footer.css
│   │   ├── ForgotPassword/
│   │   │   ├── ForgotPassword.js
│   │   │   └── ForgotPassword.css
│   │   ├── Header/
│   │   │   ├── Header.js
│   │   │   └── Header.css
│   │   ├── HealthPage/
│   │   │   ├── HealthPage.js
│   │   │   └── HealthPage.css
│   │   ├── Home/
│   │   │   ├── Home.js
│   │   │   └── Home.css
│   │   ├── LanguageToggle/
│   │   │   ├── LanguageToggle.js
│   │   │   └── LanguageToggle.css
│   │   ├── Login/
│   │   │   ├── Login.js
│   │   │   └── Login.css
│   │   ├── Register/
│   │   │   ├── Register.js
│   │   │   └── Register.css
│   │   ├── SportPage/
│   │   │   ├── SportPage.js
│   │   │   └── SportPage.css
│   │   └── TechnologyPage/
│   │       ├── TechnologyPage.js
│   │       └── TechnologyPage.css
│   ├── contexts/
│   │   ├── AuthContext.js
│   │   └── LanguageContext.js
│   ├── hooks/
│   │   ├── useTranslation.js
│   │   └── useSearchSuggestions.js
│   ├── services/
│   │   ├── searchService.js
│   │   ├── tagService.js
│   │   ├── categoryService.js
│   │   └── commentsService.js
│   ├── data/
│   │   ├── config.js
│   │   └── mockData.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

---

## Key Features

### 1. User Authentication
- **Login/Logout:** Full authentication flow
- **Registration:** New user sign-up
- **Password Recovery:** Forgot password functionality
- **Protected Routes:** Route guards for authenticated content
- **Role-Based Access:** Admin, Editor, and Reader roles
- **Token Management:** JWT token storage in localStorage

### 2. Multi-Language Support
- **Languages:** English and Bangla
- **Toggle Button:** Header-based language switcher
- **Persistent Selection:** Language preference saved in localStorage
- **Translation Hook:** Custom `useTranslation` hook for DOM element translation
- **Context API:** `LanguageContext` for global language state

### 3. Content Management
- **Health:** Health-related articles
- **Technology:** Tech news and updates
- **Sport:** Sports articles and news
- **Most Popular:** Featured articles on homepage
- **Tag System:** Comprehensive tagging for content organization
- **Category Management:** Hierarchical content categorization

### 4. Search Functionality
- **Real-time Suggestions:** Debounced search with autocomplete
- **Multi-type Search:** Search across articles, categories, and tags
- **Language-aware:** Search results in current language
- **Backend Integration:** Connected to search API endpoints

### 5. Admin Panel
- **Dashboard:** Overview with statistics and quick access
- **User Management:** Complete CRUD operations for users
- **Role Management:** Admin, Editor, Reader role assignments
- **Content Management:** Article, category, and tag management
- **Category Articles:** View articles by category
- **Bilingual Support:** Manage content in both English and Bangla

### 6. Responsive Design
- **Mobile-First:** Optimized for mobile devices
- **Breakpoints:**
  - Desktop: 1200px+
  - Tablet: 768px - 1199px
  - Mobile: < 768px
- **Mobile Menu:** Collapsible hamburger navigation
- **Adaptive Layouts:** Flexible grid and flexbox layouts

### 7. UI/UX Features
- **Enhanced Search:** Header search with real-time suggestions
- **Article Cards:** Clean card-based article display
- **Image Handling:** Fallback images for missing content
- **Loading States:** Loading indicators during data fetch
- **Error Handling:** User-friendly error messages
- **Footer:** Consistent footer across all pages
- **Admin Interface:** Professional admin dashboard design

---

## Configuration

### Environment Variables
The application uses environment variables for configuration:

```bash
REACT_APP_API_BASE_URL=http://localhost:3000/api
```

**Default Values:**
- Frontend Port: `3001` (configured in package.json)
- Backend API: `http://localhost:3000/api`

### Port Configuration
The frontend runs on port 3001 to avoid conflicts with the backend:

```json
// package.json
"scripts": {
  "start": "set PORT=3001 && react-scripts start"
}
```

---

## Component Architecture

### Core Components

#### 1. App.js
- **Purpose:** Root component with routing configuration
- **Key Features:**
  - Context providers (Auth, Language)
  - Route definitions including admin routes
  - Protected route wrapper
  - Admin route wrapper with role-based access
  - Conditional header rendering (hidden on admin routes)

#### 2. Header Component
- **Location:** `src/components/Header/Header.js`
- **Features:**
  - Navigation links (Health, Technology, Sport)
  - Search functionality with suggestions
  - Language toggle
  - Authentication buttons (Login/Logout/Sign Up)
  - Mobile hamburger menu
  - User state display
- **Dependencies:** AuthContext, LanguageContext, useTranslation, useSearchSuggestions

#### 3. Home Component
- **Location:** `src/components/Home/Home.js`
- **Features:**
  - Fetches articles from backend API
  - Displays "Most Popular" articles
  - Language-aware content loading
  - Image URL resolution
  - Loading and error states
  - Advertisement column (desktop only)
- **API Endpoint:** `GET /api/articles/:lang`

#### 4. Category Pages
- **Components:** HealthPage, TechnologyPage, SportPage
- **Pattern:** All follow similar structure
- **Features:**
  - Category-specific article fetching
  - Empty state handling
  - Backend connection indicators
  - Responsive layouts

#### 5. ArticleDetail Component
- **Location:** `src/components/ArticleDetail/ArticleDetail.js`
- **Features:**
  - Full article display
  - Comments section
  - Video upload functionality (protected)
  - Related articles
  - Social sharing buttons

#### 6. Authentication Components
- **Login:** Email/password authentication
- **Register:** New user registration
- **ForgotPassword:** Password recovery flow
- **Features:**
  - Form validation
  - Error handling
  - Redirect after successful auth
  - Backend API integration

#### 7. LanguageToggle Component
- **Location:** `src/components/LanguageToggle/LanguageToggle.js`
- **Features:**
  - Toggle between English and Bangla
  - Visual loading indicator
  - Disabled state during translation
  - Tooltip with language name

#### 8. Footer Component
- **Location:** `src/components/Footer/Footer.js`
- **Features:**
  - Consistent footer across pages
  - Links and information
  - Responsive design

### Admin Components

#### 9. AdminLayout Component
- **Location:** `src/components/Admin/AdminLayout.js`
- **Features:**
  - Consistent admin layout wrapper
  - Admin navigation sidebar
  - Responsive design for admin interface

#### 10. AdminHome Component
- **Location:** `src/components/Admin/AdminHome.js`
- **Features:**
  - Admin dashboard with statistics
  - Article counts by category
  - Quick access cards to different admin sections
  - Overview of system content

#### 11. AdminUsers Component
- **Location:** `src/components/Admin/AdminUsers.js`
- **Features:**
  - Complete user management system
  - User creation, editing, deletion
  - Role-based filtering (admin, editor, reader)
  - User activation/deactivation
  - Search functionality
  - Tab-based interface for different user roles

#### 12. AdminTags Component
- **Location:** `src/components/Admin/AdminTags.js`
- **Features:**
  - Tag management with CRUD operations
  - Bilingual tag support (English/Bangla)
  - Tag code validation
  - Search and filter functionality
  - Link to view articles by tag

#### 13. AdminCategories Component
- **Location:** `src/components/Admin/AdminCategories.js`
- **Features:**
  - Category management with full CRUD operations
  - Bilingual category support
  - Category code generation
  - Search functionality
  - Link to view articles by category

#### 14. AdminCategoryArticles Component
- **Location:** `src/components/Admin/AdminCategoryArticles.js`
- **Features:**
  - View all articles within a specific category
  - Language switching for category articles
  - Article metadata display
  - Navigation back to category management

#### 15. AdminArticles Component
- **Location:** `src/components/Admin/AdminArticles.js`
- **Features:**
  - Article management interface
  - Article creation and editing
  - Category and tag assignment
  - Bilingual content management

#### 16. AdminHealth Component
- **Location:** `src/components/Admin/AdminHealth.js`
- **Features:**
  - Health-specific article management
  - Category-focused content administration

---

## State Management

### Context API Implementation

#### 1. AuthContext
**Location:** `src/contexts/AuthContext.js`

**State:**
```javascript
{
  isAuthenticated: boolean,
  user: object | null,
  token: string | null
}
```

**Methods:**
- `login(email, password)` - Authenticates user
- `logout()` - Clears authentication state

**API Integration:**
- Endpoint: `POST /api/auth/login`
- Token storage: localStorage
- Automatic token retrieval on mount

#### 2. LanguageContext
**Location:** `src/contexts/LanguageContext.js`

**State:**
```javascript
{
  currentLanguage: 'en' | 'bn',
  isTranslating: boolean,
  isEnglish: boolean,
  isBangla: boolean
}
```

**Methods:**
- `toggleLanguage()` - Switches between languages
- `setCurrentLanguage(lang)` - Sets specific language
- `setIsTranslating(bool)` - Updates translation state

**Persistence:**
- Language preference saved in localStorage
- Auto-loads saved preference on mount

### Custom Hooks

#### useTranslation Hook
**Location:** `src/hooks/useTranslation.js`

**Purpose:** Provides DOM element reference for translation

**Usage:**
```javascript
const elementRef = useTranslation();
return <div ref={elementRef}>Content to translate</div>
```

#### useSearchSuggestions Hook
**Location:** `src/hooks/useSearchSuggestions.js`

**Purpose:** Provides debounced search suggestions from backend

**Features:**
- Debounced API calls (250ms delay)
- Language-aware suggestions
- Loading states management
- Automatic cancellation on component unmount

**Usage:**
```javascript
const { suggestions, loading } = useSearchSuggestions(query);
```

---

## API Integration

### Backend Configuration
- **Base URL:** `http://localhost:3000/api`
- **Port:** 3000
- **Protocol:** HTTP (REST API)

### API Endpoints

#### Authentication
```
POST /api/auth/login
Body: { email, password }
Response: { token, user }

POST /api/auth/register
Body: { email, password, displayName }
Response: { token, user }
```

#### Articles
```
GET /api/articles/:lang
Params: lang (en | bn)
Response: Article[]

GET /api/articles/:id
Response: Article

GET /api/articles/category/:category
Response: Article[]
```

#### Search
```
GET /api/search/suggestions?q=<query>&lang=<lang>&limit=<limit>&perTypeLimit=<perTypeLimit>&types=<types>
Response: { suggestions: Array }
```

#### Categories
```
GET /api/categories?lang=<lang>
Response: Category[]

GET /api/categories/:id
Response: Category

GET /api/categories/:id/articles?lang=<lang>
Response: Article[]

POST /api/categories
Body: { name_en, name_bn }
Headers: { Authorization: Bearer <token> }
Response: Category

PUT /api/categories/:id
Body: { name_en, name_bn }
Headers: { Authorization: Bearer <token> }
Response: Category

DELETE /api/categories/:id
Headers: { Authorization: Bearer <token> }
```

#### Tags
```
GET /api/tags?lang=<lang>
Response: Tag[]

POST /api/tags
Body: { code, name_en, name_bn }
Headers: { Authorization: Bearer <token> }
Response: Tag

PUT /api/tags/:code
Body: { name_en, name_bn }
Headers: { Authorization: Bearer <token> }
Response: Tag

DELETE /api/tags/:code
Headers: { Authorization: Bearer <token> }
```

#### Users (Admin)
```
GET /api/users
Headers: { Authorization: Bearer <token> }
Response: User[]

PUT /api/users/:id
Body: { displayName, email, role }
Headers: { Authorization: Bearer <token> }
Response: User

PUT /api/users/:id/activate
Body: { isActive: boolean }
Headers: { Authorization: Bearer <token> }

DELETE /api/users/:id
Headers: { Authorization: Bearer <token> }
```

#### Comments
```
GET /api/comments/:articleId
Response: Comment[]

POST /api/comments
Body: { articleId, content }
Headers: { Authorization: Bearer <token> }
Response: Comment
```

### API Call Pattern

**Example from Home.js:**
```javascript
const response = await fetch(`http://localhost:3000/api/articles/${currentLanguage}`);
if (!response.ok) {
  throw new Error(`HTTP error! status: ${response.status}`);
}
const articles = await response.json();
```

### Image URL Resolution
The application handles both absolute and relative image URLs:

```javascript
const resolveImageUrl = (src) => {
  if (!src) return '';
  if (/^https?:\/\//i.test(src)) return src;
  try {
    const origin = new URL(apiBase).origin;
    if (src.startsWith('/')) return `${origin}${src}`;
    return `${origin}/${src}`;
  } catch (e) {
    return src;
  }
};
```

### Error Handling
- Network errors caught and displayed to user
- Fallback to placeholder images
- Empty state messages when no data available
- Console logging for debugging

---

## Styling Approach

### Hybrid Styling Strategy

#### 1. Styled Components (CSS-in-JS)
Used for:
- Layout containers
- Responsive breakpoints
- Dynamic styling based on props
- Component-scoped styles

**Example:**
```javascript
const HomeContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;
```

#### 2. CSS Modules
Used for:
- Component-specific styles
- Complex layouts
- Animation and transitions
- Class-based styling

**Pattern:** Each component has a corresponding `.css` file

### Responsive Design Patterns

**Breakpoints:**
```css
/* Desktop */
@media (min-width: 1200px) { }

/* Tablet */
@media (max-width: 1024px) { }

/* Mobile */
@media (max-width: 768px) { }
```

**Mobile-First Approach:**
- Base styles for mobile
- Progressive enhancement for larger screens
- Flexible layouts using flexbox and grid
- Touch-friendly UI elements

### Color Scheme
- Primary: Health-focused green/blue tones
- Background: White (#ffffff)
- Text: Dark gray for readability
- Accents: Brand colors for CTAs
- Borders: Light gray (#d1d5db)

---

## Running the Application

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Backend server running on port 3000

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd Health-Info
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment (optional):**
Create `.env` file:
```
REACT_APP_API_BASE_URL=http://localhost:3000/api
```

4. **Start development server:**
```bash
npm start
```

The application will open at `http://localhost:3001`

### Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject from Create React App (irreversible)
npm run eject
```

### Production Build

```bash
npm run build
```

Creates optimized production build in `build/` folder:
- Minified JavaScript and CSS
- Optimized images
- Service worker for caching
- Static files ready for deployment

---

## Known Issues & Limitations

### Current State
1. **Backend Connection Required:**
   - Frontend expects backend API at `http://localhost:3000/api`
   - All placeholder/mock data has been removed
   - Empty states shown when backend is unavailable

2. **Comments API Issues:**
   - Comments API not working properly
   - Comments will disappear if the page is reloaded
   - This issue might be originating from the backend

3. **Admin Site Limitations:**
   - Admin site cannot upload both English and Bangla articles at the same time
   - Current workflow: Upload in English first, then modify the article to add Bangla content
   - Some inconsistency in uploading process

4. **Video Functionality:**
   - API to fetch video is not implemented in frontend
   - Video display functionality incomplete

5. **Audio Output Issues:**
   - Audio output in Bangla cannot be heard in some browsers
   - Not properly tested across different browsers
   - Browser compatibility for Bangla audio needs investigation

6. **Translation Implementation:**
   - Client-side translation using Google Translate API
   - Translation may not be perfect for all content
   - Some UI elements marked with `data-no-translate` attribute

7. **Search Functionality:**
   - Search functionality is now implemented with suggestions
   - Search suggestions API is connected but may need backend optimization
   - Search results display needs refinement

8. **Image Handling:**
   - Relies on backend to serve images
   - Fallback to placeholder images when unavailable
   - Multiple image field names supported for flexibility

9. **Authentication:**
   - Token stored in localStorage (consider security implications)
   - No token refresh mechanism implemented
   - Session persistence across page reloads

10. **Admin Panel Performance:**
    - Large user lists may cause performance issues
    - Pagination not implemented for admin data tables
    - Search functionality may be slow with large datasets

11. **Category and Tag Management:**
    - No bulk operations for categories and tags
    - Category deletion may leave orphaned articles
    - Tag deletion removes associations but may need cleanup

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ features used (may need polyfills for older browsers)
- CSS Grid and Flexbox required
- Bangla audio playback issues in certain browsers

---

## Future Enhancements

### Recommended Improvements

1. **Sub-Category Implementation:**
   - Implement sub-category functionality for better content organization
   - Example: If main category is "Sport", sub-categories would include "Football", "Basketball", "Tennis", etc.
   - Similar structure for "Health" (Nutrition, Fitness, Mental Health) and "Technology" (AI, Mobile, Web Development)
   - Update navigation and filtering to support hierarchical categories

2. **Footer Enhancement:**
   - Improve footer to provide comprehensive information related to the organization
   - Include organization details, mission statement, and contact information
   - Add links to important pages (About Us, Privacy Policy, Terms of Service)
   - Include social media links and newsletter subscription

3. **Performance Optimization:**
   - Implement React.lazy() for code splitting
   - Add image lazy loading
   - Optimize bundle size
   - Implement service worker for offline support

4. **Enhanced Features:**
   - Enhanced search with advanced filtering and sorting
   - Article bookmarking and favorites
   - User profile management with avatars
   - Social media integration and sharing
   - Comment reactions (likes, replies)
   - Article sharing functionality with rich previews
   - Reading history and recommendations

5. **Security Enhancements:**
   - Implement token refresh mechanism
   - Add CSRF protection
   - Secure token storage (consider httpOnly cookies)
   - Input sanitization for user content

6. **UX Improvements:**
   - Skeleton loaders instead of loading text
   - Infinite scroll for article lists
   - Advanced filtering and sorting
   - Reading progress indicator
   - Dark mode support

7. **Testing:**
   - Unit tests for components
   - Integration tests for API calls
   - E2E tests for critical user flows
   - Accessibility testing
   - Cross-browser testing for audio/video features

8. **Internationalization:**
   - More robust i18n solution (react-i18next)
   - Support for additional languages
   - RTL support for applicable languages
   - Date/time localization

9. **Admin Features:**
   - Enhanced admin dashboard with real-time statistics
   - Simultaneous English and Bangla article upload
   - Improved article CRUD operations with bulk actions
   - Advanced user management with permissions
   - Analytics and reporting with charts
   - Content scheduling and publishing workflow
   - Audit logs for admin actions
   - Import/export functionality for content

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use
**Error:** `Port 3001 is already in use`

**Solution:**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Change port in package.json
"start": "set PORT=3002 && react-scripts start"
```

#### 2. Backend Connection Failed
**Error:** `Failed to load articles. Please check your backend connection.`

**Solutions:**
- Verify backend server is running on port 3000
- Check CORS configuration on backend
- Verify API endpoint URLs
- Check network/firewall settings

#### 3. Translation Not Working
**Issue:** Content not translating when language is switched

**Solutions:**
- Check browser console for errors
- Verify Google Translate API is accessible
- Ensure elements have proper `ref` from `useTranslation` hook
- Check `data-no-translate` attributes

#### 4. Images Not Loading
**Issue:** Article images showing placeholder

**Solutions:**
- Verify backend is serving images correctly
- Check image URL format in API response
- Verify CORS headers for image requests
- Check browser console for 404 errors

#### 5. Authentication Issues
**Issue:** Login successful but user not authenticated

**Solutions:**
- Check localStorage for token
- Verify token format from backend
- Check AuthContext state in React DevTools
- Clear localStorage and try again

#### 6. Styling Issues
**Issue:** Styles not applying correctly

**Solutions:**
- Clear browser cache
- Check for CSS conflicts
- Verify styled-components version
- Check browser console for CSS errors

### Debug Mode

Enable detailed logging:
```javascript
// Add to component
useEffect(() => {
  console.log('Component State:', { loading, error, data });
}, [loading, error, data]);
```

### Browser DevTools
- **React DevTools:** Inspect component state and props
- **Network Tab:** Monitor API calls and responses
- **Console:** Check for errors and warnings
- **Application Tab:** Inspect localStorage and session data

---

## Contact & Support

### Development Team
- **Frontend Lead:** [Your Name]
- **Backend Team:** [Backend Team Contact]
- **Project Manager:** [PM Contact]

### Documentation
- **API Documentation:** [Link to API docs]
- **Design System:** [Link to design docs]
- **Project Board:** [Link to project management tool]

### Resources
- **Repository:** [GitHub/GitLab URL]
- **Staging Environment:** [Staging URL]
- **Production Environment:** [Production URL]

---

## Handover Checklist

- [ ] All dependencies installed and documented
- [ ] Environment variables configured
- [ ] Backend API connection verified
- [ ] All routes tested and functional
- [ ] Authentication flow working
- [ ] Language toggle operational
- [ ] Responsive design verified on multiple devices
- [ ] Error handling implemented
- [ ] Loading states present
- [ ] Code commented and documented
- [ ] README.md updated
- [ ] Known issues documented
- [ ] Future enhancements listed
- [ ] Deployment process documented

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | Nov 2025 | Initial handover document | [Your Name] |
| 1.1.0 | Dec 2025 | Added search functionality, admin panel enhancements, and new API endpoints | [Your Name] |

---

**Last Updated:** December 1, 2025
**Document Version:** 1.1.0
**Status:** Updated with New Features
