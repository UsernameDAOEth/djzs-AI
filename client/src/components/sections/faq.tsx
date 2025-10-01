export function FAQ() {
  const faqs = [
    {
      question: "What is the Subscribe NFT?",
      answer: "The Subscribe NFT is an ERC-721 token on Base that grants you access to all premium newsletter content. It's transferable, meaning you can trade or gift it. One NFT per wallet unlocks everything.",
    },
    {
      question: "How do I mint the Subscribe NFT?",
      answer: "Connect your wallet using the button above, then click \"Mint Subscribe NFT\". You'll need some ETH on Base to pay for the NFT price (if set) and gas fees. The transaction completes in seconds.",
    },
    {
      question: "Can I transfer my subscription to someone else?",
      answer: "Yes! The Subscribe NFT is a standard ERC-721, so you can send it to another wallet, list it on OpenSea, or trade it peer-to-peer. Whoever holds the NFT gets access.",
    },
    {
      question: "What are NFI (NFT Issues)?",
      answer: "Each newsletter issue can be minted as a separate collectible NFT. These are optional and let you build a collection, prove you read certain issues, or trade insights with other collectors.",
    },
    {
      question: "Which networks are supported?",
      answer: "DJZS runs on Base (mainnet) and Base Sepolia (testnet). We chose Base for its low fees, fast finality, and growing ecosystem. Connect your wallet and it'll auto-detect the right network.",
    },
    {
      question: "How often are new issues published?",
      answer: "We publish weekly issues every Monday morning (UTC). Subscribers get instant access when each issue drops. Special alpha reports and urgent market updates are published as needed.",
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
