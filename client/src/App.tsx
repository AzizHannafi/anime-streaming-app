import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AgeVerificationProvider } from "./contexts/AgeVerificationContext";
import Home from "./pages/Home";
import AnimeDetail from "./pages/AnimeDetail";
import Favorites from "./pages/Favorites";
import Search from "./pages/Search";


function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/anime/:id"} component={AnimeDetail} />
      <Route path={"/favorites"} component={Favorites} />
      <Route path={"/search"} component={Search} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AgeVerificationProvider>
        <ThemeProvider defaultTheme="dark">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AgeVerificationProvider>
    </ErrorBoundary>
  );
}

export default App;
