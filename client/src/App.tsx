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

import { Step2, Step3, Step4, Step5, Step6, Step7, Step8, Step9 } from "./pages/Steps";

// ── Novo Fluxo ANEFAC ──────────────────────────────────────────────────────
import { CertificationProvider } from "./contexts/CertificationContext";
import { SiteConfigProvider } from "./contexts/SiteConfigContext";
import { Home as SiteHome } from "./pages/site/Home";
import { ComoFuncionaCert } from "./pages/site/ComoFuncionaCert";
import { ComoFunciona } from "./pages/site/ComoFunciona";
import { ComoFuncionaLideranca } from "./pages/site/ComoFuncionaLideranca";
import { Simulacao } from "./pages/site/Simulacao";
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
import { AdminProvaConfig } from "./pages/novo-fluxo/admin/AdminProvaConfig";
import { AdminFaleConosco } from "./pages/novo-fluxo/admin/AdminFaleConosco";
import { AdminCandidatos } from "./pages/novo-fluxo/admin/AdminCandidatos";
import { AdminCandidatoDetalhe } from "./pages/novo-fluxo/admin/AdminCandidatoDetalhe";
import { AceiteLGPD } from "./pages/novo-fluxo/AceiteLGPD";
import { NavbarGlobal } from "./components/NavbarGlobal";
import { FaleConosco } from "./components/FaleConosco";
import { NovoFluxoCertificacoes } from "./pages/novo-fluxo/NovoFluxoCertificacoes";
// ───────────────────────────────────────────────────────────────────────────

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={() => { window.location.replace("/novo-fluxo"); return null; }} />
      <Route path={"/certificacoes"} component={() => { window.location.replace("/novo-fluxo/certificacoes"); return null; }} />
      <Route path={"/certificacoes/:id"} component={() => { window.location.replace("/novo-fluxo/certificacoes"); return null; }} />
      <Route path={"/como-funciona"} component={ComoFunciona} />
      <Route path={"/como-funciona/:id"} component={ComoFuncionaCert} />
      <Route path={"/como-funciona/lideranca"} component={ComoFuncionaLideranca} />
      <Route path={"/simulacao"} component={Simulacao} />
      <Route path={"/cursos"} component={Cursos} />
      {/* ARQUIVADO: <Route path={"/home"} component={Home} /> */}
      {/* ARQUIVADO: <Route path={"/select-certification-type"} component={SelectCertificationType} /> */}

      {/* ARQUIVADO: <Route path={"/select-level"} component={SelectCertificationLevel} /> */}
      {/* ARQUIVADO: <Route path={"/select-level-cac"} component={SelectCertificationLevelCAC} /> */}
      {/* ARQUIVADO: <Route path={"/select-level-cca"} component={SelectCertificationLevelCCA} /> */}
      {/* ARQUIVADO: <Route path={"/select-level-liders"} component={SelectCertificationLevelLiders} /> */}
      {/* ARQUIVADO: <Route path={"/select-purchase-type"} component={SelectPurchaseType} /> */}
      {/* ARQUIVADO: <Route path={"/certification-type"} component={CertificationTypeSelection} /> */}
      {/* ARQUIVADO: <Route path={"/requirements-validation"} component={RequirementsValidation} /> */}
      {/* ARQUIVADO: <Route path={"/certification-level"} component={CertificationLevelSelection} /> */}
      {/* ARQUIVADO: <Route path={"/step-2"} component={Step2} /> */}
      {/* ARQUIVADO: <Route path={"/step-3"} component={Step3} /> */}
      {/* ARQUIVADO: <Route path={"/step-4"} component={Step4} /> */}
      {/* ARQUIVADO: <Route path={"/payment"} component={PaymentCheckout} /> */}
      {/* ARQUIVADO: <Route path={"/welcome-courses"} component={WelcomeCourses} /> */}
      {/* ARQUIVADO: <Route path={"/courses-learning"} component={CoursesPlatform} /> */}
      {/* ARQUIVADO: <Route path={"/exam-security-check"} component={ExamSecurityCheck} /> */}
      {/* ARQUIVADO: <Route path={"/exam-results"} component={ExamResults} /> */}
      {/* ARQUIVADO: <Route path={"/documental-analysis-checkout"} component={DocumentalAnalysisCheckout} /> */}
      {/* ARQUIVADO: <Route path={"/step-5"} component={Step5} /> */}
      {/* ARQUIVADO: <Route path={"/step-6"} component={Step6} /> */}
      {/* ARQUIVADO: <Route path={"/step-7"} component={Step7} /> */}
      {/* ARQUIVADO: <Route path={"/step-8"} component={Step8} /> */}
      {/* ARQUIVADO: <Route path={"/step-9"} component={Step9} /> */}
      {/* ARQUIVADO: <Route path={"/lattes-curriculum-form"} component={LattesCurriculumForm} /> */}
      {/* ARQUIVADO: <Route path={"/level2-information"} component={Level2Information} /> */}
      {/* ARQUIVADO: <Route path={"/level2-lattes-validation"} component={Level2LattesValidation} /> */}
      {/* ARQUIVADO: <Route path={"/level2-terms-warning"} component={Level2TermsAndWarning} /> */}
      {/* ARQUIVADO: <Route path={"/level2-checkout"} component={Level2Checkout} /> */}
      {/* ARQUIVADO: <Route path={"/certification-direct-preparation-check"} component={CertificationDirectPreparationCheck} /> */}
      {/* ARQUIVADO: <Route path={"/direct-certification-form"} component={DirectCertificationForm} /> */}
      {/* ARQUIVADO: <Route path={"/direct-certification-waiting"} component={DirectCertificationWaitingInfo} /> */}
      {/* ARQUIVADO: <Route path={"/direct-interview-scheduling"} component={DirectCertificationInterviewScheduling} /> */}
      {/* ARQUIVADO: <Route path={"/direct-interview-room"} component={DirectCertificationInterviewRoom} /> */}
      {/* ARQUIVADO: <Route path={"/direct-certification-result"} component={DirectCertificationResult} /> */}
      {/* ARQUIVADO: <Route path={"/direct-recording-playback"} component={DirectRecordingPlayback} /> */}
      {/* ARQUIVADO: <Route path={"/interview-scheduling"} component={InterviewScheduling} /> */}
      {/* ARQUIVADO: <Route path={"/interview-room"} component={InterviewRoom} /> */}
      {/* ARQUIVADO: <Route path={"/interview-result"} component={InterviewResult} /> */}

      {/* ── Novo Fluxo ANEFAC ─────────────────────────────────────────────── */}
      <Route path={"/novo-fluxo"} component={AreaCandidato} />
      <Route path={"/novo-fluxo/selecionar"} component={SelecionarCertificacao} />
      <Route path={"/novo-fluxo/certificacoes"} component={NovoFluxoCertificacoes} />
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
      <Route path={"/novo-fluxo/admin/prova-config"} component={() => <AdminRoute component={AdminProvaConfig} />} />
      <Route path={"/novo-fluxo/admin/fale-conosco"} component={() => <AdminRoute component={AdminFaleConosco} />} />
      <Route path={"/novo-fluxo/admin/candidatos"} component={() => <AdminRoute component={AdminCandidatos} />} />
      <Route path={"/novo-fluxo/admin/candidatos/:id"} component={() => <AdminRoute component={AdminCandidatoDetalhe} />} />
      <Route path={"/novo-fluxo/lgpd"} component={AceiteLGPD} />
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
    location === "/como-funciona" ||
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
                <NavbarGlobal />
        <Router />
        <FaleConosco />
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
