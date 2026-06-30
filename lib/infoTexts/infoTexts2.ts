export type InfoBoxItem = {
  text: string;
  type?: "info" | "error" | "success" | "warning";
};

export const INFO_EVENTS2: Record<
    "de" | "en",
    { delay: number; data: InfoBoxItem }[]
> = {
  en: [
    {
      delay: 15000,
      data: {
        type: "warning",
        text: "The comments you saw were generated automatically to demonstrate how AI can influence social media discussions."
      }
    },
    {
      delay: 30000,
      data: {
        type: "info",
        text: "AI can create thousands of realistic comments within seconds. If many support the same opinion, they can create the impression that 'everyone agrees', even when this is not true."
      }
    },
    {
      delay: 45000,
      data: {
        type: "warning",
        text: "This does not mean AI always manipulates people. However, automated accounts can amplify viewpoints, spread misinformation, and distort public debate."
      }
    },
    {
      delay: 60000,
      data: {
        type: "success",
        text: "In 2023, hundreds of AI researchers warned that large-scale misuse of AI should be treated as a global priority."
      }
    },
    {
      delay: 60000,
      data: {
        type: "success",
        text: "A meta-analysis of 44 studies found that online comments influence how people evaluate information, what they believe, how they feel, and whether they express similar opinions (Chen & Xia, 2024)."
      }
    },
    {
      delay: 60000,
      data: {
        type: "success",
        text: "When many comments support the same view, people may assume it represents the majority. This is known as social influence, social norms, and the bandwagon effect."
      }
    },
    {
      delay: 60000,
      data: {
        type: "success",
        text: "Studies show that even a small number of social bots can change how online discussions appear.By repeatedly promoting the same viewpoint, bots can create the impression that one opinion is widely supported, even when it is not (Su et al., 2020; Hegelich & Janetzko, 2019)."
      }
    },
    {
      delay: 60000,
      data: {
        type: "success",
        text: "Rather than changing minds through stronger arguments, bots can change how people perceive public opinion."
      }
    },
    {
      delay: 60000,
      data: {
        type: "success",
        text: "Modern AI can generate realistic, human-like comments at massive scale and adapt them to different audiences.Research warns that AI-powered bots can generate convincing content, imitate users, amplify narratives, and create the illusion of widespread agreement (Baltezarević et al.).This makes large-scale manipulation easier, faster, and cheaper than ever before."
      }
    },
    {
      delay: 60000,
      data: {
        type: "success",
        text: "People often assume comment sections reflect the opinions of many independent users.If some comments are AI-generated, discussions may no longer represent reality.Research shows that comments influence what people believe, trust, feel, and whether they express similar opinions (Chen & Xia, 2024)."
      }
    },
    {
      delay: 60000,
      data: {
        type: "success",
        text: "AI-generated comments can therefore shape perceived public opinion.What can you take away?Many similar comments do not necessarily reflect public opinion.Online discussions can be influenced by coordinated automated activity. AI can make opinions appear more popular than they really are. Perceived consensus is not always real consensus."
      }
    },
    {
      delay: 60000,
      data: {
        type: "success",
        text: "Who is behind these comments? Are these reactions from real people or coordinated automated accounts?"
      }
    }
  ],

  de: [
    {
      delay: 5000,
      data: {
        type: "warning",
        text: "Die Kommentare, die du gesehen hast, wurden automatisch generiert, um zu demonstrieren, wie KI Diskussionen in sozialen Medien beeinflussen kann."
      }
    },
    {
      delay: 15000,
      data: {
        type: "info",
        text: "KI kann tausende realistische Kommentare in Sekunden erzeugen. Wenn viele dieselbe Meinung unterstützen, kann der Eindruck entstehen, dass 'alle zustimmen', selbst wenn das nicht stimmt."
      }
    },
    {
      delay: 30000,
      data: {
        type: "warning",
        text: "Das bedeutet nicht, dass KI immer zur Manipulation eingesetzt wird. Allerdings können automatisierte Accounts Sichtweisen verstärken, Fehlinformationen verbreiten und öffentliche Debatten verzerren."
      }
    },
    {
      delay: 45000,
      data: {
        type: "success",
        text: "Im Jahr 2023 warnten hunderte KI-Forschende davor, dass der großflächige Missbrauch von KI als globale Priorität behandelt werden sollte."
      }
    },
    {
      delay: 60000,
      data: {
        type: "success",
        text: "Eine Metaanalyse von 44 Studien zeigt, dass Online-Kommentare beeinflussen, wie Menschen Informationen bewerten, was sie glauben, wie sie fühlen und ob sie ähnliche Meinungen äußern (Chen & Xia, 2024)."
      }
    },
    {
      delay: 60000,
      data: {
        type: "success",
        text: "Wenn viele Kommentare dieselbe Meinung vertreten, nehmen Menschen dies oft als Mehrheitsmeinung wahr. Dies wird als sozialer Einfluss, soziale Normen und Bandwagon-Effekt bezeichnet."
      }
    },
    {
      delay: 60000,
      data: {
        type: "success",
        text: "Studien zeigen, dass bereits eine kleine Anzahl von Social Bots die Wahrnehmung von Online-Diskussionen verändern kann. Durch wiederholtes Promoten derselben Sichtweise entsteht der Eindruck, dass eine Meinung weit verbreitet ist, selbst wenn sie es nicht ist (Su et al., 2020; Hegelich & Janetzko, 2019)."
      }
    },
    {
      delay: 60000,
      data: {
        type: "success",
        text: "Bots verändern Meinungen oft nicht durch bessere Argumente, sondern dadurch, wie Menschen die öffentliche Meinung wahrnehmen."
      }
    },
    {
      delay: 60000,
      data: {
        type: "success",
        text: "Moderne KI kann realistische, menschenähnliche Kommentare in großem Maßstab erzeugen und an verschiedene Zielgruppen anpassen. Forschung warnt, dass KI-gesteuerte Bots überzeugende Inhalte generieren, Nutzer imitieren, Narrative verstärken und den Eindruck weit verbreiteter Zustimmung erzeugen können (Baltezarević et al.). Dies macht großflächige Manipulation einfacher, schneller und günstiger als je zuvor."
      }
    },
    {
      delay: 60000,
      data: {
        type: "success",
        text: "Menschen gehen oft davon aus, dass Kommentarspalten die Meinung vieler unabhängiger Nutzer widerspiegeln. Wenn jedoch Kommentare KI-generiert sind, spiegeln Diskussionen möglicherweise nicht mehr die Realität wider. Studien zeigen, dass Kommentare beeinflussen, was Menschen glauben, vertrauen, fühlen und ob sie ähnliche Meinungen äußern (Chen & Xia, 2024)."
      }
    },
    {
      delay: 60000,
      data: {
        type: "success",
        text: "KI-generierte Kommentare können somit die wahrgenommene öffentliche Meinung formen. Was kann man daraus mitnehmen? Viele ähnliche Kommentare bedeuten nicht automatisch eine echte Mehrheitsmeinung. Online-Diskussionen können durch koordinierte automatisierte Aktivitäten beeinflusst werden. KI kann Meinungen populärer erscheinen lassen, als sie tatsächlich sind. Wahrgenommene Zustimmung ist nicht immer echte Zustimmung."
      }
    },
    {
      delay: 60000,
      data: {
        type: "success",
        text: "Wer steckt hinter diesen Kommentaren? Sind es echte Menschen oder koordinierte automatisierte Accounts?"
      }
    }
  ]
};