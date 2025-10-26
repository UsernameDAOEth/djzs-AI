export function FAQ() {
  const faqs = [
    {
      question: "What is the Subscribe NFT?",
      answer: "The Subscribe NFT is an ERC-721 token on Base that grants permanent access to all platform features: premium newsletters, AI writing assistant, and the writing journal. It costs 0.001 ETH and provides lifetime access.",
    },
    {
      question: "What is the AI Writing Assistant?",
      answer: "Our AI assistant is powered by Nous Research Hermes-4 (70B model). It helps you write newsletter content, trading analysis, and market insights. You can chat with it in real-time and insert suggestions directly into your journal.",
    },
    {
      question: "How does the Writing Journal work?",
      answer: "The journal is your personal space to create and save trading content. Write market analysis, document strategies, or draft newsletter issues with AI assistance. Future updates will include draft saving and multiple journal entries.",
    },
    {
      question: "Can I transfer my subscription?",
      answer: "Yes! The Subscribe NFT follows the ERC-721 standard, making it fully transferable. You can send it to another wallet, list it on OpenSea, or trade it. Whoever holds the NFT gets full platform access.",
    },
    {
      question: "Which blockchain do you use?",
      answer: "We use Base (Ethereum L2) for low fees and fast transactions. The Subscribe NFT contract is deployed via Unlock Protocol at address 0xfeda5ad4559bba0c57e46bb4f165fd80cdc8dd61.",
    },
    {
      question: "Is there a supply limit?",
      answer: "No, there's unlimited supply. Anyone can mint a Subscribe NFT for 0.001 ETH anytime. This ensures the platform remains accessible to all traders and writers interested in crypto content creation.",
    },
  ];

  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">Frequently Asked Questions</h2>
        </div>

        <div className="mt-12 space-y-4">
          {faqs.map((faq, index) => (
            <details key={index} className="glass-card group rounded-2xl p-6" data-testid={`faq-${index}`}>
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-white" data-testid={`faq-question-${index}`}>
                <span>{faq.question}</span>
                <svg className="h-5 w-5 transition group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-4 text-white/70" data-testid={`faq-answer-${index}`}>{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
