'use client';

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MoreHorizontal, 
  Heart, 
  MessageCircle, 
  Share2, 
  Store, 
  ShieldCheck, 
  X, 
  Send,
  Flag,
  CheckCircle2,
  Sparkles,
  Zap
} from 'lucide-react';
import { Product } from '@/lib/products-data';
import Image from 'next/image';

interface LocalVideoFeedProps {
  products: Product[];
  onOpenProduct: (product: Product) => void;
  onMakeOffer: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onBack?: () => void;
}

interface CommentItem {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
}

export const LocalVideoFeed: React.FC<LocalVideoFeedProps> = ({
  products,
  onOpenProduct,
  onMakeOffer,
  onAddToCart,
  onBack
}) => {
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [expandedCaptions, setExpandedCaptions] = useState<Set<string>>(new Set());
  const [showMenu, setShowMenu] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  
  // Comments Drawer State
  const [activeCommentReel, setActiveCommentReel] = useState<string | null>(null);
  const [commentsList, setCommentsList] = useState<CommentItem[]>([
    { id: '1', user: 'aanya_v', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80', text: 'Is this available in size M? 🔥', time: '2h ago', likes: 14 },
    { id: '2', user: 'rahul_mumbai', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80', text: 'Fabric quality looks insanely good!', time: '4h ago', likes: 8 },
    { id: '3', user: 'priya_style', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80', text: 'Just placed order for this shirt! Can’t wait 😍', time: '5h ago', likes: 21 },
  ]);
  const [newComment, setNewComment] = useState('');

  const toggleLike = (id: string) => {
    setLikedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const toggleCaptionExpand = (id: string) => {
    setExpandedCaptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleShare = () => {
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2000);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const item: CommentItem = {
      id: Date.now().toString(),
      user: 'you_fashion',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
      text: newComment.trim(),
      time: 'Just now',
      likes: 0
    };
    setCommentsList([item, ...commentsList]);
    setNewComment('');
  };

  // High quality fashion reel data mapping to products
  const reels = products.map((prod, index) => {
    const reelImages = [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80', // Yellow hoodie model
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80', // Fashion model coat
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80', // Suit jacket
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&q=80', // Outfit model
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&q=80', // Streetwear model
      'https://images.unsplash.com/photo-1550614000-4b95d466f228?w=800&q=80', // Casual look
    ];

    return {
      id: `reel-${prod.id}`,
      product: prod,
      reelImage: reelImages[index % reelImages.length],
      likesCount: (24.5 + index * 3.2).toFixed(1) + 'K',
      commentsCount: (1.2 + index * 0.4).toFixed(1) + 'K',
      mainCaption: `New drop is live! 🌟 Check out our latest collection. Tap to buy 👇`,
      hashtags: `#fashion #newarrivals #${prod.category.toLowerCase()}`
    };
  });

  return (
    <div className="fixed inset-0 z-40 bg-black flex flex-col font-sans max-w-lg mx-auto">
      {/* Top Bar Header (100% Transparent & Shifted Slightly Down) */}
      <div className="absolute top-2.5 left-0 right-0 z-50 pt-[env(safe-area-inset-top)] px-3.5 py-1 flex items-center justify-between pointer-events-auto bg-transparent">
        <button 
          onClick={onBack}
          className="w-8.5 h-8.5 rounded-full bg-black/25 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-95 transition-transform cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
        </button>

        <h1 className="text-base font-bold text-white tracking-wide drop-shadow-lg">
          Drops
        </h1>

        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="w-8.5 h-8.5 rounded-full bg-black/25 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-95 transition-transform cursor-pointer shadow-md"
          >
            <MoreHorizontal className="w-4.5 h-4.5" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
              <div className="absolute top-full right-0 mt-2 w-42 bg-neutral-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 py-1.5 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <button 
                  onClick={() => {
                    setShowMenu(false);
                    handleShare();
                  }}
                  className="w-full px-3.5 py-2.5 text-left text-xs font-bold text-white hover:bg-white/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-white" /> Share Drop
                </button>
                <button 
                  onClick={() => {
                    setShowMenu(false);
                    alert('Reel reported to moderation team');
                  }}
                  className="w-full px-3.5 py-2.5 text-left text-xs font-bold text-red-400 hover:bg-white/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Flag className="w-4 h-4 text-red-400" /> Report Drop
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Share Toast */}
      {showShareToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-neutral-900/95 text-white text-xs font-bold px-4 py-2 rounded-full border border-white/20 shadow-xl flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Reel link copied to clipboard!
        </div>
      )}

      {/* Snap Scroll Fullscreen Reel Feed */}
      <div className="flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-none pb-[52px]">
        {reels.map((reel) => {
          const isLiked = likedItems.has(reel.id);
          const isExpanded = expandedCaptions.has(reel.id);
          const prod = reel.product;

          return (
            <div 
              key={reel.id} 
              className="w-full h-[100dvh] snap-start snap-always relative bg-neutral-950 overflow-hidden flex flex-col justify-between"
            >
              {/* Fullscreen Video/Photo Background */}
              <div className="absolute inset-0">
                <Image 
                  src={reel.reelImage} 
                  alt={prod.name} 
                  fill 
                  priority
                  className="object-cover object-center"
                />
                {/* Subtle vignette for crisp text legibility */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent via-40% to-black/80 pointer-events-none"></div>
              </div>

              {/* Right Vertical Action Buttons (z-50 with pointer-events-auto) */}
              <div className="absolute right-3 bottom-44 z-50 flex flex-col items-center gap-4 pointer-events-auto">
                {/* Like Button */}
                <button 
                  onClick={() => toggleLike(reel.id)}
                  className="flex flex-col items-center gap-1 group active:scale-90 transition-transform cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg group-hover:bg-black/50 transition-colors">
                    <Heart className={`w-5 h-5 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                  </div>
                  <span className="text-[11px] font-bold text-white drop-shadow-lg">
                    {isLiked ? '24.6K' : reel.likesCount}
                  </span>
                </button>

                {/* Comment Button */}
                <button 
                  onClick={() => setActiveCommentReel(reel.id)}
                  className="flex flex-col items-center gap-1 group active:scale-90 transition-transform cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg group-hover:bg-black/50 transition-colors">
                    <MessageCircle className="w-5 h-5 text-white fill-white" />
                  </div>
                  <span className="text-[11px] font-bold text-white drop-shadow-lg">
                    {reel.commentsCount}
                  </span>
                </button>

                {/* Share Button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleShare();
                  }}
                  className="flex flex-col items-center gap-1 group active:scale-90 transition-transform cursor-pointer"
                  aria-label="Share"
                >
                  <div className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg group-hover:bg-black/50 transition-colors">
                    <Share2 className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[11px] font-bold text-white drop-shadow-lg">
                    Share
                  </span>
                </button>
              </div>

              {/* Bottom Metadata & Embedded Floating Buy Card (pointer-events-none on parent, auto on children) */}
              <div className="absolute left-0 bottom-[52px] right-0 z-40 p-3 pt-4 bg-transparent pointer-events-none">
                {/* Store Name Row */}
                <div className="flex items-center gap-2 mb-1.5 pointer-events-auto">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[1.5px] shadow-sm shrink-0">
                    <div className="w-full h-full rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20">
                      <Store className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                  <span className="text-white font-bold text-sm drop-shadow-lg flex items-center gap-1.5 tracking-tight">
                    {prod.shop?.name || 'The Thrift Garage'}
                    {prod.shop?.verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                  </span>
                </div>

                {/* Caption Description (Slightly Larger & Transparent with Instagram ...more) */}
                <div className="mb-2.5 max-w-[82%] pointer-events-auto">
                  <p className="text-white/95 text-xs font-medium leading-relaxed drop-shadow-lg">
                    {reel.mainCaption}{' '}
                    {isExpanded ? (
                      <span className="block mt-1 text-blue-300 font-semibold">
                        {reel.hashtags}
                      </span>
                    ) : null}
                    <button 
                      onClick={() => toggleCaptionExpand(reel.id)}
                      className="text-neutral-300 hover:text-white font-bold ml-1 cursor-pointer underline decoration-neutral-400/50"
                    >
                      {isExpanded ? 'less' : '...more'}
                    </button>
                  </p>
                </div>

                {/* Compact Floating Product Buy Card (Attached Right Above Bottom Nav) */}
                <div 
                  onClick={() => onOpenProduct(prod)}
                  className="w-full bg-black/35 backdrop-blur-xl rounded-2xl p-2.5 flex items-center justify-between gap-2.5 border border-white/20 shadow-2xl cursor-pointer hover:bg-black/50 active:scale-[0.99] transition-all pointer-events-auto"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl overflow-hidden relative shrink-0 bg-neutral-800 border border-white/15 shadow-inner">
                      <Image 
                        src={prod.thumbnail} 
                        alt={prod.name} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-white text-xs font-bold truncate drop-shadow-md uppercase tracking-tight">
                        {prod.name}
                      </h4>
                      <span className="text-emerald-400 font-extrabold text-xs drop-shadow-md block mt-0.5">
                        ₹{prod.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenProduct(prod);
                    }}
                    className="px-4 py-2 bg-white text-neutral-900 font-extrabold text-xs rounded-xl shadow-md hover:bg-neutral-100 active:scale-95 transition-all shrink-0 cursor-pointer"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Comments Bottom Sheet */}
      {activeCommentReel && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center font-sans animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setActiveCommentReel(null)}></div>
          
          <div className="relative w-full max-w-lg bg-neutral-900 rounded-t-3xl p-4 z-10 text-white shadow-2xl border-t border-white/10 max-h-[70vh] flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Grab Bar */}
            <div className="w-12 h-1 bg-neutral-700 rounded-full mx-auto mb-3"></div>

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                Comments ({commentsList.length})
              </h3>
              <button 
                onClick={() => setActiveCommentReel(null)}
                className="p-1 text-neutral-400 hover:text-white rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 no-scrollbar mb-3">
              {commentsList.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden relative shrink-0 bg-neutral-800">
                    <Image src={item.avatar} alt={item.user} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-200">@{item.user}</span>
                      <span className="text-[10px] text-neutral-500 font-medium">{item.time}</span>
                    </div>
                    <p className="text-xs text-neutral-300 mt-0.5 leading-snug">{item.text}</p>
                  </div>
                  <button className="flex items-center gap-1 text-[10px] text-neutral-500 hover:text-red-400 transition-colors pt-1 cursor-pointer">
                    <Heart className="w-3.5 h-3.5" />
                    {item.likes > 0 && item.likes}
                  </button>
                </div>
              ))}
            </div>

            {/* Add Comment Bar */}
            <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-2 border-t border-neutral-800">
              <input 
                type="text" 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-neutral-800 text-white placeholder-neutral-500 text-xs px-3.5 py-2.5 rounded-full border border-neutral-700 focus:outline-none focus:border-emerald-500 transition-all"
              />
              <button 
                type="submit"
                disabled={!newComment.trim()}
                className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-600 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
