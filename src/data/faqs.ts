/**
 * FAQ content distilled from UNAIDS public information on HIV & AIDS.
 * Source: https://www.unaids.org/en/frequently-asked-questions-about-hiv-and-aids
 * Phrasing condensed for accessibility; intent preserved.
 */
export type FaqItem = {
  id: string;
  category: "Basics" | "Transmission" | "Prevention" | "Testing" | "Treatment" | "Living with HIV";
  question: string;
  answer: string;
};

export const faqs: FaqItem[] = [
  {
    id: "what-is-hiv",
    category: "Basics",
    question: "What is HIV?",
    answer:
      "HIV — the human immunodeficiency virus — attacks the body's immune system, specifically the CD4 (T-cell) cells that help fight infection. Left untreated, HIV reduces the number of these cells, making the person more susceptible to other infections and disease.",
  },
  {
    id: "what-is-aids",
    category: "Basics",
    question: "What is AIDS?",
    answer:
      "AIDS (acquired immunodeficiency syndrome) is the most advanced stage of HIV infection, defined by the occurrence of any of more than 20 opportunistic infections or HIV-related cancers. With consistent treatment, HIV does not need to progress to AIDS.",
  },
  {
    id: "hiv-vs-aids",
    category: "Basics",
    question: "What is the difference between HIV and AIDS?",
    answer:
      "HIV is the virus that causes the infection. AIDS is a clinical syndrome that can develop after years of untreated HIV infection. A person can live with HIV for many years without developing AIDS, especially if they are on effective antiretroviral therapy.",
  },
  {
    id: "transmission-routes",
    category: "Transmission",
    question: "How is HIV transmitted?",
    answer:
      "HIV is transmitted through the exchange of certain body fluids from a person living with HIV: blood, breast milk, semen and vaginal secretions. This commonly happens through unprotected sex, the sharing of contaminated needles, and from a mother to her child during pregnancy, childbirth or breastfeeding.",
  },
  {
    id: "casual-contact",
    category: "Transmission",
    question: "Can HIV be transmitted through casual contact?",
    answer:
      "No. HIV is not transmitted through hugging, shaking hands, sharing toilets, sharing dishes, or kissing on the cheek. HIV is also not transmitted through saliva, tears, sweat, mosquito bites, or by sharing food or drinks.",
  },
  {
    id: "u-equals-u",
    category: "Transmission",
    question: "What does “Undetectable = Untransmittable” (U=U) mean?",
    answer:
      "People living with HIV who take antiretroviral therapy as prescribed and maintain an undetectable viral load cannot sexually transmit HIV to their partners. This is widely known as U=U.",
  },
  {
    id: "prevention",
    category: "Prevention",
    question: "How can I protect myself from HIV?",
    answer:
      "Use condoms correctly and consistently for every sex act; get tested regularly for HIV and other STIs; use sterile injecting equipment; consider PrEP (pre-exposure prophylaxis) if you are at substantial risk; and access PEP (post-exposure prophylaxis) within 72 hours of possible exposure.",
  },
  {
    id: "prep",
    category: "Prevention",
    question: "What is PrEP?",
    answer:
      "Pre-exposure prophylaxis (PrEP) is the use of antiretroviral medicine by HIV-negative people to prevent acquiring HIV. Taken as prescribed, PrEP is highly effective at preventing HIV from sex or injection drug use.",
  },
  {
    id: "pep",
    category: "Prevention",
    question: "What is PEP and when should I take it?",
    answer:
      "Post-exposure prophylaxis (PEP) is a short course of antiretroviral medicines taken within 72 hours after possible exposure to HIV (e.g., condomless sex, needlestick injury, or sexual assault) to reduce the chance of becoming infected. The sooner it is started, the better.",
  },
  {
    id: "testing-why",
    category: "Testing",
    question: "Why is HIV testing important?",
    answer:
      "Testing is the only way to know your HIV status. Knowing your status lets you start treatment early, live longer and healthier, and protect your partners. Testing services are confidential and, in many places, free.",
  },
  {
    id: "window-period",
    category: "Testing",
    question: "What is the window period?",
    answer:
      "The window period is the time between possible HIV exposure and when a test can reliably detect HIV. Depending on the test, this can range from 10 days to 3 months. If you test during the window period, you may need to test again later to confirm the result.",
  },
  {
    id: "treatment",
    category: "Treatment",
    question: "Is there a cure for HIV?",
    answer:
      "There is no cure for HIV, but effective treatment with antiretroviral therapy (ART) can keep the virus under control and allow people living with HIV to lead long, healthy lives, and prevent onward transmission.",
  },
  {
    id: "art",
    category: "Treatment",
    question: "What is antiretroviral therapy (ART)?",
    answer:
      "ART is a daily combination of HIV medicines that stops the virus from multiplying. It does not eliminate HIV, but it can reduce the amount of virus in the body to undetectable levels, protecting the immune system and preventing sexual transmission.",
  },
  {
    id: "living-well",
    category: "Living with HIV",
    question: "Can people living with HIV have a normal life expectancy?",
    answer:
      "Yes. With early diagnosis, consistent treatment, and good clinical follow-up, people living with HIV can have a life expectancy similar to that of the general population.",
  },
  {
    id: "pregnancy",
    category: "Living with HIV",
    question: "Can a woman living with HIV safely have children?",
    answer:
      "Yes. With timely diagnosis, antiretroviral therapy during pregnancy and breastfeeding, and safe delivery practices, the risk of transmitting HIV to the baby can be reduced to less than 1%.",
  },
  {
    id: "stigma",
    category: "Living with HIV",
    question: "How can we end HIV stigma and discrimination?",
    answer:
      "Stigma is fuelled by misinformation and fear. Learning the facts about HIV, using respectful language (for example, “a person living with HIV”), and challenging discrimination at home, school, work and in health services help create environments where people feel safe to test, treat and live openly.",
  },
];

export const faqCategories = [
  "All",
  "Basics",
  "Transmission",
  "Prevention",
  "Testing",
  "Treatment",
  "Living with HIV",
] as const;
