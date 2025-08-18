import React from "react";
import { AppBar, Typography, Box, Divider } from "@mui/material";

// ErrorBoundary component to handle errors in child components
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, errorInfo) { console.log(error, errorInfo); }
  render() {
    if (this.state.hasError) return <h1>Something went wrong.</h1>;
    return this.props.children;
  }
}

// Reusable card row (image placeholder + right content)
function ListCard({ title, excerpt }) {
  return (
    <Box sx={{ display: "flex", alignItems: "stretch", gap: 2, mx: 2, mb: 2 }}>
      {/* IMG placeholder */}
      <Box
        sx={{
          width: 140,
          minWidth: 140,
          height: 100,
          bgcolor: "white",
          borderRadius: 2,
          border: "2px solid #c7d9f2",
          display: "grid",
          placeItems: "center",
          boxShadow: "inset 0 1px 0 rgba(0,0,0,0.04)",
        }}
      >
        <Typography sx={{ fontWeight: 700, color: "grey.700" }}>IMG</Typography>
      </Box>

      {/* Right content panel */}
      <Box
        sx={{
          flex: 1,
          bgcolor: "#d7d9dd", // soft grey like your mock
          borderRadius: 2,
          px: 2,
          py: 1.5,
        }}
      >
        <Typography sx={{ fontWeight: 800, mb: 0.5 }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: 12, lineHeight: 1.4, color: "grey.800" }}>
          {excerpt}
        </Typography>
      </Box>
    </Box>
  );
}

// Section with title + list of three cards
function Section({ heading }) {
  const sampleTitle = "What Are the Health Benefits of Laughter?";
  const sampleExcerpt =
    "Whether you’re watching a comedy special, sharing a joke with a friend, or laughing at your own mistakes, the simple act of laughing can provide meaningful health benefits that go far beyond the moment.";

  return (
    <Box sx={{ mt: 3 }}>
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 800, color: "#1778d0", ml: 2, mb: 1 }}
      >
        {heading}
      </Typography>
      <Divider sx={{ borderColor: "rgba(0,0,0,0.12)", mx: 2, mb: 1.5 }} />
      <ListCard title={sampleTitle} excerpt={sampleExcerpt} />
      <ListCard title={sampleTitle} excerpt={sampleExcerpt} />
      <ListCard title={sampleTitle} excerpt={sampleExcerpt} />
    </Box>
  );
}

// Main default app
export default function Home() {
  return (
    <ErrorBoundary>
      {/* Optional: a very thin top bar to mirror the blue line in your screenshot */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: "#1778d0", height: 4 }} />
      
      {/* Page container */}
      <Box sx={{ maxWidth: 520, mx: "auto", py: 2 }}>
        <Section heading="Health News Top 3" />
        <Section heading="Living Style Top 3" />
      </Box>
    </ErrorBoundary>
  );
}
