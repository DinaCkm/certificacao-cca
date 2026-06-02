import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { UserDataProvider } from "./contexts/UserDataContext";
import { GlobalHeader } from "./components/GlobalHeader";
import { GlobalFooter } from "./components/GlobalFooter";
import { NavigationSidebar } from "./components/NavigationSidebar";
import Home from "./pages/Home";
import { ExamSecurityCheck } from "./pages/ExamSecurityCheck";
import { CertificationTypeSelection } from "./pages/CertificationTypeSelection";
import { CertificationLevelSelection } from "./pages/CertificationLevelSelection";
import { RequirementsValidation } from "./pages/RequirementsValidation";
import { SelectCertificationType } from "./pages/SelectCertificationType";
import { SelectCertificationLevel } from "./pages/SelectCertificationLevel";
import { ViewFlowchart } from "./pages/ViewFlowchart";
import { Step2, Step3, Step4, Step5, Step6, Step7, Step8, Step9 } from "./pages/Steps";
import { PaymentCheckout } from "./pages/PaymentCheckout";
import { WelcomeCourses } from "./pages/WelcomeCourses";
import { CoursesPlatform } from "./pages/CoursesPlatform";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={SelectCertificationType} />
      <Route path={"/home"} component={Home} />
      <Route path={"/select-certification-type"} component={SelectCertificationType} />
      <Route path={"/view-flowchart"} component={ViewFlowchart} />
      <Route path={"/select-level"} component={SelectCertificationLevel} />
      <Route path={"/certification-type"} component={CertificationTypeSelection} />
      <Route path={"/requirements-validation"} component={RequirementsValidation} />
      <Route path={"/certification-level"} component={CertificationLevelSelection} />
      <Route path={"/step-2"} component={Step2} />
      <Route path={"/step-3"} component={Step3} />
      <Route path={"/step-4"} component={Step4} />
      <Route path={"/payment"} component={PaymentCheckout} />
      <Route path={"/welcome-courses"} component={WelcomeCourses} />
      <Route path={"/courses-learning"} component={CoursesPlatform} />
      <Route path={"/exam-security-check"} component={ExamSecurityCheck} />
      <Route path={"/step-5"} component={Step5} />
      <Route path={"/step-6"} component={Step6} />
      <Route path={"/step-7"} component={Step7} />
      <Route path={"/step-8"} component={Step8} />
      <Route path={"/step-9"} component={Step9} />

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
  const [location] = useLocation();
  const isInitialPage = location === "/" || location === "/select-certification-type" || location === "/select-level";

  return (
    <ErrorBoundary>
      <UserDataProvider>
        <ThemeProvider
          defaultTheme="light"
          // switchable
        >
          <TooltipProvider>
            <Toaster />
            {!isInitialPage && <GlobalHeader />}
            <div className={isInitialPage && location === "/" ? "" : "flex"}>
              {!(isInitialPage && location === "/") && <NavigationSidebar />}
              <div className={isInitialPage && location === "/" ? "w-full" : "flex-1 min-h-screen"}>
                <Router />
              </div>
            </div>
            {!isInitialPage && <GlobalFooter />}
          </TooltipProvider>
        </ThemeProvider>
      </UserDataProvider>
    </ErrorBoundary>
  );
}

export default App;
// Updated at Tue Jun  2 17:58:01 UTC 2026
