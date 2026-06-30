"use client";

type Props = {
    language: "de" | "en";
    setLanguage: (language: "de" | "en") => void;
    onBack: () => void;
    onNext: () => void;
};

const LABELS = {
    de: {
        tagline: "Live Opinion Generated Online",
        chooseLanguage: "Sprache ändern",
        back: "Zurück",
        understood: "Verstanden",
        tutorialTitle: "So funktioniert LOGO",
        tutorialIntro: "Du wirst gleich durch eine kurze Social-Media-Erfahrung geführt. Alles ist so aufgebaut, dass du es ohne Erklärung ausprobieren kannst.",
        tutorialSteps: [
            "1. Erstelle einen kurzen Post.",
            "2. Lies die Reaktionen und Kommentare.",
            "3. Öffne Kommentarbereiche und schreibe so viele Kommentare, wie du möchtest.",
            "4. Achte darauf, wie sich die Diskussion verändert.",
        ],
        tutorialHint: "Du kannst jederzeit weiter interagieren. Es gibt keinen perfekten richtigen Weg.",
    },
    en: {
        tagline: "Live Opinion Generated Online",
        chooseLanguage: "Change language",
        back: "Back",
        understood: "Got it",
        tutorialTitle: "How LOGO works",
        tutorialIntro: "You are about to enter a short social media experience. It is designed so you can try it without needing an explanation from anyone else.",
        tutorialSteps: [
            "1. Create a short post.",
            "2. Read the reactions and comments.",
            "3. Open comment sections and write as many comments as you want.",
            "4. Pay attention to how the discussion changes.",
        ],
        tutorialHint: "You can keep interacting freely. There is no single perfect way to do it.",
    },
};

export default function TutorialOverlay({ language, setLanguage, onBack, onNext }: Props) {
    const t = LABELS[language];

    return (
        <div style={tutorialScreenStyle}>
            <div style={tutorialCardStyle}>
                <div style={tutorialTopStyle}>
                    <div>
                        <div style={logoStyle}>LOGO</div>
                        <div style={taglineStyle}>{t.tagline}</div>
                    </div>

                    <LanguageSelector
                        language={language}
                        setLanguage={setLanguage}
                        label={t.chooseLanguage}
                    />
                </div>

                <div style={tutorialContentStyle}>
                    <h2 style={tutorialTitleStyle}>{t.tutorialTitle}</h2>
                    <p style={tutorialIntroStyle}>{t.tutorialIntro}</p>

                    <div style={tutorialStepsStyle}>
                        {t.tutorialSteps.map((stepText) => (
                            <div key={stepText} style={tutorialStepStyle}>
                                {stepText}
                            </div>
                        ))}
                    </div>

                    <p style={tutorialHintStyle}>{t.tutorialHint}</p>
                </div>

                <div style={tutorialButtonsStyle}>
                    <button
                        className="send-btn"
                        style={secondaryButtonStyle}
                        onClick={onBack}
                    >
                        {t.back}
                    </button>

                    <button
                        className="send-btn"
                        style={primaryButtonStyle}
                        onClick={onNext}
                    >
                        {t.understood}
                    </button>
                </div>
            </div>
        </div>
    );
}

function LanguageSelector({
                              language,
                              setLanguage,
                              label,
                          }: {
    language: "de" | "en";
    setLanguage: (language: "de" | "en") => void;
    label: string;
}) {
    return (
        <div style={languageBoxSmallStyle}>
            <div style={languageLabelSmallStyle}>{label}</div>

            <div style={languageButtonsStyle}>
                <button
                    style={{
                        ...languageButtonSmallStyle,
                        ...(language === "de" ? languageButtonActiveStyle : {}),
                    }}
                    onClick={() => setLanguage("de")}
                    title="Deutsch"
                >
                    🇩🇪 Deutsch
                </button>

                <button
                    style={{
                        ...languageButtonSmallStyle,
                        ...(language === "en" ? languageButtonActiveStyle : {}),
                    }}
                    onClick={() => setLanguage("en")}
                    title="English"
                >
                    🇬🇧 English
                </button>
            </div>
        </div>
    );
}

const tutorialScreenStyle: React.CSSProperties = {
    width: "100vw",
    minHeight: "100vh",
    background: "#000",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
};

const tutorialCardStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: "760px",
    background: "#0f0f0f",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#2f2f2f",
    borderRadius: "22px",
    padding: "34px",
    display: "flex",
    flexDirection: "column",
    gap: "28px",
};

const tutorialTopStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "18px",
};

const logoStyle: React.CSSProperties = {
    fontSize: "32px",
    fontWeight: 700,
    color: "white",
    letterSpacing: "-1px",
};

const taglineStyle: React.CSSProperties = {
    fontSize: "12px",
    color: "#666",
    letterSpacing: "3px",
    textTransform: "uppercase",
    marginTop: "4px",
};

const tutorialContentStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
};

const tutorialTitleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: "30px",
    color: "white",
};

const tutorialIntroStyle: React.CSSProperties = {
    margin: 0,
    color: "#d5d5d5",
    fontSize: "17px",
    lineHeight: "1.6",
};

const tutorialStepsStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
};

const tutorialStepStyle: React.CSSProperties = {
    background: "#151515",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#2d2d2d",
    borderRadius: "12px",
    padding: "13px 15px",
    color: "#e8e8e8",
    fontSize: "16px",
    lineHeight: "1.45",
};

const tutorialHintStyle: React.CSSProperties = {
    margin: 0,
    color: "#aaa",
    fontSize: "15px",
};

const tutorialButtonsStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
};

const primaryButtonStyle: React.CSSProperties = {
    flex: 1,
    padding: "12px 18px",
    cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
    flex: 1,
    padding: "12px 18px",
    cursor: "pointer",
    background: "transparent",
};

const languageBoxSmallStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
};

const languageLabelSmallStyle: React.CSSProperties = {
    color: "#bbb",
    fontSize: "13px",
    fontWeight: 600,
};

const languageButtonsStyle: React.CSSProperties = {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
};

const languageButtonSmallStyle: React.CSSProperties = {
    background: "transparent",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#444",
    borderRadius: "999px",
    cursor: "pointer",
    color: "#aaa",
    fontSize: "13px",
    padding: "7px 10px",
    transition: "background 0.15s ease, border-color 0.15s ease, color 0.15s ease",
};

const languageButtonActiveStyle: React.CSSProperties = {
    background: "#1d9bf0",
    borderColor: "#1d9bf0",
    color: "white",
};
