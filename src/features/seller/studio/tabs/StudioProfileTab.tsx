import React, { useState, useMemo, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Share,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSellerStore } from '../../sellerStore';
import { RunwayReel, StudioProduct } from '../studioTypes';
import { showToast } from '../../../../components/MitrenoToast';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface StudioProfileTabProps {
  onSwitchToBuyerApp?: () => void;
  onEditProfile?: () => void;
}

export type ProfileSubTab = 'products' | 'reels';

// 12 Curated Luxury Boutique Avatars for 1-tap merchant branding
export const RECOMMENDED_BOUTIQUE_AVATARS = [
  {
    id: 'rec_1',
    name: 'Red Luxury Bag',
    uri: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'rec_2',
    name: 'Haute Couture Rack',
    uri: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'rec_3',
    name: 'Runway Silhouette',
    uri: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'rec_4',
    name: 'Urban Monogram',
    uri: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'rec_5',
    name: 'Minimal Pastel',
    uri: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'rec_6',
    name: 'Dark Aesthetic',
    uri: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'rec_7',
    name: 'Artisan Loom Silk',
    uri: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'rec_8',
    name: 'Vintage Atelier',
    uri: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'rec_9',
    name: 'Premium Wool',
    uri: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'rec_10',
    name: 'Selvedge Denim',
    uri: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'rec_11',
    name: 'Streetwear Boxy',
    uri: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'rec_12',
    name: 'Royal Zari Silk',
    uri: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80',
  },
];

// Standard Grezto Fashion Categories for instant selection
export const GREZTO_FASHION_CATEGORIES = [
  'Designer Streetwear & Ethnic Fusion',
  'Oversized Streetwear & Hoodies',
  'Handcrafted Silk Sarees & Ethnic',
  'Luxury Menswear & Kurtas',
  'Y2K & Vintage Aesthetic',
  'Activewear & Athleisure',
  'Indie Fusion & Sustainable Cotton',
  'Festive & Bridal Couture',
  'Minimalist Contemporary Essentials',
  'Footwear & Leather Craft',
  'Jewelry & Heritage Ornaments',
  'Designer Handbags & Accessories',
];

export const StudioProfileTab: React.FC<StudioProfileTabProps> = memo(({
  onSwitchToBuyerApp,
  onEditProfile,
}) => {
  const insets = useSafeAreaInsets();
  const profile = useSellerStore((s) => s.profile);
  const products = useSellerStore((s) => s.products);
  const updateProfile = useSellerStore((s) => s.updateProfile);
  const toggleStockStatus = useSellerStore((s) => s.toggleStockStatus);

  const [activeSubTab, setActiveSubTab] = useState<ProfileSubTab>('products');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedReel, setSelectedReel] = useState<RunwayReel | null>(null);

  // Leave Note states
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteInput, setNoteInput] = useState(profile.leaveNote || '');

  // Story states
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [isAddStoryOpen, setIsAddStoryOpen] = useState(false);
  const [storyActiveIndex, setStoryActiveIndex] = useState(0);

  // Edit Profile form states
  const [editAvatarUri, setEditAvatarUri] = useState(profile.avatarUri || '');
  const [editName, setEditName] = useState(profile.name);
  const [editCategory, setEditCategory] = useState(profile.category);
  const [editCity, setEditCity] = useState(profile.city);
  const [editBio, setEditBio] = useState(profile.bio);
  const [editInstagram, setEditInstagram] = useState(profile.instagramHandle || '');
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);

  // Open Edit Profile Modal
  const handleOpenEdit = useCallback(() => {
    setEditAvatarUri(profile.avatarUri || '');
    setEditName(profile.name);
    setEditCategory(profile.category);
    setEditCity(profile.city);
    setEditBio(profile.bio);
    setEditInstagram(profile.instagramHandle || '');
    setIsEditModalOpen(true);
    onEditProfile?.();
  }, [profile, onEditProfile]);

  // Save Edit Profile
  const handleSaveProfile = useCallback(() => {
    updateProfile({
      avatarUri: editAvatarUri.trim() || profile.avatarUri,
      name: editName.trim() || profile.name,
      category: editCategory.trim() || profile.category,
      city: editCity.trim() || profile.city,
      bio: editBio.trim() || profile.bio,
      instagramHandle: editInstagram.trim() || profile.instagramHandle,
    });
    setIsEditModalOpen(false);
    showToast({
      type: 'success',
      title: 'Boutique Updated',
      message: 'Your boutique profile changes are now live across Mitreno.',
    });
  }, [editAvatarUri, editName, editCategory, editCity, editBio, editInstagram, profile, updateProfile]);

  // Leave Note Save / Clear
  const handleSaveNote = useCallback(() => {
    const trimmed = noteInput.trim();
    updateProfile({ leaveNote: trimmed });
    setIsNoteModalOpen(false);
    showToast({
      type: 'success',
      title: trimmed ? 'Note Shared' : 'Note Cleared',
      message: trimmed ? 'Shoppers can now see your announcement.' : 'Your boutique note has been cleared.',
    });
  }, [noteInput, updateProfile]);

  const handleClearNote = useCallback(() => {
    setNoteInput('');
    updateProfile({ leaveNote: '' });
    setIsNoteModalOpen(false);
    showToast({
      type: 'info',
      title: 'Note Removed',
      message: 'Your boutique note has been cleared.',
    });
  }, [updateProfile]);

  // Share store link
  const handleShareStore = useCallback(async () => {
    try {
      await Share.share({
        title: `${profile.name} on Mitreno`,
        message: `Explore luxury fashion at ${profile.name} (${profile.handle}) on Mitreno: https://mitreno.com/studio/${profile.storeId}`,
      });
    } catch {
      Alert.alert('Store Link Copied', `https://mitreno.com/studio/${profile.storeId}`);
    }
  }, [profile]);

  // Story Interactions
  const activeStories = useMemo(() => {
    return profile.stories && profile.stories.length > 0
      ? profile.stories
      : [
          'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
        ];
  }, [profile.stories]);

  const handleAvatarPress = useCallback(() => {
    if (activeStories.length > 0) {
      setStoryActiveIndex(0);
      setIsStoryViewerOpen(true);
    } else {
      setIsAddStoryOpen(true);
    }
  }, [activeStories]);

  const handleAddPresetStory = useCallback(
    (storyUri: string, title: string) => {
      const updated = [...(profile.stories || []), storyUri];
      updateProfile({ stories: updated });
      setIsAddStoryOpen(false);
      showToast({
        type: 'success',
        title: 'Story Published',
        message: `"${title}" is now live on your boutique profile for 24h!`,
      });
    },
    [profile.stories, updateProfile]
  );

  const handleDeleteCurrentStory = useCallback(() => {
    const updated = [...(profile.stories || [])];
    if (updated.length > 0) {
      updated.splice(storyActiveIndex, 1);
      updateProfile({ stories: updated });
      if (updated.length === 0) {
        setIsStoryViewerOpen(false);
      } else if (storyActiveIndex >= updated.length) {
        setStoryActiveIndex(updated.length - 1);
      }
      showToast({
        type: 'info',
        title: 'Story Removed',
        message: 'Story slide has been removed.',
      });
    } else {
      setIsStoryViewerOpen(false);
    }
  }, [profile.stories, storyActiveIndex, updateProfile]);

  // Fallback for avatar initials if uri not present
  const boutiqueInitials = useMemo(() => {
    return profile.name ? profile.name.substring(0, 2).toUpperCase() : 'MT';
  }, [profile.name]);

  return (
    <View style={styles.container}>
      {/* 1. Top Header Bar (Safe Area Protected) */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 16) + 4 }]}>
        <View style={styles.handleWrap}>
          <Text style={styles.handleText}>{profile.handle || '@mitreno_official'}</Text>
          {profile.verifiedBadge && (
            <Icon name="check-decagram" size={17} color="#2563EB" style={styles.verifiedIcon} />
          )}
        </View>

        <View style={styles.topBarActions}>
          <TouchableOpacity
            style={styles.iconCircleButton}
            onPress={handleShareStore}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name="share-variant-outline" size={20} color="#0F172A" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconCircleButton}
            onPress={() => setIsSettingsOpen(true)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name="cog-outline" size={22} color="#0F172A" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 2. Instagram-Style Profile Header (Avatar on Left, Stats on Right) */}
        <View style={styles.profileHeaderCard}>
          {/* Left Column: Avatar + Story Ring + Leave Note Bubble */}
          <View style={styles.avatarSection}>
            {/* Leave Note Element (Floating directly above avatar) */}
            {profile.leaveNote ? (
              <TouchableOpacity
                style={styles.noteBubbleContainer}
                onPress={() => {
                  setNoteInput(profile.leaveNote || '');
                  setIsNoteModalOpen(true);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.noteBubble}>
                  <Text style={styles.noteBubbleText} numberOfLines={1}>
                    {profile.leaveNote}
                  </Text>
                  <View style={styles.noteBubbleTail} />
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.leaveNotePill}
                onPress={() => {
                  setNoteInput('');
                  setIsNoteModalOpen(true);
                }}
                activeOpacity={0.8}
              >
                <Icon name="plus" size={12} color="#475569" style={{ marginRight: 2 }} />
                <Text style={styles.leaveNotePillText}>Leave note</Text>
              </TouchableOpacity>
            )}

            {/* Avatar with Story Gradient Ring */}
            <LinearGradient
              colors={['#F59E0B', '#EC4899', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.storyGradientRing}
            >
              <TouchableOpacity
                style={styles.avatarInnerWrap}
                onPress={handleAvatarPress}
                activeOpacity={0.85}
              >
                {profile.avatarUri ? (
                  <FastImage
                    source={{
                      uri: profile.avatarUri,
                      priority: FastImage.priority.normal,
                      cache: FastImage.cacheControl.immutable,
                    }}
                    style={styles.avatarImage as any}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                ) : (
                  <View style={styles.avatarInitialsBox}>
                    <Text style={styles.avatarInitialsText}>{boutiqueInitials}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </LinearGradient>

            {/* Blue Add-Story Button (+) on Bottom-Right */}
            <TouchableOpacity
              style={styles.addStoryPlusBadge}
              onPress={() => setIsAddStoryOpen(true)}
              activeOpacity={0.85}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Icon name="plus" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Right Column: 3 Symmetrical Stats (Products, Followers, Rating) */}
          <View style={styles.statsRowRight}>
            <View style={styles.statColumn}>
              <Text style={styles.statNumber}>{products.length}</Text>
              <Text style={styles.statLabel}>Products</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statColumn}>
              <Text style={styles.statNumber}>
                {profile.followersCount >= 1000
                  ? `${(profile.followersCount / 1000).toFixed(1)}K`
                  : profile.followersCount}
              </Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statColumn}>
              <Text style={styles.statNumber}>{profile.rating.toFixed(1)}★</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </View>

        {/* 3. Boutique Info Section */}
        <View style={styles.boutiqueInfoSection}>
          <View style={styles.nameRow}>
            <Text style={styles.boutiqueName}>{profile.name || 'Mitreno.com'}</Text>
            {profile.verifiedBadge && (
              <View style={styles.verifiedShieldChip}>
                <Icon name="shield-check" size={13} color="#059669" />
                <Text style={styles.verifiedShieldText}>Verified Boutique</Text>
              </View>
            )}
          </View>

          <Text style={styles.categoryText}>
            {profile.category || 'Designer Streetwear & Ethnic Fusion'}
          </Text>

          <View style={styles.locationRow}>
            <Icon name="map-marker-outline" size={14} color="#64748B" />
            <Text style={styles.locationText}>
              {profile.city || 'Guwahati'}, {profile.state || 'Assam'}
            </Text>
            <View style={styles.bulletSeparator} />
            <View style={styles.hyperlocalChip}>
              <Icon name="lightning-bolt" size={12} color="#D97706" />
              <Text style={styles.hyperlocalText}>30-Min City Delivery</Text>
            </View>
          </View>

          {/* Bio */}
          <Text style={styles.bioText}>
            {profile.bio ||
              'Authentic Designer Streetwear & Handcrafted Ethnic Silks • Hyperlocal 30-Min City Delivery • 100% Genuine Certified Goods.'}
          </Text>

          {/* Store Identification Bar & Instagram Link */}
          <View style={styles.metaRow}>
            <View style={styles.storeIdWrap}>
              <Icon name="storefront-outline" size={14} color="#64748B" />
              <Text style={styles.storeIdText}>Store ID: #{profile.storeId || '42723'}</Text>
            </View>

            {Boolean(profile.instagramHandle) && (
              <TouchableOpacity
                style={styles.instagramChip}
                onPress={() => {
                  Alert.alert(
                    'Instagram Boutique',
                    `Visit ${profile.name} on Instagram: ${profile.instagramHandle}`
                  );
                }}
                activeOpacity={0.7}
              >
                <Icon name="instagram" size={14} color="#E1306C" />
                <Text style={styles.instagramChipText}>{profile.instagramHandle}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 4. Action Buttons Row */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={handleOpenEdit}
            activeOpacity={0.8}
          >
            <Icon name="square-edit-outline" size={16} color="#0F172A" style={{ marginRight: 6 }} />
            <Text style={styles.editProfileButtonText}>Edit Boutique Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareStoreButton}
            onPress={handleShareStore}
            activeOpacity={0.8}
          >
            <Icon name="share-variant-outline" size={16} color="#0F172A" style={{ marginRight: 6 }} />
            <Text style={styles.shareStoreButtonText}>Share Store Link</Text>
          </TouchableOpacity>
        </View>

        {/* 5. Clean Sub-Tab Switcher (Products vs Reels) */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.subTabButton, activeSubTab === 'products' && styles.subTabButtonActive]}
            onPress={() => setActiveSubTab('products')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.subTabText,
                activeSubTab === 'products' && styles.subTabTextActive,
              ]}
            >
              Products ({products.length})
            </Text>
            {activeSubTab === 'products' && <View style={styles.activeTabIndicator} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTabButton, activeSubTab === 'reels' && styles.subTabButtonActive]}
            onPress={() => setActiveSubTab('reels')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.subTabText,
                activeSubTab === 'reels' && styles.subTabTextActive,
              ]}
            >
              Reels ({profile.reels?.length || 0})
            </Text>
            {activeSubTab === 'reels' && <View style={styles.activeTabIndicator} />}
          </TouchableOpacity>
        </View>

        {/* 6. SubTab Content Area */}
        {activeSubTab === 'products' ? (
          /* Products Grid (2 columns) */
          <View style={styles.catalogGrid}>
            {products.map((product: StudioProduct) => (
              <View key={product.id} style={styles.productCard}>
                <View style={styles.productImageWrap}>
                  <FastImage
                    source={{
                      uri: product.imageUri,
                      priority: FastImage.priority.normal,
                      cache: FastImage.cacheControl.immutable,
                    }}
                    style={styles.productImage as any}
                    resizeMode={FastImage.resizeMode.cover}
                  />

                  {/* Discount / Boost badges */}
                  {product.discountPercent > 0 && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountBadgeText}>{product.discountPercent}% OFF</Text>
                    </View>
                  )}
                  {product.isBoosted && (
                    <View style={styles.boostedBadge}>
                      <Icon name="lightning-bolt" size={10} color="#FFFFFF" />
                      <Text style={styles.boostedBadgeText}>BOOSTED</Text>
                    </View>
                  )}

                  {/* Stock Quick Toggle Button */}
                  <TouchableOpacity
                    style={[
                      styles.stockToggleBadge,
                      product.inStock ? styles.stockIn : styles.stockOut,
                    ]}
                    onPress={() => toggleStockStatus(product.id)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.stockDot,
                        { backgroundColor: product.inStock ? '#10B981' : '#EF4444' },
                      ]}
                    />
                    <Text style={styles.stockToggleText}>
                      {product.inStock ? 'In Stock' : 'Out'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Details */}
                <View style={styles.productDetails}>
                  <Text style={styles.productCategory}>{product.category}</Text>
                  <Text style={styles.productTitle} numberOfLines={1}>
                    {product.title}
                  </Text>
                  <Text style={styles.productFabric} numberOfLines={1}>
                    {product.fabric} • {product.gsm}
                  </Text>

                  <View style={styles.productPriceRow}>
                    <Text style={styles.productPrice}>₹{product.price}</Text>
                    {product.originalPrice > product.price && (
                      <Text style={styles.productOriginalPrice}>₹{product.originalPrice}</Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          /* Runway Reels Grid (2-column video cards) */
          <View style={styles.reelsGrid}>
            {(profile.reels || []).map((reel: RunwayReel) => (
              <TouchableOpacity
                key={reel.id}
                style={styles.reelCard}
                onPress={() => setSelectedReel(reel)}
                activeOpacity={0.85}
              >
                <FastImage
                  source={{
                    uri: reel.thumbnail,
                    priority: FastImage.priority.normal,
                    cache: FastImage.cacheControl.immutable,
                  }}
                  style={styles.reelThumbnail as any}
                  resizeMode={FastImage.resizeMode.cover}
                />

                <LinearGradient
                  colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.85)']}
                  style={styles.reelGradient}
                />

                {/* Top Metrics: Views & Likes */}
                <View style={styles.reelTopRow}>
                  <View style={styles.reelMetricChip}>
                    <Icon name="eye-outline" size={12} color="#FFFFFF" style={{ marginRight: 3 }} />
                    <Text style={styles.reelMetricText}>{reel.views}</Text>
                  </View>

                  <View style={styles.reelMetricChip}>
                    <Icon name="heart-outline" size={12} color="#FFFFFF" style={{ marginRight: 3 }} />
                    <Text style={styles.reelMetricText}>{reel.likes}</Text>
                  </View>
                </View>

                {/* Center Play Icon */}
                <View style={styles.reelPlayWrap}>
                  <Icon name="play-circle" size={40} color="rgba(255,255,255,0.85)" />
                </View>

                {/* Bottom Garment Tag Chip */}
                <View style={styles.reelBottomInfo}>
                  <Text style={styles.reelTitle} numberOfLines={1}>
                    {reel.title}
                  </Text>
                  <View style={styles.taggedGarmentChip}>
                    <Icon name="tag-outline" size={11} color="#059669" style={{ marginRight: 3 }} />
                    <Text style={styles.taggedGarmentTitle} numberOfLines={1}>
                      {reel.taggedGarmentTitle}
                    </Text>
                    <Text style={styles.taggedGarmentPrice}>₹{reel.taggedPrice}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 7. Leave Note Modal */}
      <Modal
        visible={isNoteModalOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsNoteModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setIsNoteModalOpen(false)}
          />

          <View style={[styles.noteModalSheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.drawerHandle} />

            <View style={styles.noteModalHeader}>
              <View style={styles.noteHeaderTitleWrap}>
                <Icon name="note-text-outline" size={20} color="#2563EB" />
                <Text style={styles.noteModalTitle}>Boutique Announcement Note</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsNoteModalOpen(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.noteModalSubtitle}>
              Broadcast a live message or today's offer right above your boutique profile picture.
            </Text>

            {/* Note Input */}
            <TextInput
              style={styles.noteInput}
              value={noteInput}
              onChangeText={setNoteInput}
              placeholder="e.g. ⚡ Today's Flash Drop 50% OFF!"
              placeholderTextColor="#94A3B8"
              maxLength={60}
            />
            <Text style={styles.noteCharCount}>{noteInput.length} / 60</Text>

            {/* Quick Presets */}
            <Text style={styles.presetsLabel}>Quick Presets:</Text>
            <View style={styles.presetsRow}>
              {[
                "⚡ Today's Flash Drop 50% OFF!",
                '🎉 Special Weekend Offer Live!',
                '✨ Fresh Silks & Streetwear Dropped!',
                '🚀 30-Min Fast City Delivery Active!',
              ].map((preset) => (
                <TouchableOpacity
                  key={preset}
                  style={styles.presetChip}
                  onPress={() => setNoteInput(preset)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.presetChipText}>{preset}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.noteModalActions}>
              {Boolean(profile.leaveNote) && (
                <TouchableOpacity
                  style={styles.clearNoteButton}
                  onPress={handleClearNote}
                  activeOpacity={0.8}
                >
                  <Text style={styles.clearNoteButtonText}>Clear Note</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.saveNoteButton}
                onPress={handleSaveNote}
                activeOpacity={0.85}
              >
                <Text style={styles.saveNoteButtonText}>Post Note</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 8. Story Viewer Modal (Instagram Full Screen) */}
      <Modal
        visible={isStoryViewerOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsStoryViewerOpen(false)}
      >
        <View style={styles.storyViewerOverlay}>
          {/* Progress Bars */}
          <View style={[styles.storyProgressRow, { paddingTop: Math.max(insets.top, 16) }]}>
            {activeStories.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.storyProgressBar,
                  idx === storyActiveIndex && styles.storyProgressBarActive,
                  idx < storyActiveIndex && styles.storyProgressBarCompleted,
                ]}
              />
            ))}
          </View>

          {/* Top Story Header */}
          <View style={styles.storyViewerHeader}>
            <View style={styles.storyHeaderLeft}>
              <FastImage
                source={{
                  uri: profile.avatarUri,
                  priority: FastImage.priority.normal,
                  cache: FastImage.cacheControl.immutable,
                }}
                style={styles.storyHeaderAvatar as any}
              />
              <View>
                <Text style={styles.storyHeaderName}>{profile.name}</Text>
                <Text style={styles.storyHeaderTime}>2h ago • Live Story</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setIsStoryViewerOpen(false)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.storyCloseBtn}
            >
              <Icon name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Story Image */}
          <FastImage
            source={{
              uri: activeStories[storyActiveIndex],
              priority: FastImage.priority.normal,
              cache: FastImage.cacheControl.immutable,
            }}
            style={styles.storyViewerImage as any}
            resizeMode={FastImage.resizeMode.cover}
          />

          {/* Story Navigation Tap Zones */}
          <View style={styles.storyTapZones}>
            <TouchableOpacity
              style={styles.storyTapZoneLeft}
              onPress={() => {
                if (storyActiveIndex > 0) {
                  setStoryActiveIndex(storyActiveIndex - 1);
                }
              }}
              activeOpacity={1}
            />
            <TouchableOpacity
              style={styles.storyTapZoneRight}
              onPress={() => {
                if (storyActiveIndex < activeStories.length - 1) {
                  setStoryActiveIndex(storyActiveIndex + 1);
                } else {
                  setIsStoryViewerOpen(false);
                }
              }}
              activeOpacity={1}
            />
          </View>

          {/* Bottom Story Controls */}
          <View style={[styles.storyViewerBottom, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.storyViewsChip}>
              <Icon name="eye-outline" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.storyViewsText}>342 Shopper Views</Text>
            </View>

            <View style={styles.storyBottomActions}>
              <TouchableOpacity
                style={styles.storyActionBtn}
                onPress={() => {
                  setIsStoryViewerOpen(false);
                  setIsAddStoryOpen(true);
                }}
                activeOpacity={0.8}
              >
                <Icon name="plus" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.storyActionBtnText}>Add Slide</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.storyDeleteBtn}
                onPress={handleDeleteCurrentStory}
                activeOpacity={0.8}
              >
                <Icon name="trash-can-outline" size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 9. Add Story Modal */}
      <Modal
        visible={isAddStoryOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsAddStoryOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setIsAddStoryOpen(false)}
          />

          <View style={[styles.addStorySheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.drawerHandle} />

            <View style={styles.noteModalHeader}>
              <View style={styles.noteHeaderTitleWrap}>
                <Icon name="camera-iris" size={20} color="#8B5CF6" />
                <Text style={styles.noteModalTitle}>Post to Boutique Story</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsAddStoryOpen(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.noteModalSubtitle}>
              Select a luxury visual or runway drop to feature on your profile story for 24 hours.
            </Text>

            {/* Presets Grid */}
            <View style={styles.addStoryPresetsGrid}>
              {[
                {
                  id: 'story_preset_1',
                  title: '⚡ 30-Min Express Dispatch',
                  uri: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80',
                },
                {
                  id: 'story_preset_2',
                  title: '🔥 50% Flash Drop Alert',
                  uri: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80',
                },
                {
                  id: 'story_preset_3',
                  title: '👗 New Runway Silk Arrivals',
                  uri: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
                },
              ].map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.addStoryCard}
                  onPress={() => handleAddPresetStory(item.uri, item.title)}
                  activeOpacity={0.85}
                >
                  <FastImage
                    source={{
                      uri: item.uri,
                      priority: FastImage.priority.normal,
                      cache: FastImage.cacheControl.immutable,
                    }}
                    style={styles.addStoryThumb as any}
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.85)']}
                    style={styles.addStoryGradient}
                  />
                  <Text style={styles.addStoryCardTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* 10. Edit Boutique Profile Modal (Upgraded per Screenshot 3) */}
      <Modal
        visible={isEditModalOpen}
        animationType="slide"
        onRequestClose={() => setIsEditModalOpen(false)}
      >
        <View style={[styles.editModalContainer, { paddingTop: Math.max(insets.top, 14) }]}>
          {/* Header */}
          <View style={styles.editModalHeader}>
            <TouchableOpacity
              onPress={() => setIsEditModalOpen(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="close" size={24} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.editModalTitle}>Edit Boutique Profile</Text>
            <TouchableOpacity onPress={handleSaveProfile} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.editFormScroll} contentContainerStyle={{ padding: 16 }}>
            {/* Top Section: Avatar Management & 12 Recommended Avatars */}
            <View style={styles.avatarManageCard}>
              <View style={styles.avatarPreviewWrap}>
                <FastImage
                  source={{
                    uri: editAvatarUri || profile.avatarUri,
                    priority: FastImage.priority.normal,
                    cache: FastImage.cacheControl.immutable,
                  }}
                  style={styles.avatarLargePreview as any}
                  resizeMode={FastImage.resizeMode.cover}
                />
              </View>

              <View style={styles.avatarActionBtnsRow}>
                <TouchableOpacity
                  style={styles.avatarChangeBtn}
                  onPress={() => {
                    // Randomize from curated recommended list
                    const randomIndex = Math.floor(Math.random() * RECOMMENDED_BOUTIQUE_AVATARS.length);
                    setEditAvatarUri(RECOMMENDED_BOUTIQUE_AVATARS[randomIndex].uri);
                    showToast({
                      type: 'info',
                      title: 'Avatar Selected',
                      message: `Applied "${RECOMMENDED_BOUTIQUE_AVATARS[randomIndex].name}".`,
                    });
                  }}
                  activeOpacity={0.8}
                >
                  <Icon name="camera-flip-outline" size={14} color="#0F172A" style={{ marginRight: 4 }} />
                  <Text style={styles.avatarChangeBtnText}>Change Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.avatarRemoveBtn}
                  onPress={() => {
                    setEditAvatarUri('');
                    showToast({
                      type: 'info',
                      title: 'Photo Reset',
                      message: 'Boutique logo reset to default monogram.',
                    });
                  }}
                  activeOpacity={0.8}
                >
                  <Icon name="trash-can-outline" size={14} color="#EF4444" style={{ marginRight: 4 }} />
                  <Text style={styles.avatarRemoveBtnText}>Remove</Text>
                </TouchableOpacity>
              </View>

              {/* 12 Recommended Boutique Avatars Horizontal Carousel */}
              <View style={styles.recommendedSection}>
                <Text style={styles.recommendedTitle}>Recommended Boutique Avatars</Text>
                <Text style={styles.recommendedSubtitle}>
                  Choose a designer boutique logo if you prefer not to upload:
                </Text>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.recommendedScroll}
                >
                  {RECOMMENDED_BOUTIQUE_AVATARS.map((avatar) => {
                    const isSelected = editAvatarUri === avatar.uri;
                    return (
                      <TouchableOpacity
                        key={avatar.id}
                        style={[
                          styles.recommendedItem,
                          isSelected && styles.recommendedItemActive,
                        ]}
                        onPress={() => {
                          setEditAvatarUri(avatar.uri);
                          showToast({
                            type: 'info',
                            title: 'Avatar Selected',
                            message: `Selected "${avatar.name}".`,
                          });
                        }}
                        activeOpacity={0.75}
                      >
                        <FastImage
                          source={{
                            uri: avatar.uri,
                            priority: FastImage.priority.normal,
                            cache: FastImage.cacheControl.immutable,
                          }}
                          style={styles.recommendedImg as any}
                        />
                        {isSelected && (
                          <View style={styles.recommendedCheckmark}>
                            <Icon name="check" size={12} color="#FFFFFF" />
                          </View>
                        )}
                        <Text style={styles.recommendedName} numberOfLines={1}>
                          {avatar.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            {/* Form Field 1: Boutique Display Name */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Boutique Display Name</Text>
              <TextInput
                style={styles.formInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="e.g. Mitreno.com"
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* Form Field 2: Fashion Category (Dropdown with Arrow) */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Fashion Category</Text>
              <TouchableOpacity
                style={styles.categoryDropdownBtn}
                onPress={() => setIsCategoryPickerOpen(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.categoryDropdownText} numberOfLines={1}>
                  {editCategory || 'Select Fashion Category'}
                </Text>
                <Icon name="chevron-down" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Form Field 3: Instagram Profile Handle / Link */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Instagram Profile Handle / Link</Text>
              <View style={styles.inputWithIconWrap}>
                <Icon name="instagram" size={18} color="#E1306C" style={styles.fieldLeftIcon} />
                <TextInput
                  style={styles.formInputWithIcon}
                  value={editInstagram}
                  onChangeText={setEditInstagram}
                  placeholder="@yourboutique.official or link"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Form Field 4: City / Hub Location */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>City / Hub Location</Text>
              <TextInput
                style={styles.formInput}
                value={editCity}
                onChangeText={setEditCity}
                placeholder="e.g. Guwahati"
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* Form Field 5: Boutique Bio & Luxury Manifesto */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Boutique Bio & Luxury Manifesto</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                value={editBio}
                onChangeText={setEditBio}
                placeholder="Describe your boutique, delivery guarantee, and fabrics..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Save Changes Button */}
            <TouchableOpacity style={styles.saveSubmitButton} onPress={handleSaveProfile} activeOpacity={0.85}>
              <Text style={styles.saveSubmitButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* 11. Category Picker Bottom Sheet */}
      <Modal
        visible={isCategoryPickerOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsCategoryPickerOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setIsCategoryPickerOpen(false)}
          />

          <View style={[styles.categoryPickerSheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.drawerHandle} />

            <View style={styles.noteModalHeader}>
              <View style={styles.noteHeaderTitleWrap}>
                <Icon name="shape-outline" size={20} color="#059669" />
                <Text style={styles.noteModalTitle}>Select Fashion Category</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsCategoryPickerOpen(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              {GREZTO_FASHION_CATEGORIES.map((cat) => {
                const isSelected = editCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoryOptionItem, isSelected && styles.categoryOptionItemActive]}
                    onPress={() => {
                      setEditCategory(cat);
                      setIsCategoryPickerOpen(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        isSelected && styles.categoryOptionTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                    {isSelected && <Icon name="check-circle" size={18} color="#059669" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 12. Settings Drawer Modal */}
      <Modal
        visible={isSettingsOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsSettingsOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setIsSettingsOpen(false)}
          />

          <View style={[styles.settingsDrawer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.drawerHandle} />
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Store Settings & Controls</Text>
              <TouchableOpacity
                onPress={() => setIsSettingsOpen(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="close" size={22} color="#0F172A" />
              </TouchableOpacity>
            </View>

            {/* Verification Banner */}
            <View style={styles.verifiedPartnerBanner}>
              <Icon name="shield-check" size={24} color="#059669" style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.partnerBannerTitle}>Certified Mitreno Luxury Partner</Text>
                <Text style={styles.partnerBannerSubtitle}>
                  Store #{profile.storeId} • Hyperlocal Verified Hub
                </Text>
              </View>
            </View>

            {/* Menu Options */}
            <View style={styles.settingsMenu}>
              <TouchableOpacity
                style={styles.settingsMenuItem}
                onPress={() => {
                  setIsSettingsOpen(false);
                  Alert.alert(
                    'Ads & Store Boost (PRO)',
                    'Reach 50,000+ local buyers across Guwahati. Your garments will be pinned to Top Runway Spots.'
                  );
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIconBox, { backgroundColor: '#FEF3C7' }]}>
                  <Icon name="rocket-launch-outline" size={20} color="#D97706" />
                </View>
                <View style={styles.menuItemTextWrap}>
                  <View style={styles.menuTitleRow}>
                    <Text style={styles.menuItemTitle}>Ads & Store Boost</Text>
                    <View style={styles.proBadge}>
                      <Text style={styles.proBadgeText}>PRO</Text>
                    </View>
                  </View>
                  <Text style={styles.menuItemSubtitle}>Promote catalog to 50k local shoppers</Text>
                </View>
                <Icon name="chevron-right" size={20} color="#CBD5E1" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.settingsMenuItem}
                onPress={() => {
                  setIsSettingsOpen(false);
                  Alert.alert(
                    'Financial Analytics',
                    'Total Settlement: ₹6,059\nGST Invoices generated automatically for each dispatched order.'
                  );
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIconBox, { backgroundColor: '#EEF2FF' }]}>
                  <Icon name="chart-box-outline" size={20} color="#4F46E5" />
                </View>
                <View style={styles.menuItemTextWrap}>
                  <Text style={styles.menuItemTitle}>Sales & Financial Analytics</Text>
                  <Text style={styles.menuItemSubtitle}>Revenue reports, GST invoices & settlements</Text>
                </View>
                <Icon name="chevron-right" size={20} color="#CBD5E1" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.settingsMenuItem}
                onPress={() => {
                  setIsSettingsOpen(false);
                  Alert.alert(
                    'Payout Details',
                    'HDFC Bank Account ending in ••4829.\nInstant daily settlement cycle at 11:59 PM.'
                  );
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIconBox, { backgroundColor: '#ECFDF5' }]}>
                  <Icon name="bank-outline" size={20} color="#059669" />
                </View>
                <View style={styles.menuItemTextWrap}>
                  <Text style={styles.menuItemTitle}>Payout & Bank Accounts</Text>
                  <Text style={styles.menuItemSubtitle}>HDFC Bank ending in ••4829 - Instant daily settlements</Text>
                </View>
                <Icon name="chevron-right" size={20} color="#CBD5E1" />
              </TouchableOpacity>

              {onSwitchToBuyerApp && (
                <TouchableOpacity
                  style={[styles.settingsMenuItem, styles.switchBuyerItem]}
                  onPress={() => {
                    setIsSettingsOpen(false);
                    onSwitchToBuyerApp();
                  }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.menuIconBox, { backgroundColor: '#FFEDD5' }]}>
                    <Icon name="swap-horizontal" size={22} color="#EA580C" />
                  </View>
                  <View style={styles.menuItemTextWrap}>
                    <Text style={[styles.menuItemTitle, { color: '#EA580C' }]}>
                      Switch to Customer App
                    </Text>
                    <Text style={styles.menuItemSubtitle}>Browse Mitreno as a shopper</Text>
                  </View>
                  <Icon name="chevron-right" size={20} color="#EA580C" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* 13. Reel Player Preview Modal */}
      <Modal
        visible={Boolean(selectedReel)}
        animationType="fade"
        transparent
        onRequestClose={() => setSelectedReel(null)}
      >
        {selectedReel && (
          <View style={styles.reelPlayerOverlay}>
            <TouchableOpacity
              style={styles.reelPlayerClose}
              onPress={() => setSelectedReel(null)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Icon name="close" size={26} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.reelPlayerCard}>
              <FastImage
                source={{
                  uri: selectedReel.thumbnail,
                  priority: FastImage.priority.normal,
                  cache: FastImage.cacheControl.immutable,
                }}
                style={styles.reelPlayerImage as any}
                resizeMode={FastImage.resizeMode.cover}
              />

              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.9)']}
                style={styles.reelPlayerGradient}
              />

              <View style={styles.reelPlayerCenterPlay}>
                <Icon name="play-circle" size={64} color="rgba(255,255,255,0.9)" />
              </View>

              <View style={styles.reelPlayerInfo}>
                <Text style={styles.reelPlayerTitle}>{selectedReel.title}</Text>
                <View style={styles.reelPlayerStats}>
                  <Text style={styles.reelPlayerStatText}>👁️ {selectedReel.views} views</Text>
                  <Text style={styles.reelPlayerStatText}>❤️ {selectedReel.likes} likes</Text>
                </View>

                <View style={styles.reelShoppableCard}>
                  <Icon name="hanger" size={20} color="#059669" />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.shoppableTitle}>{selectedReel.taggedGarmentTitle}</Text>
                    <Text style={styles.shoppablePrice}>Price: ₹{selectedReel.taggedPrice}</Text>
                  </View>
                  <View style={styles.shoppableBuyPill}>
                    <Text style={styles.shoppableBuyText}>In Stock</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
});

export default StudioProfileTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  handleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  handleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  verifiedIcon: {
    marginLeft: 5,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 36,
  },

  // Profile Header Card (Instagram Layout)
  profileHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  avatarSection: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 18,
  },
  // Leave Note Bubble / Pill
  noteBubbleContainer: {
    position: 'absolute',
    top: -2,
    zIndex: 10,
    alignSelf: 'center',
  },
  noteBubble: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
    maxWidth: 96,
    position: 'relative',
  },
  noteBubbleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  noteBubbleTail: {
    position: 'absolute',
    bottom: -4,
    alignSelf: 'center',
    width: 6,
    height: 6,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    transform: [{ rotate: '45deg' }],
  },
  leaveNotePill: {
    position: 'absolute',
    top: -2,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  leaveNotePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },

  // Story Gradient Ring & Avatar
  storyGradientRing: {
    width: 82,
    height: 82,
    borderRadius: 41,
    padding: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInnerWrap: {
    width: '100%',
    height: '100%',
    borderRadius: 39,
    backgroundColor: '#FFFFFF',
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 37,
  },
  avatarInitialsBox: {
    width: '100%',
    height: '100%',
    borderRadius: 37,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitialsText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  addStoryPlusBadge: {
    position: 'absolute',
    bottom: 2,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#2563EB',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },

  // Stats Row on Right Side of Avatar
  statsRowRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginLeft: 16,
  },
  statColumn: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },

  // Boutique Info Section
  boutiqueInfoSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  boutiqueName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  verifiedShieldChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 3,
  },
  verifiedShieldText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#059669',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginTop: 3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    flexWrap: 'wrap',
  },
  locationText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 3,
  },
  bulletSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 8,
  },
  hyperlocalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  hyperlocalText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#D97706',
    marginLeft: 2,
  },
  bioText: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 18,
    marginTop: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 12,
  },
  storeIdWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeIdText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 4,
  },
  instagramChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF2F8',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FBCFE8',
    gap: 4,
  },
  instagramChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#BE185D',
  },

  // Action Buttons
  actionButtonsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  editProfileButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingVertical: 9,
  },
  editProfileButtonText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  shareStoreButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 9,
  },
  shareStoreButtonText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },

  // Tab Switcher (Products vs Reels)
  tabSwitcher: {
    flexDirection: 'row',
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  subTabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  subTabButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  subTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  subTabTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 28,
    right: 28,
    height: 2.5,
    backgroundColor: '#0F172A',
    borderRadius: 2,
  },

  // Catalog Products Grid
  catalogGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingTop: 12,
    justifyContent: 'space-between',
  },
  productCard: {
    width: (SCREEN_WIDTH - 36) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  productImageWrap: {
    width: '100%',
    height: 180,
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  boostedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  boostedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  stockToggleBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  stockIn: {
    borderColor: '#10B981',
  },
  stockOut: {
    borderColor: '#EF4444',
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  stockToggleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F172A',
  },
  productDetails: {
    padding: 10,
  },
  productCategory: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  productFabric: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  productOriginalPrice: {
    fontSize: 12,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },

  // Reels Grid
  reelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingTop: 12,
    justifyContent: 'space-between',
  },
  reelCard: {
    width: (SCREEN_WIDTH - 36) / 2,
    height: 250,
    borderRadius: 14,
    marginBottom: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  reelThumbnail: {
    width: '100%',
    height: '100%',
  },
  reelGradient: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  reelTopRow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reelMetricChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 8,
  },
  reelMetricText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reelPlayWrap: {
    position: 'absolute',
    alignSelf: 'center',
    top: '40%',
  },
  reelBottomInfo: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
  },
  reelTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  taggedGarmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  taggedGarmentTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  taggedGarmentPrice: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#059669',
    marginLeft: 4,
  },

  // Leave Note Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  noteModalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  drawerHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 12,
  },
  noteModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  noteHeaderTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noteModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  noteModalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    marginBottom: 12,
  },
  noteInput: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  noteCharCount: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 10,
  },
  presetsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  presetsRow: {
    gap: 6,
    marginBottom: 16,
  },
  presetChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  noteModalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  clearNoteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EF4444',
    alignItems: 'center',
  },
  clearNoteButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },
  saveNoteButton: {
    flex: 2,
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveNoteButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Full-Screen Story Viewer Modal
  storyViewerOverlay: {
    flex: 1,
    backgroundColor: '#000000',
  },
  storyProgressRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 4,
    zIndex: 20,
  },
  storyProgressBar: {
    flex: 1,
    height: 2.5,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  storyProgressBarActive: {
    backgroundColor: '#FFFFFF',
  },
  storyProgressBarCompleted: {
    backgroundColor: '#FFFFFF',
  },
  storyViewerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    zIndex: 20,
  },
  storyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  storyHeaderAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  storyHeaderName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  storyHeaderTime: {
    fontSize: 10.5,
    color: '#CBD5E1',
  },
  storyCloseBtn: {
    padding: 4,
  },
  storyViewerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  storyTapZones: {
    flex: 1,
    flexDirection: 'row',
  },
  storyTapZoneLeft: {
    flex: 1,
  },
  storyTapZoneRight: {
    flex: 2,
  },
  storyViewerBottom: {
    paddingHorizontal: 16,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 20,
  },
  storyViewsChip: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storyViewsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  storyBottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  storyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  storyActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  storyDeleteBtn: {
    padding: 6,
    backgroundColor: 'rgba(239,68,68,0.2)',
    borderRadius: 16,
  },

  // Add Story Modal
  addStorySheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  addStoryPresetsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 14,
  },
  addStoryCard: {
    flex: 1,
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  addStoryThumb: {
    width: '100%',
    height: '100%',
  },
  addStoryGradient: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  addStoryCardTitle: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 14,
  },

  // Upgraded Edit Boutique Profile Modal
  editModalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  editModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  editModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#059669',
  },
  editFormScroll: {
    flex: 1,
  },

  // Avatar Management Card in Edit Modal
  avatarManageCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarPreviewWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  avatarLargePreview: {
    width: '100%',
    height: '100%',
  },
  avatarActionBtnsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  avatarChangeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  avatarChangeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  avatarRemoveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  avatarRemoveBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },

  // 12 Recommended Avatars
  recommendedSection: {
    width: '100%',
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
  },
  recommendedTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  recommendedSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 8,
  },
  recommendedScroll: {
    gap: 10,
    paddingVertical: 4,
  },
  recommendedItem: {
    width: 58,
    alignItems: 'center',
    position: 'relative',
  },
  recommendedItemActive: {
    transform: [{ scale: 1.05 }],
  },
  recommendedImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  recommendedCheckmark: {
    position: 'absolute',
    top: 0,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  recommendedName: {
    fontSize: 9.5,
    color: '#475569',
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '600',
  },

  // Form Fields
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  categoryDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
  },
  categoryDropdownText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
  },
  inputWithIconWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
  },
  fieldLeftIcon: {
    marginRight: 8,
  },
  formInputWithIcon: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  formTextArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  saveSubmitButton: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  saveSubmitButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Category Picker Sheet
  categoryPickerSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  categoryOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  categoryOptionItemActive: {
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  categoryOptionText: {
    fontSize: 13.5,
    color: '#1E293B',
    fontWeight: '500',
  },
  categoryOptionTextActive: {
    color: '#065F46',
    fontWeight: '700',
  },

  // Settings Drawer
  settingsDrawer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  drawerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  verifiedPartnerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 12,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  partnerBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
  },
  partnerBannerSubtitle: {
    fontSize: 11,
    color: '#059669',
    marginTop: 1,
  },
  settingsMenu: {
    gap: 4,
  },
  settingsMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 4,
  },
  switchBuyerItem: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 6,
    paddingTop: 14,
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemTextWrap: {
    flex: 1,
  },
  menuTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  menuItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  proBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  proBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#D97706',
  },
  menuItemSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },

  // Reel Player Preview
  reelPlayerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  reelPlayerClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  reelPlayerCard: {
    width: '100%',
    height: 520,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  reelPlayerImage: {
    width: '100%',
    height: '100%',
  },
  reelPlayerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 220,
  },
  reelPlayerCenterPlay: {
    position: 'absolute',
    top: '38%',
    alignSelf: 'center',
  },
  reelPlayerInfo: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  reelPlayerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  reelPlayerStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  reelPlayerStatText: {
    fontSize: 12,
    color: '#E2E8F0',
    fontWeight: '600',
  },
  reelShoppableCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 10,
    borderRadius: 10,
  },
  shoppableTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  shoppablePrice: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  shoppableBuyPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  shoppableBuyText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
});
