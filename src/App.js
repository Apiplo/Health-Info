import React from "react";
import {BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography,Box} from '@mui/material';
import Home from './Components/Home';
import Admin from './Components/Admin'

// ErrorBoundary component to handle errors in child components
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false }; // Tracks if an error has occurred
  }

  // Updates state to display fallback UI when an error is caught
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  // Logs error information for debugging purposes
  componentDidCatch(error, errorInfo) {
    console.log(error, errorInfo);
  }

  // Renders error message if an error occurred, otherwise renders children
  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}


// Main application components
export default function App() {
  return(
  <ErrorBoundary>
    <Router>

      {/* Navigation bar */}
      <AppBar position = "static" sx ={{backgroundColor: '#1683E0'}}>
        <Toolbar sx ={{display: "flex", justifyContent: "space-between"}}>

          {/* Brand/Main Icon */}
          <Box sx={{display: "flex", alignItems: "center"}}>
            <Typography
              variant = "h4"
              component={Link}
              to ="/"
              sx={{
                flexGrow: 1,
                textDecoration: 'none', 
                color: 'inherit', 
                '&:visited': { color: 'inherit' }, // Styling or visited links
                '&:hover': { color: 'inherit' },   // Styling for hover state
                '&:active': { color: 'inherit' }   // Styling for active state
              }}>
              HealthInfo
            </Typography>
          </Box>

          {/* Menu Items */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 10 }}>
                {["Disease", "Trendings", "Style"].map((item) => (
            <Typography
              key={item}
              sx={{
                fontSize: 20,
                fontWeight: 600,
                cursor: "pointer",
                color: "white",
                "&:hover": {
                  color: "#cce7ff", // light blue on hover
                },
              }}
            >
              {item}
            </Typography>
          ))}
          </Box>


        {/* RIGHT — Balance box 
        Replace with Subscribe / Login / Search later */}
        <Box sx={{ display: "flex", alignItems: "center"}} > 
          <Typography
            sx ={{
              pl: 5,
              fontSize: 18,
              fontWeight: 600,  
              cursor: "pointer",
                color: "white",
                "&:hover": {
                  color: "#cce7ff", // light blue on hover
                },
            }}>
              Log In
          </Typography>
        </Box>
        </Toolbar>
      </AppBar>

      <Routes>
        <Route path="/" element ={<Home />}/> 
        <Route path="/Admin" element={<Admin />}/>
      </Routes>

          
    </Router>
  </ErrorBoundary>

    
  );
}


