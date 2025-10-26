export default [
    {
        model: "GPT",
        icon: "/gpt.png",
        premium: false,
        enable: true,
        subModel: [
            { name: "GPT 3.5", premium: false, id: "gpt-4.1-mini" },
            { name: "GPT 3.5 Turbo", premium: false, id: "" },
            { name: "GPT 4.1 Mini", premium: false, id: "" },
            { name: "GPT4.1", premium: true, id: "" },
            { name: "GPT5 Nano", premium: false, id: "" },
            { name: "GPT 5 Mini", premium: false, id: "" },
            { name: "GPT 5", premium: true, id: "" },
        ],
    },
    {
        model: "Gemini",
        icon: "/gemini.png",
        premium: false,
        enable: true,
        subModel: [{ name: "Gemini 2.5 lite", premium: false, id:"gemini-2.5-flash-lite" },
        { name: "Gemini 2.5 Flash", premium: false, id:"" },
        { name: "Gemini 2.5 Pro", premium: true,id:"" }
        ],
    },
    {
        model: "DeepSeek",
        icon: "/deepseek.png",
        premium: false,
        enable: true,
        subModel: [
            { name: "DeepSeek R1", premium: false, id: "DeepSeek-R1" },
            { name: "DeepSeek R1 0528", premium: true, id: "" },
        ],
    },
    {
        model: "Mistral",
        icon: "/mistral.png",
        premium: true,
        enable: true,
        subModel: [
            { name: "Mistral Medium 2025", premium: true, id: "mistral-medium-2025" },
            { name: "Ministral 3B", premium: false, id: "" },
        ],
    },
    {
        model: "Grok",
        icon: "/grok.png",
        premium: true,
        enable: true,
        subModel: [
            { name: "Grok 3 Mini", premium: false, id: "grok-3-mini" },
            { name: "Grok 3", premium: true, id: "" },
        ],
    },
    {
        model: "Cohere",
        icon: "/cohere.png",
        premium: true,
        enable: true,
        subModel: [
            { name: "Cohere Command A", premium: false, id: "cohere-command-a" },
            { name: "Cohere Command R 08-2024", premium: false, id: "" },
        ],
    },
    {
        model: "Llama",
        icon: "/llama.png",
        premium: true,
        enable: true,
        subModel: [
            { name: "Llama 3.3 70B Instruct", premium: true, id: "Llama-3.3-70B-instruct" },
            { name: "Llama 4 Scout 17B 16E Instruct", premium: true, id: "" },
        ],
    },
];