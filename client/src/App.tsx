import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import { Step1, Step2, Step3, Step4, Step5, Step6, Step7, Step8, Step9, CoursesPage, CoursesRecoveryPage, CoursesPlatform, RecoveryCheckout, RetakeExamCheckout } from "./pages/Steps";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/step-1"} component={Step1} />
      <Route path={"/step-2"} component={Step2} />
      <Route path={"/step-3"} component={Step3} />
      <Route path={"/step-4"} component={Step4} />
      <Route path={"/step-5"} component={Step5} />
      <Route path={"/step-6"} component={Step6} />
      <Route path={"/step-7"} component={Step7} />
      <Route path={"/step-8"} component={Step8} />
      <Route path={"/step-9"} component={Step9} />
      <Route path={"/courses"} component={CoursesPage} />
      <Route path={"/courses-recovery"} component={CoursesRecoveryPage} />
      <Route path={"/courses-platform"} component={CoursesPlatform} />
      <Route path={"/recovery-checkout"} component={RecoveryCheckout} />
      <Route path={"/retake-exam-checkout"} component={RetakeExamCheckout} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
