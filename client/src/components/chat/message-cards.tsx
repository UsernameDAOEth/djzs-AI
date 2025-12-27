import { formatDistanceToNow } from "date-fns";
import { TrendingUp, TrendingDown, Target, AlertCircle, Calendar, DollarSign, Megaphone, ThumbsUp, ThumbsDown, CheckCircle, XCircle, Newspaper, ExternalLink, FileText, Receipt, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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

function CardHeader({ 
  type, 
  typeLabel, 
  typeColor, 
  authorAddress, 
  ensName, 
  timestamp,
  icon: Icon
}: { 
  type: string; 
  typeLabel: string; 
  typeColor: string; 
  authorAddress: string; 
  ensName?: string; 
  timestamp: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const displayName = ensName || formatAddress(authorAddress);
  const shortAddress = formatAddress(authorAddress);
  
  return (
    <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-700/50">
      <div className="flex items-center gap-2">
        <Badge className={`${typeColor} text-[10px] font-medium px-2 py-0.5 gap-1`}>
          <Icon className="w-3 h-3" />
          {typeLabel}
        </Badge>
        <span className="text-[10px] text-gray-500">•</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-sm">
              <span className="font-semibold text-white">{ensName || shortAddress}</span>
              {ensName && <span className="text-gray-500 ml-1 text-xs">({shortAddress})</span>}
            </span>
          </TooltipTrigger>
          <TooltipContent className="bg-gray-800 text-white border-gray-700">
            <p className="font-mono text-xs">{authorAddress}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <span className="text-[10px] text-gray-500">
        {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
      </span>
    </div>
  );
}

export function MessageCard({ message, ensNames }: MessageCardProps) {
  switch (message.type) {
    case "text":
      return <NoteCard message={message} ensNames={ensNames} />;
    case "trade_signal":
      return <SignalCard message={message} ensNames={ensNames} />;
    case "prediction":
      return <PredictionCardComponent message={message} ensNames={ensNames} />;
    case "event":
      return <EventCardComponent message={message} ensNames={ensNames} />;
    case "payment_receipt":
      return <ReceiptCard message={message} ensNames={ensNames} />;
    case "announcement":
      return <AnnouncementCardComponent message={message} ensNames={ensNames} />;
    case "newsletter":
      return <ArticleCard message={message} ensNames={ensNames} />;
    default:
      return null;
  }
}

function NoteCard({ message, ensNames }: { message: TextMessage; ensNames?: Record<string, string> }) {
  const displayName = ensNames?.[message.authorAddress] || formatAddress(message.authorAddress);
  
  return (
    <div className="zone-card bg-gray-900/80 rounded-xl border border-gray-800 p-4 my-2 hover:border-gray-700">
      <CardHeader 
        type="note"
        typeLabel="Note"
        typeColor="bg-gray-700 text-gray-300"
        authorAddress={message.authorAddress}
        ensName={ensNames?.[message.authorAddress]}
        timestamp={message.createdAt}
        icon={FileText}
      />
      <p className="text-gray-200 text-sm leading-relaxed">{message.content}</p>
    </div>
  );
}

function SignalCard({ message, ensNames }: { message: TradeSignalCard; ensNames?: Record<string, string> }) {
  const isLong = message.direction === "long";
  
  return (
    <div className={`zone-card bg-gray-900/80 rounded-xl border p-4 my-2 ${isLong ? 'border-green-600/30 hover:border-green-500/50' : 'border-red-600/30 hover:border-red-500/50'}`}>
      <CardHeader 
        type="signal"
        typeLabel="Signal"
        typeColor={isLong ? "bg-green-600 text-white" : "bg-red-600 text-white"}
        authorAddress={message.authorAddress}
        ensName={ensNames?.[message.authorAddress]}
        timestamp={message.createdAt}
        icon={TrendingUp}
      />
      
      <div className="flex items-center gap-3 mb-4">
        {isLong ? (
          <TrendingUp className="w-6 h-6 text-green-400" />
        ) : (
          <TrendingDown className="w-6 h-6 text-red-400" />
        )}
        <span className="font-bold text-white text-xl">{message.asset}</span>
        <Badge variant={isLong ? "default" : "destructive"} className={`${isLong ? "bg-green-600" : ""} text-sm`}>
          {message.direction.toUpperCase()}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm mb-4 bg-gray-800/50 rounded-lg p-3">
        <div>
          <p className="text-gray-500 text-xs mb-1">Entry</p>
          <p className="text-white font-mono font-medium">{message.entry}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs mb-1">Invalidation</p>
          <p className="text-red-400 font-mono font-medium">{message.invalidation}</p>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-gray-500 text-xs mb-2">Take Profit Targets</p>
        <div className="flex flex-wrap gap-2">
          {message.tp.map((target, idx) => (
            <Badge key={idx} variant="outline" className="border-green-400/30 text-green-400 bg-green-400/5">
              <Target className="w-3 h-3 mr-1" />
              TP{idx + 1}: {target}
            </Badge>
          ))}
        </div>
      </div>
      
      {(message.timeframe || message.leverage) && (
        <div className="flex gap-4 text-xs text-gray-400 mb-3 bg-gray-800/30 rounded-md px-3 py-2">
          {message.timeframe && <span>Timeframe: <span className="text-white">{message.timeframe}</span></span>}
          {message.leverage && <span>Leverage: <span className="text-white">{message.leverage}x</span></span>}
        </div>
      )}
      
      {message.notes && (
        <p className="text-gray-400 text-sm italic border-l-2 border-gray-700 pl-3 mt-3">{message.notes}</p>
      )}
    </div>
  );
}

function PredictionCardComponent({ message, ensNames }: { message: PredictionCard; ensNames?: Record<string, string> }) {
  const endsAt = new Date(message.endsAt);
  const isEnded = endsAt < new Date();
  
  return (
    <div className="zone-card bg-gray-900/80 rounded-xl border border-blue-600/30 hover:border-blue-500/50 p-4 my-2">
      <CardHeader 
        type="prediction"
        typeLabel="Prediction"
        typeColor="bg-blue-600 text-white"
        authorAddress={message.authorAddress}
        ensName={ensNames?.[message.authorAddress]}
        timestamp={message.createdAt}
        icon={BarChart3}
      />
      
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="w-4 h-4 text-blue-400" />
        <span className="text-xs text-gray-400">
          {isEnded ? "Voting ended" : `Ends ${formatDistanceToNow(endsAt, { addSuffix: true })}`}
        </span>
      </div>
      
      <h3 className="text-white font-semibold text-lg mb-4">{message.question}</h3>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Button 
          variant="outline" 
          className="border-green-400/50 text-green-400 hover:bg-green-400/10 h-12"
          disabled={isEnded}
        >
          <ThumbsUp className="w-4 h-4 mr-2" />
          YES
        </Button>
        <Button 
          variant="outline" 
          className="border-red-400/50 text-red-400 hover:bg-red-400/10 h-12"
          disabled={isEnded}
        >
          <ThumbsDown className="w-4 h-4 mr-2" />
          NO
        </Button>
      </div>
      
      {message.notes && (
        <p className="text-gray-400 text-sm">{message.notes}</p>
      )}
    </div>
  );
}

function EventCardComponent({ message, ensNames }: { message: EventCard; ensNames?: Record<string, string> }) {
  const startsAt = new Date(message.startsAt);
  const isPast = startsAt < new Date();
  
  return (
    <div className="zone-card bg-gray-900/80 rounded-xl border border-orange-600/30 hover:border-orange-500/50 p-4 my-2">
      <CardHeader 
        type="event"
        typeLabel="Event"
        typeColor="bg-orange-600 text-white"
        authorAddress={message.authorAddress}
        ensName={ensNames?.[message.authorAddress]}
        timestamp={message.createdAt}
        icon={Calendar}
      />
      
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-lg bg-orange-600/20 flex items-center justify-center flex-shrink-0">
          <Calendar className="w-6 h-6 text-orange-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-lg">{message.title}</h3>
          <p className="text-sm text-gray-400">
            {startsAt.toLocaleDateString()} at {startsAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
      
      {message.locationOrLink && (
        <p className="text-sm text-blue-400 mb-3 flex items-center gap-1">
          <span>📍</span> {message.locationOrLink}
        </p>
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
          <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
            Maybe
          </Button>
          <Button size="sm" variant="ghost" className="text-gray-400">
            <XCircle className="w-3 h-3 mr-1" />
            Can't
          </Button>
        </div>
      )}
    </div>
  );
}

function ReceiptCard({ message, ensNames }: { message: PaymentReceiptCard; ensNames?: Record<string, string> }) {
  const displayName = ensNames?.[message.authorAddress] || formatAddress(message.authorAddress);
  const toName = ensNames?.[message.to] || formatAddress(message.to);
  
  return (
    <div className="zone-card bg-gray-900/80 rounded-xl border border-emerald-600/30 hover:border-emerald-500/50 p-4 my-2">
      <CardHeader 
        type="receipt"
        typeLabel="Receipt"
        typeColor="bg-emerald-600 text-white"
        authorAddress={message.authorAddress}
        ensName={ensNames?.[message.authorAddress]}
        timestamp={message.createdAt}
        icon={Receipt}
      />
      
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-emerald-600/20 flex items-center justify-center">
          <DollarSign className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <p className="text-xs text-gray-400">Payment Sent</p>
          <p className="text-2xl font-bold text-emerald-400">
            {message.amount} {message.tokenSymbol}
          </p>
        </div>
      </div>
      
      <div className="text-sm text-gray-400 space-y-1.5 mb-4 bg-gray-800/30 rounded-lg p-3">
        <p>From: <span className="text-white font-medium">{displayName}</span></p>
        <p>To: <span className="text-white font-medium">{toName}</span></p>
      </div>
      
      {message.note && (
        <p className="text-gray-300 text-sm italic mb-4 border-l-2 border-gray-700 pl-3">"{message.note}"</p>
      )}
      
      <a 
        href={`https://basescan.org/tx/${message.txHash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
      >
        <ExternalLink className="w-3 h-3" />
        View on Basescan
      </a>
    </div>
  );
}

function AnnouncementCardComponent({ message, ensNames }: { message: AnnouncementCard; ensNames?: Record<string, string> }) {
  const priorityColors = {
    low: "border-gray-600",
    med: "border-yellow-600/50",
    high: "border-red-600",
  };
  
  return (
    <div className={`bg-gray-900/80 rounded-xl border-2 ${priorityColors[message.priority]} p-4 my-2`}>
      <CardHeader 
        type="announcement"
        typeLabel="Announcement"
        typeColor={message.priority === "high" ? "bg-red-600 text-white" : "bg-yellow-600 text-white"}
        authorAddress={message.authorAddress}
        ensName={ensNames?.[message.authorAddress]}
        timestamp={message.createdAt}
        icon={Megaphone}
      />
      
      <h3 className="text-white font-bold text-lg mb-2">{message.title}</h3>
      <p className="text-gray-300">{message.body}</p>
    </div>
  );
}

function ArticleCard({ message, ensNames }: { message: NewsletterArticle; ensNames?: Record<string, string> }) {
  const pubSlug = message.publicationSlug.startsWith('@') ? message.publicationSlug : `@${message.publicationSlug}`;
  const articleUrl = `https://paragraph.com/${pubSlug}/${message.slug}`;
  
  return (
    <div className="zone-card bg-gray-900/80 rounded-xl border border-indigo-600/30 hover:border-indigo-500/50 p-4 my-2 overflow-hidden" data-testid={`card-article-${message.id}`}>
      <CardHeader 
        type="article"
        typeLabel="Article"
        typeColor="bg-indigo-600 text-white"
        authorAddress={message.authorAddress}
        ensName={ensNames?.[message.authorAddress]}
        timestamp={message.createdAt}
        icon={Newspaper}
      />
      
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center">
          <Newspaper className="w-4 h-4 text-indigo-400" />
        </div>
        <p className="text-sm text-indigo-400 font-medium">{message.publicationSlug}</p>
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
      
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-800">
        <a 
          href={articleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
          data-testid={`link-article-${message.id}`}
        >
          <ExternalLink className="w-4 h-4" />
          Read Article
        </a>
        {message.publishedAt && (
          <span className="text-xs text-gray-500">
            Published {formatDistanceToNow(new Date(message.publishedAt), { addSuffix: true })}
          </span>
        )}
      </div>
    </div>
  );
}

export { NoteCard, SignalCard, PredictionCardComponent, EventCardComponent, ReceiptCard, AnnouncementCardComponent, ArticleCard };
