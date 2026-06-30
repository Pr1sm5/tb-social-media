export type InfoBoxItem = {
  text: string;
  type?: "info" | "error" | "success" | "warning";
};

export const INFO_EVENTS: Record<
  "de" | "en",
  { delay: number; data: InfoBoxItem }[]
> = {
  en: [
    {
      delay: 5000,
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
        text: "Klener Test"
      }
    }
  ]
};