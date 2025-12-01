export default [
  {
    model: "GPT",
    icon: "/gpt.png",
    premium: false,
    enable: true,
    subModel: [
      { name: "GPT-4o Mini", premium: false, id: "openai/gpt-4o-mini" },
      { name: "GPT-4.1", premium: true, id: "openai/gpt-4.1" }
    ],
  },

  {
  model: "Gemini",
  icon: "/gemini.png",
  premium: false,
  enable: true,
  subModel: [
    { name: "Gemini 2.5 Flash", premium: false, id: "models/gemini-2.5-flash" },
    { name: "Gemini Flash Latest", premium: false, id: "models/gemini-flash-latest" },
    { name: "Gemini 2.0 Flash", premium: false, id: "models/gemini-2.0-flash" },

    // Premium (optional)
    { name: "Gemini 2.5 Pro", premium: true, id: "models/gemini-2.5-pro" },
  ],
},




  {
    model: "DeepSeek",
    icon: "/deepseek.png",
    premium: false,
    enable: true,
    subModel: [
      { name: "DeepSeek R1", premium: false, id: "deepseek/deepseek-r1" },
      { name: "DeepSeek R1 Distill", premium: true, id: "deepseek/deepseek-r1-distill" }
    ],
  },
  // PREMIUM MODELS
  {
    model: "Mistral",
    icon: "/mistral.png",
    premium: true,
    enable: false,
    subModel: [
      { name: "Mistral Small", premium: true, id: "mistralai/mistral-small" },
      { name: "Mistral Medium", premium: true, id: "mistralai/mistral-medium" },
      { name: "Mistral Large", premium: true, id: "mistralai/mistral-large" },
    ],
  },

  {
    model: "Llama",
    icon: "/llama.png",
    premium: true,
    enable: false,
    subModel: [
      { name: "Llama 3.1 8B", premium: true, id: "meta-llama/llama-3.1-8b" },
      { name: "Llama 3.1 70B", premium: true, id: "meta-llama/llama-3.1-70b" },
    ],
  },

  {
    model: "Grok",
    icon: "/grok.png",
    premium: true,
    enable: false,
    subModel: [
      { name: "Grok-2", premium: true, id: "xai/grok-2" },
    ],
  },

  {
    model: "Cohere",
    icon: "/cohere.png",
    premium: true,
    enable: false,
    subModel: [
      { name: "Command R", premium: true, id: "cohere/command-r" },
      { name: "Command R+", premium: true, id: "cohere/command-r-plus" },
    ],
  },
];
