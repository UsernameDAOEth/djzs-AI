import { useQuery } from "@tanstack/react-query";
import type { NewsletterIssue } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export function MemberContent() {
  const { data: issues = [], isLoading } = useQuery<NewsletterIssue[]>({
    queryKey: ["/api/newsletter-issues"],
  });

  if (isLoading) {
    return (
      <div className="mt-8">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {/* Member Content Section Header */}
      <div className="mb-6 flex items-center justify-between">
        <h4 className="text-xl font-bold text-white">Latest Issues</h4>
        <button className="text-sm text-primary hover:text-primary/80 underline" data-testid="button-view-all">
          View All →
        </button>
      </div>

      {/* Newsletter Issue Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {issues.map((issue, index) => (
          <article key={issue.id} className="glass-card group rounded-2xl p-5 transition hover:bg-white/10" data-testid={`card-issue-${issue.issueNumber}`}>
            <div className="mb-3 flex items-center gap-2">
              <span
                className={`rounded-lg px-2 py-1 text-xs font-semibold ${
                  index % 2 === 0 ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"
                }`}
                data-testid={`text-issue-number-${issue.issueNumber}`}
              >
                Issue #{issue.issueNumber}
              </span>
              <span className="text-xs text-white/50" data-testid={`text-issue-date-${issue.issueNumber}`}>
                {formatDistanceToNow(new Date(issue.publishedAt), { addSuffix: true })}
              </span>
            </div>
            <h4 className="font-semibold text-white" data-testid={`text-issue-title-${issue.issueNumber}`}>{issue.title}</h4>
            <p className="mt-2 text-sm text-white/70" data-testid={`text-issue-description-${issue.issueNumber}`}>{issue.description}</p>

            <div className="mt-4 flex items-center gap-2">
              <button className="flex-1 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/20" data-testid={`button-read-pdf-${issue.issueNumber}`}>
                Read PDF
              </button>
              <button className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/20" data-testid={`button-mint-nfi-${issue.issueNumber}`}>
                Mint NFI
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
