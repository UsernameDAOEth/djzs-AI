import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Newspaper, Loader2, Send, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ParagraphPost {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  imageUrl?: string;
  publishedAt?: string;
  markdown?: string;
  staticHtml?: string;
}

interface ParagraphPublication {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
}

interface NewsletterSubmitData {
  postId: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  publishedAt?: string;
  slug: string;
  publicationSlug: string;
  excerpt?: string;
}

interface NewsletterComposerProps {
  onSubmit: (data: NewsletterSubmitData) => void;
  isSubmitting?: boolean;
}

export function NewsletterComposer({ onSubmit, isSubmitting }: NewsletterComposerProps) {
  const [publicationSlug, setPublicationSlug] = useState("");
  const [searchSlug, setSearchSlug] = useState("");
  const [selectedPost, setSelectedPost] = useState<ParagraphPost | null>(null);

  const { data, isLoading, error, refetch } = useQuery<{
    posts: ParagraphPost[];
    pagination: { hasMore: boolean; cursor?: string; total?: number };
    publication: ParagraphPublication;
  }>({
    queryKey: ["/api/paragraph/publications", searchSlug, "posts"],
    queryFn: async () => {
      if (!searchSlug) throw new Error("No slug");
      const res = await fetch(`/api/paragraph/publications/${encodeURIComponent(searchSlug)}/posts`);
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
    enabled: false,
  });

  const handleSearch = () => {
    if (publicationSlug.trim()) {
      setSearchSlug(publicationSlug.trim().replace(/^@/, ""));
      setSelectedPost(null);
    }
  };

  useEffect(() => {
    if (searchSlug) {
      refetch();
    }
  }, [searchSlug, refetch]);

  const handleSelectPost = (post: ParagraphPost) => {
    setSelectedPost(post);
  };

  const handleSubmit = () => {
    if (!selectedPost || !data?.publication) return;
    
    let excerpt: string | undefined;
    if (selectedPost.markdown) {
      excerpt = selectedPost.markdown.slice(0, 200).replace(/[#*_\[\]\n]+/g, ' ').trim() + '...';
    } else if (selectedPost.staticHtml) {
      const textContent = selectedPost.staticHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      excerpt = textContent.slice(0, 200).trim() + '...';
    } else if (selectedPost.subtitle) {
      excerpt = selectedPost.subtitle;
    }
    
    onSubmit({
      postId: selectedPost.id,
      title: selectedPost.title,
      subtitle: selectedPost.subtitle,
      imageUrl: selectedPost.imageUrl,
      publishedAt: selectedPost.publishedAt,
      slug: selectedPost.slug,
      publicationSlug: `@${data.publication.slug.replace(/^@/, '')}`,
      excerpt,
    });
    
    setSelectedPost(null);
    setPublicationSlug("");
    setSearchSlug("");
  };

  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <Input
            value={publicationSlug}
            onChange={(e) => setPublicationSlug(e.target.value)}
            placeholder="Publication slug (e.g., djzs or @djzs)"
            className="bg-muted border-border text-foreground"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            data-testid="input-publication-slug"
          />
        </div>
        <Button
          type="button"
          onClick={handleSearch}
          disabled={!publicationSlug.trim() || isLoading}
          className="bg-blue-600 hover:bg-blue-700"
          data-testid="button-search-publication"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </Button>
      </div>

      {error && (
        <div className="text-red-400 text-sm mb-4 p-3 bg-red-900/20 rounded-lg">
          Could not find publication. Check the slug and try again.
        </div>
      )}

      {data?.publication && (
        <div className="flex items-center gap-2 mb-3 p-2 bg-muted rounded-lg">
          {data.publication.logoUrl && (
            <img 
              src={data.publication.logoUrl} 
              alt={data.publication.name}
              className="w-8 h-8 rounded-full"
            />
          )}
          <div>
            <p className="text-foreground font-medium text-sm">{data.publication.name}</p>
            <p className="text-muted-foreground text-xs">@{data.publication.slug.replace(/^@/, '')}</p>
          </div>
        </div>
      )}

      {data?.posts && data.posts.length > 0 && (
        <ScrollArea className="h-60 mb-4">
          <div className="space-y-2 pr-3">
            {data.posts.map((post) => (
              <button
                key={post.id}
                onClick={() => handleSelectPost(post)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedPost?.id === post.id
                    ? "bg-blue-600/20 border border-blue-500"
                    : "bg-muted hover:bg-muted border border-transparent"
                }`}
                data-testid={`post-item-${post.id}`}
              >
                <div className="flex gap-3">
                  {post.imageUrl && (
                    <img 
                      src={post.imageUrl} 
                      alt={post.title}
                      className="w-16 h-12 rounded object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-foreground text-sm font-medium line-clamp-1">{post.title}</h4>
                    {post.subtitle && (
                      <p className="text-muted-foreground text-xs line-clamp-1 mt-0.5">{post.subtitle}</p>
                    )}
                    {post.publishedAt && (
                      <p className="text-muted-foreground text-xs mt-1">
                        {new Date(post.publishedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      )}

      {data?.posts && data.posts.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Newspaper className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No posts found in this publication</p>
        </div>
      )}

      {selectedPost && (
        <div className="mb-4 p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
          <div className="flex items-start gap-3">
            {selectedPost.imageUrl && (
              <img 
                src={selectedPost.imageUrl} 
                alt={selectedPost.title}
                className="w-20 h-14 rounded object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-foreground font-medium text-sm">{selectedPost.title}</h4>
              {selectedPost.subtitle && (
                <p className="text-muted-foreground text-xs mt-1">{selectedPost.subtitle}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={!selectedPost || isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700"
        data-testid="button-share-newsletter"
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Send className="w-4 h-4 mr-2" />
        )}
        Share Article
      </Button>
    </div>
  );
}
