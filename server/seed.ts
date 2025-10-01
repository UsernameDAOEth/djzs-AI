import { storage } from "./storage";

async function seed() {
  console.log("Seeding newsletter issues...");

  const issues = [
    {
      issueNumber: 42,
      title: "DJZS Alpha Drop: DeFi Yield Plays",
      description: "Agent-curated perp setups, liquidity notes, and on-chain flows. Deep dive into emerging yield opportunities.",
      isPublished: true,
      pdfUrl: null,
      ipfsMetadataUri: null,
      nftContractAddress: null,
    },
    {
      issueNumber: 41,
      title: "Base Ecosystem Deep Dive",
      description: "Comprehensive analysis of Base chain growth, major protocols, and upcoming catalysts for Q1 2024.",
      isPublished: true,
      pdfUrl: null,
      ipfsMetadataUri: null,
      nftContractAddress: null,
    },
    {
      issueNumber: 40,
      title: "AI Trading Agents Analysis",
      description: "How autonomous agents are reshaping crypto markets. Performance metrics and integration strategies.",
      isPublished: true,
      pdfUrl: null,
      ipfsMetadataUri: null,
      nftContractAddress: null,
    },
    {
      issueNumber: 39,
      title: "NFT Market Sentiment Report",
      description: "Volume trends, collector behavior, and emerging collections. On-chain data reveals market shifts.",
      isPublished: true,
      pdfUrl: null,
      ipfsMetadataUri: null,
      nftContractAddress: null,
    },
    {
      issueNumber: 38,
      title: "Layer 2 Scaling Wars Update",
      description: "Comparative analysis of Base, Optimism, Arbitrum. TPS metrics, fee comparisons, and developer activity.",
      isPublished: true,
      pdfUrl: null,
      ipfsMetadataUri: null,
      nftContractAddress: null,
    },
    {
      issueNumber: 37,
      title: "DeFi Protocol Revenue Models",
      description: "Breaking down fee structures, token economics, and sustainability metrics across top protocols.",
      isPublished: true,
      pdfUrl: null,
      ipfsMetadataUri: null,
      nftContractAddress: null,
    },
  ];

  for (const issue of issues) {
    const existing = await storage.getNewsletterIssueByNumber(issue.issueNumber);
    if (!existing) {
      await storage.createNewsletterIssue(issue);
      console.log(`Created issue #${issue.issueNumber}`);
    } else {
      console.log(`Issue #${issue.issueNumber} already exists`);
    }
  }

  console.log("Seeding complete!");
}

seed().catch(console.error);
