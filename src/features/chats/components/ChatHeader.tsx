import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export interface ChatHeaderProps {
  sellerName: string;
  sellerAvatar?: string;
  isVerified?: boolean;
  isOnline?: boolean;
  lastSeenTime?: string;
  onBack: () => void;
  onInfoPress: () => void;
  headerBgColor?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = memo(({
  sellerName,
  sellerAvatar,
  isVerified = true,
  isOnline = true,
  lastSeenTime = '10:45 AM',
  onBack,
  onInfoPress,
  headerBgColor = '#FFFFFF',
}) => {
  const getInitials = (name: string) => {
    if (!name) return 'M';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <View style={[styles.container, { backgroundColor: headerBgColor }]}>
      {/* Left Back Arrow */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={onBack}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        activeOpacity={0.7}
      >
        <Icon name="arrow-left" size={24} color="#0F172A" />
      </TouchableOpacity>

      {/* Circular Avatar + Online Badge */}
      <View style={styles.avatarWrapper}>
        {sellerAvatar ? (
          <FastImage
            source={{ uri: sellerAvatar }}
            style={styles.avatar}
            resizeMode={FastImage.resizeMode.cover}
          />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitials}>{getInitials(sellerName)}</Text>
          </View>
        )}
        {isOnline && <View style={styles.onlineBadge} />}
      </View>

      {/* Title & Status Column */}
      <View style={styles.titleCol}>
        <View style={styles.nameRow}>
          <Text style={styles.sellerName} numberOfLines={1}>
            {sellerName}
          </Text>
          {isVerified && (
            <Icon
              name="check-decagram"
              size={15}
              color="#2563EB"
              style={styles.verifiedIcon}
            />
          )}
        </View>

        {/* Subtitle Status */}
        <View style={styles.statusRow}>
          {isOnline ? (
            <Text style={styles.onlineText}>
              <Text style={styles.emeraldDot}>● </Text>Online
            </Text>
          ) : (
            <Text style={styles.offlineText} numberOfLines={1}>
              {lastSeenTime.toLowerCase().startsWith('active') || lastSeenTime.toLowerCase().startsWith('last seen')
                ? lastSeenTime
                : `Last seen at ${lastSeenTime}`}
            </Text>
          )}
        </View>
      </View>

      {/* Right Info Button */}
      <TouchableOpacity
        style={styles.infoBtn}
        onPress={onInfoPress}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        activeOpacity={0.7}
      >
        <Icon name="information-outline" size={22} color="#334155" />
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    padding: 4,
    marginRight: 8,
  },
  avatarWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    position: 'relative',
    marginRight: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarInitials: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
  },
  onlineBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  titleCol: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
    maxWidth: '85%',
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1.5,
  },
  onlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  emeraldDot: {
    fontSize: 11,
    color: '#10B981',
  },
  offlineText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#64748B',
  },
  infoBtn: {
    padding: 6,
    marginLeft: 8,
  },
});
