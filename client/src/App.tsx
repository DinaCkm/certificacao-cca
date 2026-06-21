import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { UserDataProvider } from "./contexts/UserDataContext";
import { GlobalHeader } from "./components/GlobalHeader";
import { GlobalFooter } from "./components/GlobalFooter";

import Home from "./pages/Home";
import { ExamSecurityCheck } from "./pages/ExamSecurityCheck";
import { CertificationTypeSelection } from "./pages/CertificationTypeSelection";
import { CertificationLevelSelection } from "./pages/CertificationLevelSelection";
import { RequirementsValidation } from "./pages/RequirementsValidation";
import { SelectCertificationType } from "./pages/SelectCertificationType";
import { SelectCertificationLevel } from "./pages/SelectCertificationLevel";
import { SelectCertificationLevelCAC } from "./pages/SelectCertificationLevelCAC";
import { SelectCertificationLevelCCA } from "./pages/SelectCertificationLevelCCA";
import { SelectCertificationLevelLiders } from "./pages/SelectCertificationLevelLiders";

import { Step2, Step3, Step4, Step5, Step6, Step7, Step8, Step9 } from "./pages/Steps";
import { PaymentCheckout } from "./pages/PaymentCheckout";
import { WelcomeCourses } from "./pages/WelcomeCourses";
import { CoursesPlatform } from "./pages/CoursesPlatform";
import { ExamResults } from "./pages/ExamResults";
import { DocumentalAnalysisCheckout } from "./pages/DocumentalAnalysisCheckout";
import { LattesCurriculumForm } from "./pages/LattesCurriculumForm";
import { Level2Information } from "./pages/Level2Information";
import { Level2LattesValidation } from "./pages/Level2LattesValidation";
import { Level2TermsAndWarning } from "./pages/Level2TermsAndWarning";
import { Level2Checkout } from "./pages/Level2Checkout";
import { CertificationDirectPreparationCheck } from "./pages/CertificationDirectPreparationCheck";
import { DirectCertificationForm } from "./pages/DirectCertificationForm";
import { DirectCertificationWaitingInfo } from "./pages/DirectCertificationWaitingInfo";
import { DirectCertificationInterviewScheduling } from "./pages/DirectCertificationInterviewScheduling";
import { DirectCertificationInterviewRoom } from "./pages/DirectCertificationInterviewRoom";
import { DirectCertificationResult } from "./pages/DirectCertificationResult";
import { DirectRecordingPlayback } from "./pages/DirectRecordingPlayback";
import { InterviewScheduling } from "./pages/InterviewScheduling";
import { InterviewRoom } from "./pages/InterviewRoom";
import { InterviewResult } from "./pages/InterviewResult";
import { SelectPurchaseType } from "./pages/SelectPurchaseType";

// ── Novo Fluxo ANEFAC ──────────────────────────────────────────────────────
import { CertificationProvider } from "./contexts/CertificationContext";
import { SiteConfigProvider } from "./contexts/SiteConfigContext";
import { Home as SiteHome } from "./pages/site/Home";
import { Certificacoes } from "./pages/site/Certificacoes";
import { ComoFuncionaCert } from "./pages/site/ComoFuncionaCert";
import { Simulacao } from "./pages/site/Simulacao";
import { CertificacaoDetalhe } from "./pages/site/CertificacaoDetalhe";
import LandingPage from "./pages/LandingPage";
import { SelecionarCertificacao } from "./pages/novo-fluxo/SelecionarCertificacao";
import { AreaCandidato } from "./pages/novo-fluxo/AreaCandidato";
import { Cadastro } from "./pages/novo-fluxo/Cadastro";
import { UploadDocumentos } from "./pages/novo-fluxo/UploadDocumentos";
import { PagamentoAnalise } from "./pages/novo-fluxo/PagamentoAnalise";
import { AguardandoValidacao } from "./pages/novo-fluxo/AguardandoValidacao";
import { Prova } from "./pages/novo-fluxo/Prova";
import { ResultadoProva } from "./pages/novo-fluxo/ResultadoProva";
import { AgendamentoEntrevista } from "./pages/novo-fluxo/AgendamentoEntrevista";
import { SalaEntrevista } from "./pages/novo-fluxo/SalaEntrevista";
import { ResultadoEntrevista } from "./pages/novo-fluxo/ResultadoEntrevista";
import { PagamentoEmissao } from "./pages/novo-fluxo/PagamentoEmissao";
import { EmissaoCertificado } from "./pages/novo-fluxo/EmissaoCertificado";
import { ProcessoEncerrado } from "./pages/novo-fluxo/ProcessoEncerrado";
import { AdminValidacaoDocumental } from "./pages/novo-fluxo/admin/ValidacaoDocumental";
import { AdminLogin } from "./pages/novo-fluxo/admin/AdminLogin";
import { AdminRoute } from "./components/AdminRoute";
import { AdminDashboard } from "./pages/novo-fluxo/admin/AdminDashboard";
import { AdminCertificacoes } from "./pages/novo-fluxo/admin/AdminCertificacoes";
import { AdminSiteConfig } from "./pages/novo-fluxo/admin/AdminSiteConfig";
import { AdminInstitucional } from "./pages/novo-fluxo/admin/AdminInstitucional";
import { InstitucionalProvider } from "./contexts/InstitucionalContext";
import { CourseProvider } from "./contexts/CourseContext";
import { Cursos } from "./pages/site/Cursos";
import { AdminCursos } from "./pages/novo-fluxo/admin/AdminCursos";
import { AdminUsuarios } from "./pages/novo-fluxo/admin/AdminUsuarios";
import { AdminCarrossel } from "./pages/novo-fluxo/admin/AdminCarrossel";
// ───────────────────────────────────────────────────────────────────────────

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={SiteHome} />
      <Route path={"/certificacoes"} component={Certificacoes} />
      <Route path={"/certificacoes/:id"} component={CertificacaoDetalhe} />
      <Route path={"/como-funciona/:id"} component={ComoFuncionaCert} />
      <Route path={"/simulacao"} component={Simulacao} />
      <Route path={"/cursos"} component={Cursos} />
      <Route path={"/home"} component={Home} />
      <Route path={"/select-certification-type"} component={SelectCertificationType} />

      <Route path={"/select-level"} component={SelectCertificationLevel} />
      <Route path={"/select-level-cac"} component={SelectCertificationLevelCAC} />
      <Route path={"/select-level-cca"} component={SelectCertificationLevelCCA} />
      <Route path={"/select-level-liders"} component={SelectCertificationLevelLiders} />
      <Route path={"/select-purchase-type"} component={SelectPurchaseType} />
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
      <Route path={"/exam-results"} component={ExamResults} />
      <Route path={"/documental-analysis-checkout"} component={DocumentalAnalysisCheckout} />
      <Route path={"/step-5"} component={Step5} />
      <Route path={"/step-6"} component={Step6} />
      <Route path={"/step-7"} component={Step7} />
      <Route path={"/step-8"} component={Step8} />
      <Route path={"/step-9"} component={Step9} />
      <Route path={"/lattes-curriculum-form"} component={LattesCurriculumForm} />
      <Route path={"/level2-information"} component={Level2Information} />
      <Route path={"/level2-lattes-validation"} component={Level2LattesValidation} />
      <Route path={"/level2-terms-warning"} component={Level2TermsAndWarning} />
      <Route path={"/level2-checkout"} component={Level2Checkout} />
      <Route path={"/certification-direct-preparation-check"} component={CertificationDirectPreparationCheck} />
      <Route path={"/direct-certification-form"} component={DirectCertificationForm} />
      <Route path={"/direct-certification-waiting"} component={DirectCertificationWaitingInfo} />
      <Route path={"/direct-interview-scheduling"} component={DirectCertificationInterviewScheduling} />
      <Route path={"/direct-interview-room"} component={DirectCertificationInterviewRoom} />
      <Route path={"/direct-certification-result"} component={DirectCertificationResult} />
      <Route path={"/direct-recording-playback"} component={DirectRecordingPlayback} />
      <Route path={"/interview-scheduling"} component={InterviewScheduling} />
      <Route path={"/interview-room"} component={InterviewRoom} />
      <Route path={"/interview-result"} component={InterviewResult} />

      {/* ── Novo Fluxo ANEFAC ─────────────────────────────────────────────── */}
      <Route path={"/novo-fluxo"} component={AreaCandidato} />
      <Route path={"/novo-fluxo/selecionar"} component={SelecionarCertificacao} />
      <Route path={"/novo-fluxo/cadastro"} component={Cadastro} />
      <Route path={"/novo-fluxo/upload-documentos"} component={UploadDocumentos} />
      <Route path={"/novo-fluxo/pagamento-analise"} component={PagamentoAnalise} />
      <Route path={"/novo-fluxo/aguardando-validacao"} component={AguardandoValidacao} />
      <Route path={"/novo-fluxo/prova"} component={Prova} />
      <Route path={"/novo-fluxo/resultado-prova"} component={ResultadoProva} />
      <Route path={"/novo-fluxo/agendamento-entrevista"} component={AgendamentoEntrevista} />
      <Route path={"/novo-fluxo/sala-entrevista"} component={SalaEntrevista} />
      <Route path={"/novo-fluxo/resultado-entrevista"} component={ResultadoEntrevista} />
      <Route path={"/novo-fluxo/pagamento-emissao"} component={PagamentoEmissao} />
      <Route path={"/novo-fluxo/emissao-certificado"} component={EmissaoCertificado} />
      <Route path={"/novo-fluxo/processo-encerrado"} component={ProcessoEncerrado} />
      <Route path={"/novo-fluxo/admin/login"} component={AdminLogin} />
      <Route path={"/novo-fluxo/admin"} component={() => <AdminRoute component={AdminDashboard} />} />
      <Route path={"/novo-fluxo/admin/validacao"} component={() => <AdminRoute component={AdminValidacaoDocumental} />} />
      <Route path={"/novo-fluxo/admin/certificacoes"} component={() => <AdminRoute component={AdminCertificacoes} />} />
      <Route path={"/novo-fluxo/admin/site"} component={() => <AdminRoute component={AdminSiteConfig} />} />
      <Route path={"/novo-fluxo/admin/institucional"} component={() => <AdminRoute component={AdminInstitucional} />} />
      <Route path={"/novo-fluxo/admin/cursos"} component={() => <AdminRoute component={AdminCursos} />} />
      <Route path={"/novo-fluxo/admin/usuarios"} component={() => <AdminRoute component={AdminUsuarios} />} />
      <Route path={"/novo-fluxo/admin/carrossel"} component={() => <AdminRoute component={AdminCarrossel} />} />
      {/* ─────────────────────────────────────────────────────────────────────── */}
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
  const isInitialPage =
    location === "/" ||
    location === "/select-certification-type" ||
    location === "/select-level" ||
    location.startsWith("/novo-fluxo") ||
    location === "/" ||
    location === "/certificacoes" ||
    location.startsWith("/certificacoes/") ||
    location.startsWith("/como-funciona/") ||
    location === "/simulacao" ||
    location === "/cursos";

  return (
    <ErrorBoundary>
      <SiteConfigProvider>
      <InstitucionalProvider>
      <CourseProvider>
      <CertificationProvider>
      <UserDataProvider>
        <ThemeProvider
          defaultTheme="light"
          // switchable
        >
          <TooltipProvider>
            <Toaster />
            {!isInitialPage && <GlobalHeader />}
            <div className={isInitialPage ? "" : ""}>
              <div className={isInitialPage && location === "/" ? "w-full" : "flex-1 min-h-screen"}>
                <Router />
              </div>
            </div>
            {!isInitialPage && <GlobalFooter />}
          </TooltipProvider>
        </ThemeProvider>
      </UserDataProvider>
      </CertificationProvider>
      </CourseProvider>
      </InstitucionalProvider>
      </SiteConfigProvider>
    </ErrorBoundary>
  );
}

export default App;
// Updated at Tue Jun  2 17:58:01 UTC 2026
