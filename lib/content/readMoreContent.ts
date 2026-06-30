// lib/content/readMoreContent.ts

export type ReadMoreBlock =
    | { type: "heading"; text: string }
    | { type: "paragraph"; text: string }
    | { type: "list"; items: string[] }
    | { type: "quote"; text: string };

export type ReadMoreContent = {
    pageTitle: string;
    blocks: ReadMoreBlock[];
    references: string[];
};

// Quellenangaben sind sprachneutral, daher in beiden Versionen identisch
const REFERENCES = [
    "Chen, J., & Xia, S. (2024). Are Online Users Influenced by What Other Users Say? Meta-Analyzing the Cognitive, Emotional, and Behavioral Impact of Online Comment Valence. Cyberpsychology: Journal of Psychosocial Research on Cyberspace, 18(5). DOI: 10.5817/CP2024-5-8.",
    "Su, Q., et al. (2020). Dynamic Mechanism of Social Bots Interfering with Public Opinion in Network. Physica A: Statistical Mechanics and its Applications.",
    "Hegelich, S., & Janetzko, D. (2019). Are Social Bots a Real Threat? European Journal of Information Systems, 28(2), 141–148.",
    "Baltezarević, I., Baltezarević, V., & Baltezarević, R. AI-Driven Social Bots in Political Campaigns and Their Role in Shaping Opinion.",
    "Center for AI Safety. (2023). Statement on AI Risk.",
];

export const READ_MORE_CONTENT: Record<"de" | "en", ReadMoreContent> = {
    en: {
        pageTitle: "What just happened?",
        blocks: [
            { type: "paragraph", text: "The comments you just saw were generated automatically. They were designed to simulate how AI could influence discussions on social media." },
            { type: "paragraph", text: "Today, AI can create thousands of realistic comments within seconds. If many of these comments support the same opinion, they can create the impression that \u201Ceveryone agrees\u201D, even when that is not true." },
            { type: "paragraph", text: "This does not mean that AI always manipulates people. However, if AI is intentionally misused, large numbers of automated accounts can amplify specific viewpoints, spread misinformation, or distort public discussions." },
            { type: "paragraph", text: "In 2023, hundreds of leading AI researchers and industry experts signed a public statement saying that serious risks from AI should be considered a global priority. One concern they highlighted is the potential misuse of AI systems at a massive scale (Center for AI Safety, 2023)." },

            { type: "heading", text: "Why can comments influence us?" },
            { type: "paragraph", text: "Research shows that online comments are much more powerful than we often think." },
            { type: "paragraph", text: "A recent meta-analysis of 44 scientific studies found that online comments can influence:" },
            { type: "list", items: [
                    "how we evaluate information,",
                    "what we believe,",
                    "how we feel,",
                    "and whether we are willing to express the same opinion ourselves (Chen & Xia, 2024).",
                ]},
            { type: "quote", text: "Comments do not only reflect public opinion — they can also shape it." },
            { type: "paragraph", text: "People often use comments as signals to understand what others think. When many comments support the same idea, we may assume that this opinion is popular, trustworthy, or shared by the majority. This is known as social influence, social norms, and the bandwagon effect (Chen & Xia, 2024)." },

            { type: "heading", text: "What do social bots have to do with this?" },
            { type: "paragraph", text: "Scientific studies show that even a relatively small number of social bots can significantly influence how online discussions appear." },
            { type: "paragraph", text: "Research has found that automated accounts can repeatedly promote the same viewpoint and create the impression that one opinion is dominant, even if the real majority of people may disagree (Su et al., 2020; Hegelich & Janetzko, 2019)." },
            { type: "paragraph", text: "Instead of changing opinions through better arguments, bots can change how we perceive the opinions of others by shaping what appears to be the majority opinion (Su et al., 2020)." },

            { type: "heading", text: "Why is AI changing this problem?" },
            { type: "paragraph", text: "Modern AI systems can generate realistic comments at a massive scale. Unlike traditional bots, generative AI can produce convincing, human-like content in seconds and adapt messages to different audiences." },
            { type: "paragraph", text: "Recent research warns that AI-powered bots can:" },
            { type: "list", items: [
                    "generate large amounts of convincing content,",
                    "imitate real users,",
                    "amplify specific narratives,",
                    "and create the illusion of widespread agreement (Baltezarević et al.).",
                ]},
            { type: "paragraph", text: "This makes manipulating online discussions easier, faster, and cheaper than ever before." },

            { type: "heading", text: "Why does this matter?" },
            { type: "paragraph", text: "When we read a comment section, we usually assume that it represents the opinions of many independent people." },
            { type: "paragraph", text: "But what if some of those comments were generated automatically?" },
            { type: "paragraph", text: "What if hundreds or thousands of comments were created by AI systems to support a particular message?" },
            { type: "paragraph", text: "The discussion might look completely different from reality." },
            { type: "paragraph", text: "Research shows that online comments can influence how people evaluate information, what they believe, how they feel, and whether they are willing to express the same opinion themselves (Chen & Xia, 2024)." },
            { type: "paragraph", text: "This means that AI-generated comments can potentially influence:" },
            { type: "list", items: [
                    "what people believe,",
                    "what opinions they express,",
                    "which information they trust,",
                    "and what they think the majority believes.",
                ]},

            { type: "heading", text: "What can you take away?" },
            { type: "list", items: [
                    "A large number of similar comments does not necessarily represent public opinion.",
                    "Online discussions can be influenced by coordinated automated activity.",
                    "AI can make an opinion appear more popular than it really is.",
                    "Perceived consensus is not always the same as real consensus.",
                    "Critical thinking means asking:",
                ]},
            { type: "quote", text: "Who is behind these comments?" },
            { type: "quote", text: "Do these reactions represent real people or coordinated automated activity?" },
        ],
        references: REFERENCES,
    },

    de: {
        pageTitle: "Was ist gerade passiert?",
        blocks: [
            { type: "paragraph", text: "Die Kommentare, die du gerade gesehen hast, wurden automatisch generiert. Sie sollten simulieren, wie KI Diskussionen in sozialen Medien beeinflussen kann." },
            { type: "paragraph", text: "Heute kann KI innerhalb von Sekunden tausende realistisch wirkende Kommentare erstellen. Wenn viele dieser Kommentare dieselbe Meinung vertreten, können sie den Eindruck erwecken, dass \u201Ealle einer Meinung sind\u201C — selbst wenn das nicht stimmt." },
            { type: "paragraph", text: "Das bedeutet nicht, dass KI Menschen immer manipuliert. Wird KI jedoch gezielt missbraucht, können große Mengen automatisierter Accounts bestimmte Standpunkte verstärken, Falschinformationen verbreiten oder öffentliche Diskussionen verzerren." },
            { type: "paragraph", text: "2023 unterzeichneten Hunderte führende KI-Forscher:innen und Branchenexpert:innen eine öffentliche Erklärung, in der sie schwerwiegende Risiken durch KI als globale Priorität einstuften. Eine der genannten Sorgen war der mögliche massenhafte Missbrauch von KI-Systemen (Center for AI Safety, 2023)." },

            { type: "heading", text: "Warum können uns Kommentare beeinflussen?" },
            { type: "paragraph", text: "Forschung zeigt, dass Online-Kommentare viel mächtiger sind, als wir oft denken." },
            { type: "paragraph", text: "Eine aktuelle Meta-Analyse von 44 wissenschaftlichen Studien zeigt, dass Online-Kommentare beeinflussen können:" },
            { type: "list", items: [
                    "wie wir Informationen bewerten,",
                    "was wir glauben,",
                    "wie wir uns fühlen,",
                    "und ob wir bereit sind, selbst dieselbe Meinung zu äußern (Chen & Xia, 2024).",
                ]},
            { type: "quote", text: "Kommentare spiegeln die öffentliche Meinung nicht nur wider — sie können sie auch formen." },
            { type: "paragraph", text: "Menschen nutzen Kommentare oft als Signale, um zu verstehen, was andere denken. Wenn viele Kommentare dieselbe Idee unterstützen, gehen wir womöglich davon aus, dass diese Meinung populär, vertrauenswürdig oder mehrheitsfähig ist. Das nennt man sozialen Einfluss, soziale Normen und den Bandwagon-Effekt (Chen & Xia, 2024)." },

            { type: "heading", text: "Was haben Social Bots damit zu tun?" },
            { type: "paragraph", text: "Wissenschaftliche Studien zeigen, dass schon eine relativ kleine Anzahl an Social Bots erheblich beeinflussen kann, wie Online-Diskussionen wirken." },
            { type: "paragraph", text: "Forschung zeigt, dass automatisierte Accounts wiederholt denselben Standpunkt verbreiten und so den Eindruck erwecken können, eine Meinung sei dominant — selbst wenn die tatsächliche Mehrheit anderer Meinung ist (Su et al., 2020; Hegelich & Janetzko, 2019)." },
            { type: "paragraph", text: "Anstatt Meinungen durch bessere Argumente zu ändern, können Bots verändern, wie wir die Meinungen anderer wahrnehmen — indem sie formen, was als Mehrheitsmeinung erscheint (Su et al., 2020)." },

            { type: "heading", text: "Warum verändert KI dieses Problem?" },
            { type: "paragraph", text: "Moderne KI-Systeme können realistisch wirkende Kommentare in riesigem Umfang erzeugen. Anders als klassische Bots kann generative KI in Sekunden überzeugende, menschlich klingende Inhalte produzieren und Botschaften an unterschiedliche Zielgruppen anpassen." },
            { type: "paragraph", text: "Aktuelle Forschung warnt, dass KI-gestützte Bots:" },
            { type: "list", items: [
                    "große Mengen überzeugender Inhalte erzeugen können,",
                    "echte Nutzer:innen imitieren können,",
                    "bestimmte Narrative verstärken können,",
                    "und die Illusion breiter Zustimmung erzeugen können (Baltezarević et al.).",
                ]},
            { type: "paragraph", text: "Das macht die Manipulation von Online-Diskussionen einfacher, schneller und günstiger als je zuvor." },

            { type: "heading", text: "Warum ist das wichtig?" },
            { type: "paragraph", text: "Wenn wir einen Kommentarbereich lesen, gehen wir meist davon aus, dass er die Meinungen vieler unabhängiger Menschen widerspiegelt." },
            { type: "paragraph", text: "Aber was, wenn einige dieser Kommentare automatisch generiert wurden?" },
            { type: "paragraph", text: "Was, wenn Hunderte oder Tausende Kommentare von KI-Systemen erstellt wurden, um eine bestimmte Botschaft zu unterstützen?" },
            { type: "paragraph", text: "Die Diskussion könnte dann völlig anders aussehen, als sie in Wirklichkeit ist." },
            { type: "paragraph", text: "Forschung zeigt, dass Online-Kommentare beeinflussen können, wie Menschen Informationen bewerten, was sie glauben, wie sie sich fühlen, und ob sie bereit sind, selbst dieselbe Meinung zu äußern (Chen & Xia, 2024)." },
            { type: "paragraph", text: "Das bedeutet, dass KI-generierte Kommentare potenziell beeinflussen können:" },
            { type: "list", items: [
                    "was Menschen glauben,",
                    "welche Meinungen sie äußern,",
                    "welchen Informationen sie vertrauen,",
                    "und was sie für die Mehrheitsmeinung halten.",
                ]},

            { type: "heading", text: "Was kannst du daraus mitnehmen?" },
            { type: "list", items: [
                    "Eine große Anzahl ähnlicher Kommentare repräsentiert nicht zwangsläufig die öffentliche Meinung.",
                    "Online-Diskussionen können durch koordinierte automatisierte Aktivität beeinflusst werden.",
                    "KI kann eine Meinung populärer erscheinen lassen, als sie tatsächlich ist.",
                    "Wahrgenommener Konsens ist nicht immer dasselbe wie tatsächlicher Konsens.",
                    "Kritisches Denken bedeutet zu fragen:",
                ]},
            { type: "quote", text: "Wer steckt hinter diesen Kommentaren?" },
            { type: "quote", text: "Stammen diese Reaktionen von echten Menschen oder von koordinierter automatisierter Aktivität?" },
        ],
        references: REFERENCES,
    },
};