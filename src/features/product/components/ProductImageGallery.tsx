import React, { useState, useRef, memo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
  Share,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export interface ProductImageGalleryProps {
  images: string[];
  productTitle: string;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = memo(({
  images,
  productTitle,
}) => {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // 3:4 Luxury Fashion Portrait Ratio (Standard across Flipkart & Luxury Boutiques)
  const galleryHeight = Math.round(width * 1.28);

  const handleScroll = useCallback((event: any) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / width);
    if (index !== activeIndex && index >= 0 && index < images.length) {
      setActiveIndex(index);
    }
  }, [width, activeIndex, images.length]);

  const scrollToNext = useCallback(() => {
    if (activeIndex < images.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    }
  }, [activeIndex, images.length]);

  const scrollToPrev = useCallback(() => {
    if (activeIndex > 0) {
      flatListRef.current?.scrollToIndex({ index: activeIndex - 1, animated: true });
    }
  }, [activeIndex]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `Check out ${productTitle} on Mitreno! Handcrafted boutique drops.`,
      });
    } catch {
      // Ignore dismiss
    }
  }, [productTitle]);

  const keyExtractor = useCallback((_: any, index: number) => index.toString(), []);

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: width,
    offset: width * index,
    index,
  }), [width]);

  const renderImageItem = useCallback(({ item, index }: { item: string; index: number }) => (
    <View style={{ width, height: galleryHeight, backgroundColor: '#FFFFFF' }}>
      <FastImage
        source={{
          uri: item,
          priority: index === 0 ? FastImage.priority.high : FastImage.priority.normal,
          cache: FastImage.cacheControl.immutable,
        }}
        style={styles.image as any}
        resizeMode={FastImage.resizeMode.cover}
      />
    </View>
  ), [width, galleryHeight]);

  return (
    <View style={[styles.container, { height: galleryHeight, width }]}>
      {/* Horizontal Swiping Image List */}
      <FlatList
        ref={flatListRef}
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        renderItem={renderImageItem}
        windowSize={3}
        maxToRenderPerBatch={2}
        initialNumToRender={1}
      />

      {/* Floating Vertical Actions Stack (Top-Right Corner matching Flipkart Screenshot 2) */}
      <View style={styles.floatingActionsColumn}>
        {/* 1. Wishlist / Heart Button */}
        <TouchableOpacity
          style={styles.floatingActionBtn}
          onPress={() => setIsFavorite(!isFavorite)}
          activeOpacity={0.8}
        >
          <Icon
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={21}
            color={isFavorite ? '#DC2626' : '#1E293B'}
          />
        </TouchableOpacity>

        {/* 2. Share Button */}
        <TouchableOpacity
          style={styles.floatingActionBtn}
          onPress={handleShare}
          activeOpacity={0.8}
        >
          <Icon name="share-variant-outline" size={20} color="#1E293B" />
        </TouchableOpacity>
      </View>

      {/* Left Stepper Chevron (Visible when not on first image) */}
      {activeIndex > 0 && (
        <TouchableOpacity
          style={[styles.chevronBtn, styles.chevronLeft]}
          onPress={scrollToPrev}
          activeOpacity={0.85}
        >
          <Icon name="chevron-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Right Stepper Chevron (Visible when not on last image) */}
      {activeIndex < images.length - 1 && (
        <TouchableOpacity
          style={[styles.chevronBtn, styles.chevronRight]}
          onPress={scrollToNext}
          activeOpacity={0.85}
        >
          <Icon name="chevron-right" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Bottom Center Capsule Pagination Indicator */}
      <View style={styles.paginationCapsule}>
        {images.map((_, index) => (
          <View
            key={index.toString()}
            style={[
              styles.dot,
              activeIndex === index ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#FFFFFF', // Clean pure white base
  },
  image: {
    width: '100%',
    height: '100%',
  },
  floatingActionsColumn: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'column',
    gap: 10,
    zIndex: 25,
  },
  floatingActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  chevronBtn: {
    position: 'absolute',
    top: '48%',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(30, 24, 20, 0.48)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  chevronLeft: {
    left: 12,
  },
  chevronRight: {
    right: 12,
  },
  paginationCapsule: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 16, 14, 0.45)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
    zIndex: 20,
  },
  dot: {
    height: 5,
    borderRadius: 2.5,
  },
  dotActive: {
    width: 18,
    backgroundColor: '#FFFFFF',
  },
  dotInactive: {
    width: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
});
