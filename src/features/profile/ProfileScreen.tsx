import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useAuthStore } from '../auth/authStore';
import { useSellerStore } from '../seller/sellerStore';
import { colors } from '../../theme/colors';

interface SettingRowItem {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  iconColor: string;
  iconBg: string;
  badge?: string;
  badgeBg?: string;
  badgeColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  chevronColor?: string;
  onPress?: () => void;
}

export const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user, logout } = useAuthStore();
  const { hasSubmittedApplication, applicationStatus, applicationId } = useSellerStore();
  const isUnderReview = hasSubmittedApplication && applicationStatus === 'under_review';

  const displayName = user?.displayName || 'Ashraf';
  const displayPhone = user?.phoneNumber || '+91 98649 75438';

  const handleInvite = async () => {
    try {
      await Share.share({
        message: 'Join Mitreno Boutique Marketplace! Use code ASHRAF500 to get ₹500 in your Mitreno Vault.',
      });
    } catch {
      // Ignore
    }
  };

  const handleBecomeSeller = () => {
    navigation.navigate('SellerOnboarding');
  };

  const handleEditProfile = () => {
    Alert.alert(
      'Edit Profile',
      `Member Name: ${displayName}\nContact: ${displayPhone}\nStatus: Verified Mitreno Privilege Member.`,
      [{ text: 'Close', style: 'cancel' }]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out Session',
      'Are you sure you want to exit your secure member dashboard?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            logout();
            navigation.navigate('ExploreTab');
          },
        },
      ]
    );
  };

  const SETTING_ROWS: SettingRowItem[] = [
    {
      id: 'fit',
      title: 'My Sizing & Fit Profile',
      subtitle: 'Edit height, weight, dimensions & silhouette fit',
      iconName: 'tape-measure',
      iconColor: '#059669',
      iconBg: '#ECFDF5',
      onPress: () => Alert.alert('Sizing & Fit', 'Your current silhouette is saved: Regular Fit, M/32.'),
    },
    {
      id: 'address',
      title: 'Saved Delivery Addresses',
      subtitle: 'Manage home, studio & work delivery locations',
      iconName: 'map-marker-radius-outline',
      iconColor: '#2563EB',
      iconBg: '#EFF6FF',
      onPress: () => Alert.alert('Delivery Address', 'Default shipping address: Ashraf, Guwahati, Assam 781036.'),
    },
    {
      id: 'seller',
      title: isUnderReview ? 'Application Status' : 'Become Mitreno Seller',
      subtitle: isUnderReview
        ? 'Auditing KYC & identity verification'
        : 'Sell boutique collections & reach verified buyers',
      iconName: isUnderReview ? 'clock-check-outline' : 'storefront-outline',
      iconColor: isUnderReview ? '#D97706' : '#4F46E5',
      iconBg: isUnderReview ? '#FEF3C7' : '#EEF2FF',
      badge: isUnderReview ? 'IN PROGRESS' : 'PARTNER',
      badgeBg: isUnderReview ? '#FEF3C7' : '#EEF2FF',
      badgeColor: isUnderReview ? '#B45309' : '#4F46E5',
      onPress: handleBecomeSeller,
    },
    {
      id: 'help',
      title: 'Help Centre & Personal Stylist',
      subtitle: '24/7 dedicated support for sizing, bargains & orders',
      iconName: 'chat-processing-outline',
      iconColor: '#7C3AED',
      iconBg: '#F5F3FF',
      onPress: () => navigation.navigate('ChatsTab'),
    },
    {
      id: 'about',
      title: 'About Mitreno Studio',
      subtitle: 'Curated boutique vision, craft heritage & story',
      iconName: 'compass-outline',
      iconColor: '#475569',
      iconBg: '#F1F5F9',
      onPress: () => Alert.alert('About Mitreno', 'Curated Boutique Marketplace connecting indie designers directly with discerning buyers.'),
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      subtitle: '256-bit encrypted credential vault & data protection',
      iconName: 'shield-check-outline',
      iconColor: '#0D9488',
      iconBg: '#F0FDFA',
      onPress: () => Alert.alert('Privacy Policy', 'Your payment credentials and contact data are 256-bit encrypted.'),
    },
    {
      id: 'terms',
      title: 'Terms of Service',
      subtitle: 'Platform guidelines, buyer safety & 7-day returns',
      iconName: 'file-document-check-outline',
      iconColor: '#64748B',
      iconBg: '#F8FAFC',
      onPress: () => Alert.alert('Terms & Conditions', '7-day hassle-free buyer protection on all verified boutique orders.'),
    },
    {
      id: 'admin',
      title: 'Admin Control Dashboard',
      subtitle: 'Authorized merchant & platform controls',
      iconName: 'view-dashboard-outline',
      iconColor: '#334155',
      iconBg: '#F1F5F9',
      titleColor: '#1E293B',
      subtitleColor: '#64748B',
      chevronColor: '#334155',
      onPress: () => Alert.alert('Admin Dashboard', 'Authorized boutique merchant access only.'),
    },
    {
      id: 'logout',
      title: 'Log Out Session',
      subtitle: 'Exit secure member dashboard safely',
      iconName: 'logout-variant',
      iconColor: '#DC2626',
      iconBg: '#FEF2F2',
      titleColor: '#DC2626',
      subtitleColor: '#F87171',
      chevronColor: '#DC2626',
      onPress: handleLogout,
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Header: Back button + "My Profile" */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('ExploreTab'))}
          activeOpacity={0.7}
        >
          <Icon name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Card: Initials Avatar + Name + Member Badge + Phone + Edit */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>AS</Text>
          </View>

          <View style={styles.profileDetailsCol}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{displayName}</Text>
            </View>
            <View style={styles.phoneRow}>
              <Icon name="phone-outline" size={13} color="#64748B" style={{ marginRight: 4 }} />
              <Text style={styles.phoneNumber}>{displayPhone}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.editBtn} onPress={handleEditProfile} activeOpacity={0.8}>
            <Icon name="pencil-outline" size={14} color="#0F172A" style={{ marginRight: 4 }} />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* 2-Column Quick Action Cards (My Orders + Wishlist) */}
        <View style={styles.dualCardsRow}>
          {/* My Orders */}
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => navigation.navigate('Orders')}
            activeOpacity={0.8}
          >
            <View style={styles.orderIconBox}>
              <Icon name="package-variant-closed" size={22} color="#2563EB" />
            </View>
            <View style={styles.quickCardTextCol}>
              <Text style={styles.quickCardTitle}>My Orders</Text>
              <Text style={styles.quickCardSubtitle}>Track shipments</Text>
            </View>
          </TouchableOpacity>

          {/* Wishlist */}
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => Alert.alert('Wishlist', 'You have 4 saved boutique pieces in your wishlist.')}
            activeOpacity={0.8}
          >
            <View style={styles.wishlistIconBox}>
              <Icon name="heart-outline" size={22} color="#E11D48" />
            </View>
            <View style={styles.quickCardTextCol}>
              <Text style={styles.quickCardTitle}>Wishlist</Text>
              <Text style={styles.quickCardSubtitle}>Saved pieces</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* "Become Mitreno Seller" / "Application Status" Premium Spotlight Hero Box */}
        <TouchableOpacity
          style={styles.sellerHeroCard}
          onPress={handleBecomeSeller}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={
              isUnderReview
                ? ['#78350F', '#B45309', '#D97706']
                : ['#1E3A8A', '#1D4ED8', '#2563EB']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sellerHeroGradient}
          >
            <View
              style={[
                styles.sellerIconCircle,
                isUnderReview && { backgroundColor: 'rgba(255, 255, 255, 0.25)' },
              ]}
            >
              <Icon
                name={isUnderReview ? 'clock-outline' : 'storefront-outline'}
                size={22}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.sellerHeroTextCol}>
              <View style={styles.sellerTagRow}>
                <Text style={styles.sellerTagText}>
                  {isUnderReview ? 'COMPLIANCE AUDIT' : 'BOUTIQUE ONBOARDING'}
                </Text>
              </View>
              <Text style={styles.sellerHeroTitle}>
                {isUnderReview ? 'Application Under Review' : 'Become Mitreno Seller'}
              </Text>
              <Text style={styles.sellerHeroSubtitle} numberOfLines={1}>
                {isUnderReview
                  ? `Auditing KYC & identity legitimacy (${applicationId || 'sa_...'})`
                  : 'Launch your boutique store & reach 50k+ buyers'}
              </Text>
            </View>

            <View
              style={[
                styles.sellerHeroActionBtn,
                isUnderReview && { backgroundColor: '#FFFFFF' },
              ]}
            >
              <Text
                style={[
                  styles.sellerHeroActionText,
                  isUnderReview && { color: '#B45309' },
                ]}
              >
                {isUnderReview ? 'Status →' : 'Apply →'}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Invite Friends & Earn Card (De-Yellowed with gift icon) */}
        <View style={styles.inviteCard}>
          <View style={styles.inviteIconCol}>
            <Icon name="gift-outline" size={20} color="#4F46E5" />
          </View>
          <View style={styles.inviteTextCol}>
            <Text style={styles.inviteTitle}>Invite Friends & Earn</Text>
            <Text style={styles.inviteSubtitle}>
              Get ₹500 store credits in your Mitreno Vault on referrals.
            </Text>
          </View>
          <TouchableOpacity style={styles.inviteBtn} onPress={handleInvite} activeOpacity={0.85}>
            <Icon name="content-copy" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.inviteBtnText}>Invite</Text>
          </TouchableOpacity>
        </View>

        {/* Detailed Settings Rows (Elevated, Cohesive Icons, Zero Yellow) */}
        <View style={styles.settingsSection}>
          {SETTING_ROWS.map((row) => (
            <TouchableOpacity
              key={row.id}
              style={styles.settingRow}
              onPress={row.onPress}
              activeOpacity={0.7}
            >
              {/* Colored Icon Square */}
              <View style={[styles.settingIconBox, { backgroundColor: row.iconBg }]}>
                <Icon name={row.iconName} size={20} color={row.iconColor} />
              </View>

              {/* Title & Subtitle */}
              <View style={styles.settingTextCol}>
                <View style={styles.titleBadgeRow}>
                  <Text style={[styles.settingTitle, row.titleColor ? { color: row.titleColor } : null]}>
                    {row.title}
                  </Text>
                  {row.badge && (
                    <View style={[styles.rowBadge, { backgroundColor: row.badgeBg }]}>
                      <Text style={[styles.rowBadgeText, { color: row.badgeColor }]}>
                        {row.badge}
                      </Text>
                    </View>
                  )}
                </View>
                <Text
                  style={[styles.settingSubtitle, row.subtitleColor ? { color: row.subtitleColor } : null]}
                  numberOfLines={1}
                >
                  {row.subtitle}
                </Text>
              </View>

              {/* Chevron Right */}
              <Icon
                name="chevron-right"
                size={20}
                color={row.chevronColor || '#94A3B8'}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer Brand Label */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            MITRENO V1.2.0 — CURATED BOUTIQUE MARKETPLACE ✦
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF6F0', // Warm luxury background
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EFE8DE',
    backgroundColor: '#FAF6F0',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  headerSpacer: {
    width: 32,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 12,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EFE8DE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  avatarInitials: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  profileDetailsCol: {
    flex: 1,
    marginLeft: 14,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginRight: 8,
    letterSpacing: -0.2,
  },
  memberBadge: {
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  memberBadgeText: {
    color: '#334155',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneNumber: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  dualCardsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 12,
  },
  quickCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 13,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EFE8DE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  orderIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  wishlistIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF1F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  quickCardTextCol: {
    flex: 1,
  },
  quickCardTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  quickCardSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  sellerHeroCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 4,
  },
  sellerHeroGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  sellerIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sellerHeroTextCol: {
    flex: 1,
    marginRight: 8,
  },
  sellerTagRow: {
    marginBottom: 2,
  },
  sellerTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#DBEAFE',
    letterSpacing: 0.6,
  },
  sellerHeroTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  sellerHeroSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.88)',
    marginTop: 2,
  },
  sellerHeroActionBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 14,
  },
  sellerHeroActionText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#1E40AF',
  },
  inviteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 13,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EFE8DE',
  },
  inviteIconCol: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  inviteTextCol: {
    flex: 1,
    marginRight: 10,
  },
  inviteTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  inviteSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
  inviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E40AF',
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  inviteBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  settingsSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EFE8DE',
    paddingVertical: 4,
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  settingIconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTextCol: {
    flex: 1,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  settingTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  rowBadge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    marginLeft: 8,
  },
  rowBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  settingSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  footerContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  footerText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#94A3B8',
  },
});
