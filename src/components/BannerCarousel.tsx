import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { Carousel } from 'react-native-reanimated-carousel';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const BANNERS = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80',
    sub: 'CURATED BOUTIQUE DROPS',
    title: 'SUMMER VINTAGE\n& STREETWEAR',
    desc: 'Direct deals & live counter-offers from top indie boutiques.',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80',
    sub: 'HANDCRAFTED ARTISAN',
    title: 'CHIKANKARI &\nHANDLOOM EDITS',
    desc: 'Pure handcrafted luxury delivered directly to your doorstep.',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop&q=80',
    sub: 'TIMELESS ACCESSORIES',
    title: 'CHISELED STERLING\n925 JEWELRY',
    desc: 'Verified hallmark pieces with direct boutique price bargaining.',
  },
];

export const BannerCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<any>(null);

  // Custom auto-play logic to ensure it never gets stuck
  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselRef.current) {
        carouselRef.current.next();
      }
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      {/* @ts-ignore */}
      <Carousel
        ref={carouselRef}
        loop
        // @ts-ignore
        width={width}
        height={138}
        autoPlay={false}
        scrollAnimationDuration={1000}
        data={BANNERS}
        onSnapToItem={(index) => setCurrentIndex(index)}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <ImageBackground
              source={{ uri: item.image }}
              style={styles.bannerImage}
              imageStyle={styles.bannerImageStyle}
            >
              <LinearGradient
                colors={['rgba(28, 10, 14, 0.75)', 'rgba(28, 10, 14, 0.15)']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 0.7, y: 0.5 }}
                style={styles.bannerOverlay}
              >
                <Text style={styles.bannerSub}>{item.sub}</Text>
                <Text style={styles.bannerTitle}>{item.title}</Text>
                <Text style={styles.bannerDesc}>{item.desc}</Text>
              </LinearGradient>
            </ImageBackground>
          </View>
        )}
      />

      {/* Pagination Dots */}
      <View style={styles.dotsContainer}>
        {BANNERS.map((_, index) => (
          <View
            key={index.toString()}
            style={[
              styles.dot,
              currentIndex === index && styles.dotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
    height: 138,
    marginVertical: 6,
    position: 'relative',
  },
  slide: {
    width: width,
    height: 138,
    paddingHorizontal: 12,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    borderRadius: 16,
    overflow: 'hidden',
  },
  bannerImageStyle: {
    borderRadius: 16,
  },
  bannerOverlay: {
    width: '100%',
    height: '100%',
    padding: 14,
    justifyContent: 'center',
    borderRadius: 16,
  },
  bannerSub: {
    color: '#E8D2AA',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.2,
    lineHeight: 18,
    marginBottom: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bannerDesc: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontSize: 9.5,
    lineHeight: 13,
    maxWidth: '82%',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  dotsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    left: 26,
    gap: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    backgroundColor: '#fff',
    width: 12,
  },
});
