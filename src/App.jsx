import {
  ArrowLeft,
  ArrowRight,
  Check,
  ExternalLink,
  House,
  Menu,
  Moon,
  RefreshCw,
  ShieldCheck,
  Sun,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { diseaseContent } from "./data/diseaseContent";
import { awarenessExtras } from "./data/awarenessExtras";
import { preventionMethods } from "./data/preventionMethods";
import { getText, localizeRecommendation } from "./data/translations";
import { getAssessmentSteps, isComplete } from "./lib/validation";
import { buildRecommendations } from "./lib/recommendations";
import { isSupabaseConfigured, supabase } from "./lib/supabase";
import "./App.css";

const initialAnswers = {
  language: "te",
  prevention_methods: [],
  uncovered_container: "",
  cleaning_frequency: "",
  surroundings_cleaning: "",
  stagnant_water: "",
  open_drain: "",
  garbage_nearby: "",
  open_water_tank: "",
  waste_collecting_items: "",
  mosquito_entry_source: "",
  mosquito_presence: "",
  barrier: "",
  issue_scope: "",
  recurrence_reported: "",
};
const tx = (language, key) => getText(language, key);
const diseaseText = (disease, language, field) =>
  language === "en" ? disease[`${field}En`] : disease[field];

function currentRoute() {
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  return { path, params: new URLSearchParams(window.location.search) };
}
function useRouter() {
  const [location, setLocation] = useState(currentRoute);
  useEffect(() => {
    const onPop = () => setLocation(currentRoute());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const navigate = (path) => {
    window.history.pushState({}, "", path);
    setLocation(currentRoute());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return { ...location, navigate };
}
function useLanguage() {
  const [language, setLanguage] = useState(
    () => localStorage.getItem("planner-language") || "te",
  );
  const toggle = () =>
    setLanguage((current) => {
      const next = current === "te" ? "en" : "te";
      localStorage.setItem("planner-language", next);
      return next;
    });
  return { language, toggle };
}

function useTheme() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("planner-theme") || "light",
  );
  const toggle = () =>
    setTheme((current) => {
      const next = current === "light" ? "dark" : "light";
      localStorage.setItem("planner-theme", next);
      return next;
    });
  return { theme, toggle };
}

function Header({ navigate, language, toggleLanguage, theme, toggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const latestId = localStorage.getItem("bitewise-latest-id");
  const links = [
    ["/", tx(language, "home")],
    ["/awareness", tx(language, "awareness")],
    ["/assessment", tx(language, "assessment")],
    [
      latestId ? `/actions?id=${latestId}` : "/actions",
      tx(language, "actions"),
    ],
    ["/dashboard", tx(language, "dashboard")],
  ];
  const go = (path) => {
    setMenuOpen(false);
    navigate(path);
  };
  return (
    <header className="site-header">
      <button
        className="brand"
        type="button"
        onClick={() => go("/")}
        aria-label={`${tx(language, "brand")} ${tx(language, "home")}`}
      >
        <span className="brand-mark" aria-hidden="true">
          <House size={21} />
          <span className="brand-shield">
            <ShieldCheck size={11} />
          </span>
        </span>
        <span>
          <strong>{tx(language, "brand")}</strong>
          <small>{tx(language, "brandSub")}</small>
        </span>
      </button>
      <button
        className="menu-button"
        type="button"
        aria-expanded={menuOpen}
        aria-label={
          menuOpen ? tx(language, "menuClose") : tx(language, "menuOpen")
        }
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>
      <nav
        className={menuOpen ? "main-nav is-open" : "main-nav"}
        aria-label={tx(language, "home")}
      >
        {links.map(([path, label]) => (
          <button key={path} type="button" onClick={() => go(path)}>
            {label}
          </button>
        ))}
        <button
          className="language-toggle"
          type="button"
          aria-label={tx(language, "languageLabel")}
          onClick={toggleLanguage}
        >
          {language === "te" ? "EN" : "తెలుగు"}
        </button>
        <button
          className="theme-toggle"
          type="button"
          aria-label={
            theme === "light" ? "Switch to dark theme" : "Switch to light theme"
          }
          aria-pressed={theme === "dark"}
          onClick={toggleTheme}
        >
          {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </nav>
    </header>
  );
}
function Footer({ language, navigate }) {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-intro">
          <div className="footer-brand">
            <span className="brand-mark" aria-hidden="true">
              <House size={18} />
              <span className="brand-shield">
                <ShieldCheck size={10} />
              </span>
            </span>
            <strong>{tx(language, "brand")}</strong>
          </div>
          <p>{tx(language, "footerText")}</p>
          <span>{tx(language, "footerTag")}</span>
        </div>
        <div className="footer-column">
          <strong>{tx(language, "footerSources")}</strong>
          <a
            href="https://www.who.int/news-room/fact-sheets/detail/dengue-and-severe-dengue"
            target="_blank"
            rel="noreferrer"
          >
            {tx(language, "sourceDengue")} <ExternalLink size={13} />
          </a>
          <a
            href="https://www.who.int/news-room/fact-sheets/malaria"
            target="_blank"
            rel="noreferrer"
          >
            {tx(language, "sourceMalaria")} <ExternalLink size={13} />
          </a>
          <a
            href="https://www.who.int/news-room/fact-sheets/detail/chikungunya"
            target="_blank"
            rel="noreferrer"
          >
            {tx(language, "sourceChikungunya")} <ExternalLink size={13} />
          </a>
        </div>
        <div className="footer-column footer-note">
          <strong>{tx(language, "footerHeading")}</strong>
          <p>{tx(language, "footerPrivacy")}</p>
          <button
            className="footer-action"
            type="button"
            onClick={() => navigate("/assessment")}
          >
            {tx(language, "footerStart")} <ArrowRight size={14} />
          </button>
        </div>
      </div>
      <div className="footer-bottom">
        <p>{tx(language, "footer")}</p>
        <span>{tx(language, "location")}</span>
      </div>
    </footer>
  );
}
function Shell({
  children,
  navigate,
  language,
  toggleLanguage,
  theme,
  toggleTheme,
}) {
  return (
    <div className={theme === "dark" ? "site-shell theme-dark" : "site-shell"}>
      <Header
        navigate={navigate}
        language={language}
        toggleLanguage={toggleLanguage}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <main>{children}</main>
      <Footer language={language} navigate={navigate} />
    </div>
  );
}
function PageIntro({ kicker, title, text }) {
  return (
    <section className="page-intro">
      <p className="section-kicker">{kicker}</p>
      <h1>{title}</h1>
      {text && <p>{text}</p>}
    </section>
  );
}

function Home({ navigate, language }) {
  return (
    <>
      <section className="hero-section" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">
            <ShieldCheck size={17} /> {tx(language, "eyebrow")}
          </p>
          <h1 id="hero-title">{tx(language, "heroTitle")}</h1>
          <p className="hero-text">{tx(language, "heroText")}</p>
          <div className="hero-actions">
            <button
              className="button button-primary"
              type="button"
              onClick={() => navigate("/awareness")}
            >
              {tx(language, "learn")} <ArrowRight size={18} />
            </button>
            <button
              className="button button-quiet"
              type="button"
              onClick={() => navigate("/assessment")}
            >
              {tx(language, "assessment")}
            </button>
          </div>
          <p className="location-note">{tx(language, "location")}</p>
        </div>
        <div className="hero-image-wrap">
          <img
            className="hero-image"
            src="/images/home-prevention.png"
            alt={tx(language, "heroAlt")}
          />
          <div className="image-caption">
            <span className="caption-dot" /> {tx(language, "imageCaption")}
          </div>
        </div>
      </section>
      <section className="prevention-line" aria-label={tx(language, "weekly")}>
        <span>{tx(language, "weekly")}</span>
        <div>
          <Check size={17} /> {tx(language, "cover")}
        </div>
        <div>
          <Check size={17} /> {tx(language, "clean")}
        </div>
        <div>
          <Check size={17} /> {tx(language, "empty")}
        </div>
      </section>
      <section className="methods-section" aria-labelledby="methods-title">
        <div className="methods-heading">
          <p className="section-kicker">
            {tx(language, "preventionMethodsKicker")}
          </p>
          <h2 id="methods-title">{tx(language, "preventionMethodsTitle")}</h2>
          <p>{tx(language, "preventionMethodsText")}</p>
        </div>
        <div className="methods-grid">
          {preventionMethods.map((method) => (
            <article className="method-item" key={method.id}>
              <img
                src={method.image}
                alt={language === "en" ? method.altEn : method.alt}
              />
              <div>
                <h3>{language === "en" ? method.titleEn : method.title}</h3>
                <p>
                  {language === "en"
                    ? method.descriptionEn
                    : method.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="how-section" aria-labelledby="how-title">
        <div className="how-heading">
          <p className="section-kicker">{tx(language, "nextStep")}</p>
          <h2 id="how-title">{tx(language, "howTitle")}</h2>
          <p>{tx(language, "howText")}</p>
        </div>
        <div className="how-steps">
          <div className="how-step">
            <span>01</span>
            <div>
              <h3>{tx(language, "howLearn")}</h3>
              <p>{tx(language, "howLearnText")}</p>
            </div>
          </div>
          <div className="how-step">
            <span>02</span>
            <div>
              <h3>{tx(language, "howCheck")}</h3>
              <p>{tx(language, "howCheckText")}</p>
            </div>
          </div>
          <div className="how-step">
            <span>03</span>
            <div>
              <h3>{tx(language, "howAct")}</h3>
              <p>{tx(language, "howActText")}</p>
            </div>
          </div>
        </div>
      </section>
      <section className="intro-section">
        <div>
          <p className="section-kicker">{tx(language, "firstLearn")}</p>
          <h2>{tx(language, "diseaseTitle")}</h2>
        </div>
        <p>{tx(language, "diseaseIntro")}</p>
      </section>
      <section
        className="disease-list"
        aria-label={tx(language, "diseaseTitle")}
      >
        {diseaseContent.map((disease) => (
          <button
            className="disease-row"
            type="button"
            key={disease.id}
            onClick={() => navigate(`/awareness?disease=${disease.id}`)}
          >
            <span className="disease-number">{disease.number}</span>
            <span className="disease-name">
              <strong>
                {language === "en" ? disease.titleEn : disease.title}
              </strong>
              <small>{disease.english}</small>
            </span>
            <span className="disease-description">
              {diseaseText(disease, language, "what")}
            </span>
            <ArrowRight className="row-arrow" size={20} />
          </button>
        ))}
      </section>
      <section className="start-strip">
        <div>
          <p className="section-kicker">{tx(language, "nextStep")}</p>
          <h2>{tx(language, "checkHome")}</h2>
        </div>
        <button
          className="button button-primary"
          type="button"
          onClick={() => navigate("/assessment")}
        >
          {tx(language, "startAssessment")} <ArrowRight size={18} />
        </button>
      </section>
    </>
  );
}

function Awareness({ navigate, language, diseaseId }) {
  const [selected, setSelected] = useState(() =>
    diseaseContent.some((item) => item.id === diseaseId) ? diseaseId : "dengue",
  );
  const disease = diseaseContent.find((item) => item.id === selected);
  const spreadSteps = awarenessExtras[disease.id].spread[language];
  const rememberItems = awarenessExtras[disease.id].remember[language];
  return (
    <>
      <PageIntro
        language={language}
        kicker={tx(language, "awarenessKicker")}
        title={tx(language, "awarenessTitle")}
        text={tx(language, "awarenessIntro")}
      />
      <div
        className="awareness-tabs"
        role="tablist"
        aria-label={tx(language, "chooseDisease")}
      >
        {diseaseContent.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={selected === item.id}
            className={selected === item.id ? "tab is-selected" : "tab"}
            onClick={() => {
              setSelected(item.id);
              navigate(`/awareness?disease=${item.id}`);
            }}
          >
            <span>{item.number}</span>
            {language === "en" ? item.titleEn : item.title}
            <small>{item.english}</small>
          </button>
        ))}
      </div>
      <article className="awareness-article">
        <div className="article-heading">
          <span className="article-number">{disease.number}</span>
          <div>
            <p className="section-kicker">{disease.english}</p>
            <h2>{language === "en" ? disease.titleEn : disease.title}</h2>
          </div>
        </div>
        <div className="article-grid">
          <section>
            <h3>{tx(language, "whatIsIt")}</h3>
            <p>{diseaseText(disease, language, "what")}</p>
          </section>
          <section>
            <h3>{tx(language, "symptoms")}</h3>
            <p>{diseaseText(disease, language, "symptoms")}</p>
          </section>
          <section>
            <h3>{tx(language, "prevention")}</h3>
            <p>{diseaseText(disease, language, "prevention")}</p>
          </section>
          <section className="care-note">
            <h3>{tx(language, "seekCare")}</h3>
            <p>{diseaseText(disease, language, "care")}</p>
          </section>
        </div>
        <section className="complication-note">
          <h3>{tx(language, "seriousComplications")}</h3>
          <p>{diseaseText(disease, language, "complications")}</p>
        </section>
        <a
          className="source-link"
          href={disease.source}
          target="_blank"
          rel="noreferrer"
        >
          {tx(language, "officialSource")} <ExternalLink size={15} />
        </a>
      </article>
      <section className="awareness-learning" aria-labelledby="spread-title">
        <div className="learning-heading">
          <p className="section-kicker">{tx(language, "awarenessKicker")}</p>
          <h2 id="spread-title">
            {language === "en"
              ? "How prevention connects"
              : "నివారణ ఎలా పనిచేస్తుంది"}
          </h2>
          <p>
            {language === "en"
              ? "A simple way to understand where practical action helps."
              : "ఆచరణలో చిన్న చర్యలు ఎక్కడ సహాయపడతాయో సులభంగా అర్థం చేసుకోండి."}
          </p>
        </div>
        <div className="spread-steps">
          {spreadSteps.map(([number, title, text]) => (
            <div className="spread-step" key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="remember-section" aria-labelledby="remember-title">
        <div className="learning-heading">
          <p className="section-kicker">{tx(language, "prevention")}</p>
          <h2 id="remember-title">
            {language === "en" ? "Remember this" : "ఇవి గుర్తుంచుకోండి"}
          </h2>
        </div>
        <div className="remember-list">
          {rememberItems.map(([label, title, text]) => (
            <article key={title}>
              <span>{label}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="start-strip">
        <div>
          <p className="section-kicker">{tx(language, "nextStep")}</p>
          <h2>{tx(language, "checkHome")}</h2>
        </div>
        <button
          className="button button-primary"
          type="button"
          onClick={() => navigate("/assessment")}
        >
          {tx(language, "startAssessment")} <ArrowRight size={18} />
        </button>
      </section>
    </>
  );
}

function Assessment({ navigate, language }) {
  const steps = getAssessmentSteps(language);
  const [answers, setAnswers] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("bitewise-assessment-draft") || "null",
      );
      return { ...initialAnswers, ...(saved || {}), language };
    } catch {
      return { ...initialAnswers, language };
    }
  });
  const [stepIndex, setStepIndex] = useState(0);
  const [review, setReview] = useState(false);
  const [state, setState] = useState({ type: "idle", message: "" });
  const step = steps[stepIndex];
  useEffect(() => {
    localStorage.setItem("bitewise-assessment-draft", JSON.stringify(answers));
  }, [answers]);
  const choose = (value) =>
    setAnswers((current) => {
      if (!step.multi) return { ...current, [step.key]: value };
      const selected = Array.isArray(current[step.key])
        ? current[step.key]
        : [];
      if (value === "none") return { ...current, [step.key]: ["none"] };
      const withoutNone = selected.filter((item) => item !== "none");
      return {
        ...current,
        [step.key]: withoutNone.includes(value)
          ? withoutNone.filter((item) => item !== value)
          : [...withoutNone, value],
      };
    });
  const submit = async () => {
    if (!isComplete(answers)) {
      setState({ type: "error", message: tx(language, "validationError") });
      setReview(false);
      return;
    }
    if (!isSupabaseConfigured) {
      setState({ type: "error", message: tx(language, "configError") });
      return;
    }
    setState({ type: "loading", message: tx(language, "saving") });
    const generated = buildRecommendations({
      ...answers,
      recurrence_reported: answers.recurrence_reported === "yes",
    });
    const payload = {
      language: answers.language === "en" ? "en" : "te",
      uncovered_container: answers.uncovered_container === "yes",
      cleaning_frequency: answers.cleaning_frequency,
      surroundings_cleaning_frequency: answers.surroundings_cleaning,
      stagnant_water: answers.stagnant_water === "yes",
      open_drain: answers.open_drain === "yes",
      garbage_nearby: answers.garbage_nearby === "yes",
      open_water_tank: answers.open_water_tank === "yes",
      waste_collecting_items: answers.waste_collecting_items === "yes",
      mosquito_entry_sources:
        answers.mosquito_entry_source === "unknown"
          ? []
          : [answers.mosquito_entry_source],
      prevention_methods: answers.prevention_methods,
      mosquito_presence: answers.mosquito_presence,
      barrier: answers.barrier,
      issue_scope: answers.issue_scope,
      recommendations: generated,
      action_status: "pending",
      recurrence_reported: answers.recurrence_reported === "yes",
    };
    const { data, error } = await supabase
      .from("prevention_assessments")
      .insert(payload)
      .select("id")
      .single();
    if (error) {
      setState({
        type: "error",
        message: `${tx(language, "saveError")}: ${error.message}`,
      });
      return;
    }
    localStorage.removeItem("bitewise-assessment-draft");
    localStorage.setItem("bitewise-latest-id", data.id);
    navigate(`/recommendations?id=${data.id}`);
  };
  if (review)
    return (
      <>
        <PageIntro
          language={language}
          kicker={tx(language, "finalCheck")}
          title={tx(language, "review")}
          text={tx(language, "reviewText")}
        />
        <div className="review-list">
          {steps.map((item) => (
            <div key={item.key}>
              <span>{item.label}</span>
              <strong>
                {Array.isArray(answers[item.key])
                  ? item.options
                      .filter(([value]) => answers[item.key].includes(value))
                      .map(([, label]) => label)
                      .join(", ") || tx(language, "notSelected")
                  : item.options.find(
                      ([value]) => value === answers[item.key],
                    )?.[1] || tx(language, "notSelected")}
              </strong>
            </div>
          ))}
        </div>
        <div className="form-actions">
          <button
            className="button button-quiet"
            type="button"
            onClick={() => setReview(false)}
          >
            {tx(language, "back")}
          </button>
          <button
            className="button button-primary"
            type="button"
            onClick={submit}
            disabled={state.type === "loading"}
          >
            {state.type === "loading"
              ? tx(language, "saving")
              : tx(language, "submit")}{" "}
            <ArrowRight size={18} />
          </button>
        </div>
        {state.type === "error" && (
          <p className="form-message error-message">{state.message}</p>
        )}
      </>
    );
  return (
    <>
      <PageIntro
        language={language}
        kicker={`${tx(language, "step")} ${stepIndex + 1} / ${steps.length}`}
        title={tx(language, "assessment")}
        text={tx(language, "anonymous")}
      />
      <div className="progress-track">
        <span style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }} />
      </div>
      <section className="question-panel">
        <p className="question-count">
          {tx(language, "question")} {stepIndex + 1}
        </p>
        <h2>{step.label}</h2>
        <div className="option-list">
          {step.options.map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={
                (
                  step.multi
                    ? answers[step.key]?.includes(value)
                    : answers[step.key] === value
                )
                  ? "option is-selected"
                  : "option"
              }
              onClick={() => choose(value)}
            >
              {(step.multi
                ? answers[step.key]?.includes(value)
                : answers[step.key] === value) && <Check size={18} />}
              {label}
            </button>
          ))}
        </div>
      </section>
      <p className="privacy-note">{tx(language, "privacy")}</p>
      {state.type === "error" && (
        <p className="form-message error-message">{state.message}</p>
      )}
      <div className="form-actions">
        <button
          className="button button-quiet"
          type="button"
          disabled={stepIndex === 0}
          onClick={() => setStepIndex((index) => index - 1)}
        >
          <ArrowLeft size={17} /> {tx(language, "back")}
        </button>
        {stepIndex < steps.length - 1 ? (
          <button
            className="button button-primary"
            type="button"
            disabled={
              step.multi ? !answers[step.key]?.length : !answers[step.key]
            }
            onClick={() => setStepIndex((index) => index + 1)}
          >
            {tx(language, "next")} <ArrowRight size={17} />
          </button>
        ) : (
          <button
            className="button button-primary"
            type="button"
            disabled={
              step.multi ? !answers[step.key]?.length : !answers[step.key]
            }
            onClick={() => setReview(true)}
          >
            {tx(language, "review")} <ArrowRight size={17} />
          </button>
        )}
      </div>
    </>
  );
}

function RecordLoader({ id, language, children }) {
  const [record, setRecord] = useState(null);
  const [state, setState] = useState({ type: "loading", message: "" });
  const load = async () => {
    if (!supabase) {
      setState({ type: "error", message: tx(language, "configError") });
      return;
    }
    const { data, error } = await supabase
      .from("prevention_assessments")
      .select("*")
      .eq("id", id)
      .single();
    if (error)
      setState({
        type: "error",
        message: `${tx(language, "recordError")}: ${error.message}`,
      });
    else {
      setRecord(data);
      setState({ type: "success", message: "" });
    }
  };
  useEffect(() => {
    let active = true;
    const fetchRecord = async () => {
      if (!supabase) {
        if (active)
          setState({ type: "error", message: tx(language, "configError") });
        return;
      }
      const { data, error } = await supabase
        .from("prevention_assessments")
        .select("*")
        .eq("id", id)
        .single();
      if (!active) return;
      if (error)
        setState({
          type: "error",
          message: `${tx(language, "recordError")}: ${error.message}`,
        });
      else {
        setRecord(data);
        setState({ type: "success", message: "" });
      }
    };
    fetchRecord();
    return () => {
      active = false;
    };
  }, [id, language]);
  if (state.type === "loading")
    return (
      <div className="state-panel">
        <p>{tx(language, "loading")}</p>
      </div>
    );
  if (state.type === "error")
    return (
      <div className="state-panel error-message">
        <p>{state.message}</p>
        <button className="button button-quiet" type="button" onClick={load}>
          <RefreshCw size={16} /> {tx(language, "retry")}
        </button>
      </div>
    );
  return children(record, load);
}

function RecommendationList({ recommendations, language }) {
  return (
    <div className="recommendation-list">
      {recommendations.map((item) => {
        const localized = localizeRecommendation(item, language);
        return (
          <article className="recommendation" key={item.id}>
            <div className="recommendation-top">
              <span className={`priority-label ${item.priority}`}>
                {item.priority === "community"
                  ? tx(language, "communityFollowup")
                  : item.priority === "keep-doing"
                    ? tx(language, "keepDoing")
                    : tx(language, "first")}
              </span>
              <span className="category-label">{localized.category}</span>
            </div>
            <h3>{localized.title}</h3>
            <p>{localized.why}</p>
            <ul>
              {localized.steps.map((step) => (
                <li key={step}>
                  <Check size={16} />
                  {step}
                </li>
              ))}
            </ul>
          </article>
        );
      })}
    </div>
  );
}

function Recommendations({ navigate, id, language }) {
  if (!id)
    return (
      <div className="state-panel">
        <h2>{tx(language, "noRecord")}</h2>
        <button
          className="button button-primary"
          type="button"
          onClick={() => navigate("/assessment")}
        >
          {tx(language, "newAssessment")}
        </button>
      </div>
    );
  return (
    <RecordLoader id={id} language={language}>
      {(record) => (
        <>
          <PageIntro
            language={language}
            kicker={tx(language, "planKicker")}
            title={tx(language, "planTitle")}
            text={tx(language, "planText")}
          />
          <div className="plan-meta">
            <span>
              {tx(language, "statusLabel")}:{" "}
              <strong>{tx(language, record.action_status)}</strong>
            </span>
            {record.recurrence_reported && (
              <span className="recurring-label">
                {tx(language, "recurring")}
              </span>
            )}
          </div>
          <RecommendationList
            recommendations={record.recommendations || []}
            language={language}
          />
          <div className="form-actions">
            <button
              className="button button-primary"
              type="button"
              onClick={() => navigate(`/actions?id=${record.id}`)}
            >
              {tx(language, "manageStatus")} <ArrowRight size={18} />
            </button>
          </div>
        </>
      )}
    </RecordLoader>
  );
}

function Actions({ navigate, id, language }) {
  if (!id)
    return (
      <div className="state-panel">
        <h2>{tx(language, "chooseRecord")}</h2>
        <button
          className="button button-primary"
          type="button"
          onClick={() => navigate("/assessment")}
        >
          {tx(language, "newAssessment")}
        </button>
      </div>
    );
  return (
    <RecordLoader id={id} language={language}>
      {(record, reload) => (
        <>
          <PageIntro
            language={language}
            kicker={tx(language, "actionKicker")}
            title={tx(language, "actionTitle")}
            text={tx(language, "actionText")}
          />
          <div className="status-panel">
            <label htmlFor="action-status">
              {tx(language, "overallStatus")}
            </label>
            <select
              id="action-status"
              value={record.action_status}
              onChange={async (event) => {
                const next = event.target.value;
                const { error } = await supabase
                  .from("prevention_assessments")
                  .update({
                    action_status: next,
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", record.id);
                if (error)
                  window.alert(
                    `${tx(language, "saveError")}: ${error.message}`,
                  );
                else reload();
              }}
            >
              <option value="pending">{tx(language, "pending")}</option>
              <option value="completed">{tx(language, "completed")}</option>
              <option value="unresolved">{tx(language, "unresolved")}</option>
            </select>
          </div>
          <RecommendationList
            recommendations={record.recommendations || []}
            language={language}
          />
          <div className="start-strip">
            <div>
              <p className="section-kicker">{tx(language, "reassessKicker")}</p>
              <h2>{tx(language, "reassessTitle")}</h2>
            </div>
            <button
              className="button button-primary"
              type="button"
              onClick={() => navigate("/assessment")}
            >
              {tx(language, "reassess")} <ArrowRight size={18} />
            </button>
          </div>
        </>
      )}
    </RecordLoader>
  );
}

function Dashboard({ language }) {
  const [includeDemo, setIncludeDemo] = useState(false);
  const [records, setRecords] = useState([]);
  const [state, setState] = useState({ type: "loading", message: "" });
  const load = async () => {
    if (!supabase) {
      setState({ type: "error", message: tx(language, "configError") });
      return;
    }
    const { data, error } = await supabase
      .from("prevention_assessments")
      .select("*")
      .order("created_at", { ascending: false });
    if (error)
      setState({
        type: "error",
        message: `${tx(language, "dashboardError")}: ${error.message}`,
      });
    else {
      setRecords(data || []);
      setState({ type: "success", message: "" });
    }
  };
  useEffect(() => {
    let active = true;
    const fetchRecords = async () => {
      if (!supabase) {
        if (active)
          setState({ type: "error", message: tx(language, "configError") });
        return;
      }
      const { data, error } = await supabase
        .from("prevention_assessments")
        .select("*")
        .order("created_at", { ascending: false });
      if (!active) return;
      if (error)
        setState({
          type: "error",
          message: `${tx(language, "dashboardError")}: ${error.message}`,
        });
      else {
        setRecords(data || []);
        setState({ type: "success", message: "" });
      }
    };
    fetchRecords();
    return () => {
      active = false;
    };
  }, [language]);
  const visible = useMemo(
    () => (includeDemo ? records : records.filter((record) => !record.is_demo)),
    [includeDemo, records],
  );
  const count = (predicate) => visible.filter(predicate).length;
  if (state.type === "loading")
    return (
      <div className="state-panel">
        <p>{tx(language, "loading")}</p>
      </div>
    );
  if (state.type === "error")
    return (
      <div className="state-panel error-message">
        <p>{state.message}</p>
        <button className="button button-quiet" type="button" onClick={load}>
          <RefreshCw size={16} /> {tx(language, "retry")}
        </button>
      </div>
    );
  return (
    <>
      <PageIntro
        language={language}
        kicker={tx(language, "dashboardKicker")}
        title={tx(language, "dashboardTitle")}
        text={tx(language, "dashboardText")}
      />
      <div className="dashboard-toolbar">
        <label>
          <input
            type="checkbox"
            checked={includeDemo}
            onChange={(event) => setIncludeDemo(event.target.checked)}
          />{" "}
          {tx(language, "demo")}
        </label>
        <button className="button button-quiet" type="button" onClick={load}>
          <RefreshCw size={16} /> {tx(language, "refresh")}
        </button>
      </div>
      {visible.length === 0 ? (
        <div className="empty-panel">
          <h2>{tx(language, "noAssessments")}</h2>
          <p>{tx(language, "noAssessmentsText")}</p>
        </div>
      ) : (
        <>
          <div className="metric-grid">
            <div className="metric">
              <strong>{visible.length}</strong>
              <span>{tx(language, "total")}</span>
            </div>
            <div className="metric">
              <strong>{count((r) => r.recurrence_reported)}</strong>
              <span>{tx(language, "recurringCount")}</span>
            </div>
            <div className="metric">
              <strong>{count((r) => r.action_status === "completed")}</strong>
              <span>{tx(language, "completedCount")}</span>
            </div>
            <div className="metric">
              <strong>{count((r) => r.action_status === "unresolved")}</strong>
              <span>{tx(language, "unresolvedCount")}</span>
            </div>
          </div>
          <div className="dashboard-grid">
            <DashboardGroup
              language={language}
              title={tx(language, "barriers")}
              items={[
                [
                  tx(language, "knowledge"),
                  count((r) => r.barrier === "knowledge"),
                ],
                [
                  tx(language, "routine"),
                  count((r) => r.barrier === "routine"),
                ],
                [
                  tx(language, "resources"),
                  count((r) => r.barrier === "resources"),
                ],
                [
                  tx(language, "shared"),
                  count(
                    (r) =>
                      r.barrier === "shared" ||
                      r.issue_scope === "shared_public",
                  ),
                ],
              ]}
            />
            <DashboardGroup
              language={language}
              title={tx(language, "conditions")}
              items={[
                [
                  tx(language, "uncovered"),
                  count((r) => r.uncovered_container),
                ],
                [tx(language, "stagnant"), count((r) => r.stagnant_water)],
                [tx(language, "drain"), count((r) => r.open_drain)],
                [tx(language, "waste"), count((r) => r.waste_collecting_items)],
              ]}
            />
          </div>
        </>
      )}
    </>
  );
}
function DashboardGroup({ title, items }) {
  return (
    <section className="dashboard-group">
      <h2>{title}</h2>
      {items.map(([label, value]) => (
        <div className="bar-row" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
          <i>
            <b
              style={{
                width: `${value ? Math.min(100, Math.max(8, value * 18)) : 0}%`,
              }}
            />
          </i>
        </div>
      ))}
    </section>
  );
}

function App() {
  const { path, params, navigate } = useRouter();
  const { language, toggle } = useLanguage();
  const { theme, toggle: toggleTheme } = useTheme();
  let page = <Home navigate={navigate} language={language} />;
  if (path === "/awareness")
    page = (
      <Awareness
        navigate={navigate}
        language={language}
        diseaseId={params.get("disease")}
      />
    );
  if (path === "/assessment")
    page = <Assessment navigate={navigate} language={language} />;
  if (path === "/recommendations")
    page = (
      <Recommendations
        navigate={navigate}
        id={params.get("id")}
        language={language}
      />
    );
  if (path === "/actions")
    page = (
      <Actions navigate={navigate} id={params.get("id")} language={language} />
    );
  if (path === "/dashboard") page = <Dashboard language={language} />;
  return (
    <Shell
      navigate={navigate}
      language={language}
      toggleLanguage={toggle}
      theme={theme}
      toggleTheme={toggleTheme}
    >
      {page}
    </Shell>
  );
}

export default App;
