import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  FlatList,
  Share,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useCartStore } from '../cart/cartStore';
import { typography } from '../../theme/typography';
import { formatINR } from '../../utils/formatters';

interface ReelItem {
  id: string;
  boutiqueName: string;
  boutiqueHandle: string;
  caption: string;
  videoImage: string;
  productTitle: string;
  productPrice: number;
  productImage: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
}

const REELS_DATA: ReelItem[] = [
  {
    id: 'reel_1',
    boutiqueName: 'Mitreno.com',
    boutiqueHandle: '@mitreno.official',
    caption: 'New drop is live! 🌟 Check out our latest collection. Tap to buy 👇',
    videoImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&auto=format&fit=crop&q=80',
    productTitle: 'OVERSIZED STREETWEAR HOODIE',
    productPrice: 2499,
    productImage: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=80',
    likes: 24500,
    comments: 1200,
    isLiked: false,
  },
  {
    id: 'reel_2',
    boutiqueName: 'Vintage Vault',
    boutiqueHandle: '@vintagevault.jewels',
    caption: 'Handcrafted 925 Sterling Silver with sapphire gemstones. Limited to 15 pieces! ✨',
    videoImage: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900&auto=format&fit=crop&q=80',
    productTitle: 'CHISELED STERLING 925 EARRINGS',
    productPrice: 1999,
    productImage: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&auto=format&fit=crop&q=80',
    likes: 18200,
    comments: 840,
    isLiked: true,
  },
  {
    id: 'reel_3',
    boutiqueName: 'The Thrift Garage',
    boutiqueHandle: '@thethriftgarage.in',
    caption: 'Pure Lucknowi Chikankari weave on organic mulmul cotton. Summer drop edition 🌿',
    videoImage: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=900&auto=format&fit=crop&q=80',
    productTitle: 'HANDCRAFTED CHIKANKARI KURTA',
    productPrice: 3500,
    productImage: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=500&auto=format&fit=crop&q=80',
    likes: 31000,
    comments: 2400,
    isLiked: false,
  },
];

export const DropsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { height, width } = useWindowDimensions();
  const { addItem } = useCartStore();

  const [reels, setReels] = useState<ReelItem[]>(REELS_DATA);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [activeReel, setActiveReel] = useState<ReelItem | null>(null);
  const [commentText, setCommentText] = useState('');
  const [sampleComments, setSampleComments] = useState<string[]>([
    '🔥 Insane silhouette and drop quality!',
    'Is cash on delivery available for this?',
    'Already copped the oversized hoodie, looks amazing!',
  ]);

  // Tab bar height compensation so reel fills the visible area
  const reelHeight = height - (Platform.OS === 'ios' ? 84 : 64);

  const toggleLike = (id: string) => {
    setReels((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const newLiked = !r.isLiked;
          return {
            ...r,
            isLiked: newLiked,
            likes: newLiked ? r.likes + 1 : r.likes - 1,
          };
        }
        return r;
      })
    );
  };

  const handleShare = async (reel: ReelItem) => {
    try {
      await Share.share({
        message: `Check out ${reel.productTitle} from ${reel.boutiqueName} on Mitreno Drops! Available now at ${formatINR(reel.productPrice)}.`,
      });
    } catch {
      // Ignore dismiss
    }
  };

  const handleBuyNow = (reel: ReelItem) => {
    addItem({
      id: reel.id,
      name: reel.productTitle,
      price: reel.productPrice,
      image: reel.productImage,
      quantity: 1,
      unitLabel: '1 PC',
    });
    Alert.alert(
      'Added to Bag! 🛍️',
      `${reel.productTitle} by ${reel.boutiqueName} has been added to your shopping bag.`,
      [
        { text: 'Keep Watching', style: 'cancel' },
        { text: 'View Bag', onPress: () => navigation.navigate('BagTab') },
      ]
    );
  };

  const openComments = (reel: ReelItem) => {
    setActiveReel(reel);
    setCommentModalVisible(true);
  };

  const postComment = () => {
    if (commentText.trim().length === 0) return;
    setSampleComments([commentText.trim(), ...sampleComments]);
    setCommentText('');
  };

  const renderReel = ({ item }: { item: ReelItem }) => {
    return (
      <View style={[styles.reelContainer, { height: reelHeight, width }]}>
        {/* Fullscreen Video / Image Background */}
        <FastImage
          source={{ uri: item.videoImage }}
          style={styles.fullMedia as any}
          resizeMode={FastImage.resizeMode.cover}
        />

        {/* Gradient dark overlay for text readability */}
        <View style={styles.vignetteOverlay} />

        {/* Top Header Overlay */}
        <View style={[styles.topHeader, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
          <TouchableOpacity
            style={styles.headerCircleBtn}
            onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('ExploreTab')}
            activeOpacity={0.8}
          >
            <Icon name="arrow-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.topTitle}>Drops</Text>

          <TouchableOpacity style={styles.headerCircleBtn} activeOpacity={0.8}>
            <Icon name="dots-horizontal" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Right Action Bar (Heart/Like, Comment, Share) */}
        <View style={styles.rightActionsBar}>
          {/* Like Button */}
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => toggleLike(item.id)}
            activeOpacity={0.8}
          >
            <View style={styles.actionIconCircle}>
              <Icon
                name={item.isLiked ? 'heart' : 'heart-outline'}
                size={26}
                color={item.isLiked ? '#EF4444' : '#FFFFFF'}
              />
            </View>
            <Text style={styles.actionCount}>
              {(item.likes / 1000).toFixed(1)}K
            </Text>
          </TouchableOpacity>

          {/* Comment Button */}
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => openComments(item)}
            activeOpacity={0.8}
          >
            <View style={styles.actionIconCircle}>
              <Icon name="comment" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionCount}>
              {(item.comments / 1000).toFixed(1)}K
            </Text>
          </TouchableOpacity>

          {/* Share Button */}
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => handleShare(item)}
            activeOpacity={0.8}
          >
            <View style={styles.actionIconCircle}>
              <Icon name="share-variant" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionCount}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Content Area */}
        <View style={styles.bottomContentArea}>
          {/* Boutique Profile Info & Caption */}
          <View style={styles.boutiqueInfoRow}>
            <View style={styles.boutiqueIconBadge}>
              <Icon name="storefront-outline" size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.boutiqueNameText}>{item.boutiqueName}</Text>
          </View>

          <Text style={styles.captionText} numberOfLines={2}>
            {item.caption}{' '}
            <Text style={styles.moreLink}>...more</Text>
          </Text>

          {/* Floating Product Card Capsule (Exact match with Screenshot 1) */}
          <View style={styles.floatingProductCard}>
            <FastImage
              source={{ uri: item.productImage }}
              style={styles.productThumb as any}
              resizeMode={FastImage.resizeMode.cover}
            />
            <View style={styles.productDetailsCol}>
              <Text style={styles.productTitleText} numberOfLines={1}>
                {item.productTitle}
              </Text>
              <Text style={styles.productPriceText}>
                {formatINR(item.productPrice)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.buyNowBtn}
              onPress={() => handleBuyNow(item)}
              activeOpacity={0.85}
            >
              <Text style={styles.buyNowBtnText}>Buy Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={reels}
        renderItem={renderReel}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={reelHeight}
        snapToAlignment="start"
      />

      {/* Interactive Comment Modal */}
      <Modal
        visible={commentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.commentSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                Comments ({activeReel ? activeReel.comments : 0})
              </Text>
              <TouchableOpacity onPress={() => setCommentModalVisible(false)}>
                <Icon name="close" size={22} color="#1E293B" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={sampleComments}
              keyExtractor={(_, i) => i.toString()}
              contentContainerStyle={styles.commentsList}
              renderItem={({ item }) => (
                <View style={styles.commentRow}>
                  <View style={styles.commentAvatar}>
                    <Icon name="account" size={16} color="#64748B" />
                  </View>
                  <Text style={styles.commentText}>{item}</Text>
                </View>
              )}
            />

            <View style={styles.inputRow}>
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment for the boutique..."
                placeholderTextColor="#94A3B8"
                value={commentText}
                onChangeText={setCommentText}
              />
              <TouchableOpacity style={styles.sendBtn} onPress={postComment}>
                <Icon name="send" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  reelContainer: {
    position: 'relative',
    backgroundColor: '#000000',
  },
  fullMedia: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  vignetteOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
  },
  topHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 20,
  },
  headerCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 30, 30, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topTitle: {
    fontFamily: typography.fontFamily.serifBold,
    fontSize: 20,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  rightActionsBar: {
    position: 'absolute',
    right: 14,
    bottom: 110,
    alignItems: 'center',
    gap: 16,
    zIndex: 20,
  },
  actionItem: {
    alignItems: 'center',
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(30, 30, 30, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  actionCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bottomContentArea: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 16,
    zIndex: 20,
  },
  boutiqueInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  boutiqueIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  boutiqueName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  boutiqueNameText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  captionText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#FFFFFF',
    maxWidth: '85%',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  moreLink: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '700',
  },
  floatingProductCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 20, 20, 0.86)',
    borderRadius: 18,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  productThumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#333333',
    marginRight: 10,
  },
  productDetailsCol: {
    flex: 1,
  },
  productTitleText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  productPriceText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#10B981',
    marginTop: 2,
  },
  buyNowBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
  },
  buyNowBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  commentSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 28,
    maxHeight: '65%',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  commentsList: {
    paddingBottom: 12,
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  commentText: {
    fontSize: 13,
    color: '#334155',
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
