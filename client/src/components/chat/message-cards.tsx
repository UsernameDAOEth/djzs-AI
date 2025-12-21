import { formatDistanceToNow } from "date-fns";
import { TrendingUp, TrendingDown, Target, AlertCircle, Calendar, DollarSign, Megaphone, ThumbsUp, ThumbsDown, CheckCircle, XCircle, Newspaper, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { 
  TradeSignalCard, 
  PredictionCard, 
  EventCard, 
  PaymentReceiptCard, 
  AnnouncementCard,
  NewsletterArticle,
  TextMessage,
  ChatMessage 
} from "@shared/schema";
import { formatAddress } from "@/hooks/use-ens";

interface MessageCardProps {
  message: ChatMessage;
  ensNames?: Record<string, string>;
}

export function MessageCard({ message, ensNames }: MessageCardProps) {
  switch (message.type) {
    case "text":
      return <TextMessageCard message={message} ensNames={ensNames} />;
    case "trade_signal":
      return <TradeSignalCardComponent message={message} ensNames={ensNames} />;
    case "prediction":
      return <PredictionCardComponent message={message} ensNames={ensNames} />;
    case "event":
      return <EventCardComponent message={message} ensNames={ensNames} />;
    case "payment_receipt":
      return <PaymentReceiptCardComponent message={message} ensNames={ensNames} />;
    case "announcement":
      return <AnnouncementCardComponent message={message} ensNames={ensNames} />;
    case "newsletter":
      return <NewsletterArticleCardComponent message={message} ensNames={ensNames} />;
    default:
      return null;
  }
}

function TextMessageCard({ message, ensNames }: { message: TextMessage; ensNames?: Record<string, string> }) {
  const displayName = ensNames?.[message.authorAddress] || formatAddress(message.authorAddress);
  
  return (
    <div className="flex gap-3 py-2 group">
      <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center text-sm text-purple-400">
        {displayName.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-white">{displayName}</span>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          </span>
        </div>
        <p className="text-gray-300 text-sm mt-0.5 break-words">{message.content}</p>
      </div>
    </div>
  );
}

function TradeSignalCardComponent({ message, ensNames }: { message: TradeSignalCard; ensNames?: Record<string, string> }) {
  const displayName = ensNames?.[message.authorAddress] || formatAddress(message.authorAddress);
  const isLong = message.direction === "long";
  
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 my-2">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isLong ? (
            <TrendingUp className="w-5 h-5 text-green-400" />
          ) : (
            <TrendingDown className="w-5 h-5 text-red-400" />
          )}
          <span className="font-bold text-white text-lg">{message.asset}</span>
          <Badge variant={isLong ? "default" : "destructive"} className={isLong ? "bg-green-600" : ""}>
            {message.direction.toUpperCase()}
          </Badge>
        </div>
        <span className="text-xs text-gray-500">
          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
        <div>
          <p className="text-gray-500">Entry</p>
          <p className="text-white font-mono">{message.entry}</p>
        </div>
        <div>
          <p className="text-gray-500">Invalidation</p>
          <p className="text-red-400 font-mono">{message.invalidation}</p>
        </div>
      </div>
      
      <div className="mb-3">
        <p className="text-gray-500 text-sm mb-1">Take Profit Targets</p>
        <div className="flex flex-wrap gap-2">
          {message.tp.map((target, idx) => (
            <Badge key={idx} variant="outline" className="border-green-400/30 text-green-400">
              <Target className="w-3 h-3 mr-1" />
              TP{idx + 1}: {target}
            </Badge>
          ))}
        </div>
      </div>
      
      {(message.timeframe || message.leverage) && (
        <div className="flex gap-4 text-xs text-gray-400 mb-2">
          {message.timeframe && <span>Timeframe: {message.timeframe}</span>}
          {message.leverage && <span>Leverage: {message.leverage}x</span>}
        </div>
      )}
      
      {message.notes && (
        <p className="text-gray-400 text-sm italic border-l-2 border-gray-700 pl-3">{message.notes}</p>
      )}
      
      <div className="mt-3 pt-3 border-t border-gray-800 text-xs text-gray-500">
        Posted by {displayName}
      </div>
    </div>
  );
}

function PredictionCardComponent({ message, ensNames }: { message: PredictionCard; ensNames?: Record<string, string> }) {
  const displayName = ensNames?.[message.authorAddress] || formatAddress(message.authorAddress);
  const endsAt = new Date(message.endsAt);
  const isEnded = endsAt < new Date();
  
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 my-2">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-400" />
          <span className="text-xs text-gray-500">
            {isEnded ? "Ended" : `Ends ${formatDistanceToNow(endsAt, { addSuffix: true })}`}
          </span>
        </div>
      </div>
      
      <h3 className="text-white font-semibold mb-4">{message.question}</h3>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Button 
          variant="outline" 
          className="border-green-400/50 text-green-400 hover:bg-green-400/10 h-auto py-3"
          disabled={isEnded}
        >
          <ThumbsUp className="w-4 h-4 mr-2" />
          YES
        </Button>
        <Button 
          variant="outline" 
          className="border-red-400/50 text-red-400 hover:bg-red-400/10 h-auto py-3"
          disabled={isEnded}
        >
          <ThumbsDown className="w-4 h-4 mr-2" />
          NO
        </Button>
      </div>
      
      {message.notes && (
        <p className="text-gray-400 text-sm mb-3">{message.notes}</p>
      )}
      
      <div className="mt-3 pt-3 border-t border-gray-800 text-xs text-gray-500">
        Posted by {displayName}
      </div>
    </div>
  );
}

function EventCardComponent({ message, ensNames }: { message: EventCard; ensNames?: Record<string, string> }) {
  const displayName = ensNames?.[message.authorAddress] || formatAddress(message.authorAddress);
  const startsAt = new Date(message.startsAt);
  const isPast = startsAt < new Date();
  
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 my-2">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-purple-600/30 flex items-center justify-center">
          <Calendar className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold">{message.title}</h3>
          <p className="text-sm text-gray-400">
            {startsAt.toLocaleDateString()} at {startsAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
      
      {message.locationOrLink && (
        <p className="text-sm text-blue-400 mb-3">📍 {message.locationOrLink}</p>
      )}
      
      {message.description && (
        <p className="text-gray-400 text-sm mb-4">{message.description}</p>
      )}
      
      {!isPast && (
        <div className="flex gap-2">
          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="w-3 h-3 mr-1" />
            Going
          </Button>
          <Button size="sm" variant="outline" className="border-gray-600">
            Maybe
          </Button>
          <Button size="sm" variant="ghost" className="text-gray-400">
            <XCircle className="w-3 h-3 mr-1" />
            Can't
          </Button>
        </div>
      )}
      
      <div className="mt-3 pt-3 border-t border-gray-800 text-xs text-gray-500">
        Posted by {displayName}
      </div>
    </div>
  );
}

function PaymentReceiptCardComponent({ message, ensNames }: { message: PaymentReceiptCard; ensNames?: Record<string, string> }) {
  const displayName = ensNames?.[message.authorAddress] || formatAddress(message.authorAddress);
  const toName = ensNames?.[message.to] || formatAddress(message.to);
  
  return (
    <div className="bg-gray-900 rounded-xl border border-green-600/30 p-4 my-2">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-green-600/30 flex items-center justify-center">
          <DollarSign className="w-4 h-4 text-green-400" />
        </div>
        <div>
          <p className="text-sm text-gray-400">Payment Sent</p>
          <p className="text-lg font-bold text-green-400">
            {message.amount} {message.tokenSymbol}
          </p>
        </div>
      </div>
      
      <div className="text-sm text-gray-400 space-y-1 mb-3">
        <p>From: <span className="text-white">{displayName}</span></p>
        <p>To: <span className="text-white">{toName}</span></p>
      </div>
      
      {message.note && (
        <p className="text-gray-300 text-sm italic mb-3">"{message.note}"</p>
      )}
      
      <a 
        href={`https://basescan.org/tx/${message.txHash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-blue-400 hover:underline"
      >
        View on Basescan →
      </a>
    </div>
  );
}

function AnnouncementCardComponent({ message, ensNames }: { message: AnnouncementCard; ensNames?: Record<string, string> }) {
  const displayName = ensNames?.[message.authorAddress] || formatAddress(message.authorAddress);
  const priorityColors = {
    low: "border-gray-600",
    med: "border-yellow-600/50",
    high: "border-red-600",
  };
  
  return (
    <div className={`bg-gray-900 rounded-xl border-2 ${priorityColors[message.priority]} p-4 my-2`}>
      <div className="flex items-center gap-2 mb-2">
        <Megaphone className="w-5 h-5 text-yellow-400" />
        <Badge variant={message.priority === "high" ? "destructive" : "secondary"}>
          {message.priority.toUpperCase()}
        </Badge>
      </div>
      
      <h3 className="text-white font-bold text-lg mb-2">{message.title}</h3>
      <p className="text-gray-300">{message.body}</p>
      
      <div className="mt-3 pt-3 border-t border-gray-800 text-xs text-gray-500">
        Posted by {displayName} • {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
      </div>
    </div>
  );
}

function NewsletterArticleCardComponent({ message, ensNames }: { message: NewsletterArticle; ensNames?: Record<string, string> }) {
  const displayName = ensNames?.[message.authorAddress] || formatAddress(message.authorAddress);
  const pubSlug = message.publicationSlug.startsWith('@') ? message.publicationSlug : `@${message.publicationSlug}`;
  const articleUrl = `https://paragraph.com/${pubSlug}/${message.slug}`;
  
  return (
    <div className="bg-gray-900 rounded-xl border border-blue-600/30 p-4 my-2 overflow-hidden" data-testid={`card-newsletter-${message.id}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-blue-600/30 flex items-center justify-center">
          <Newspaper className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <p className="text-xs text-gray-400">Newsletter Article</p>
          <p className="text-sm text-blue-400">{message.publicationSlug}</p>
        </div>
      </div>
      
      {message.imageUrl && (
        <div className="relative w-full h-40 mb-3 rounded-lg overflow-hidden">
          <img 
            src={message.imageUrl} 
            alt={message.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">{message.title}</h3>
      
      {message.subtitle && !message.excerpt && (
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{message.subtitle}</p>
      )}
      
      {message.excerpt && (
        <p className="text-gray-500 text-sm mb-3 line-clamp-3">{message.excerpt}</p>
      )}
      
      <div className="flex items-center justify-between mt-3">
        <a 
          href={articleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          data-testid={`link-newsletter-${message.id}`}
        >
          <ExternalLink className="w-4 h-4" />
          Read Article
        </a>
        {message.publishedAt && (
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(message.publishedAt), { addSuffix: true })}
          </span>
        )}
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-800 text-xs text-gray-500">
        Shared by {displayName} • {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
      </div>
    </div>
  );
}

export { TextMessageCard, TradeSignalCardComponent, PredictionCardComponent, EventCardComponent, PaymentReceiptCardComponent, AnnouncementCardComponent, NewsletterArticleCardComponent };
