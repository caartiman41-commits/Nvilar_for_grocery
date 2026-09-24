import React, { useState, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FastImage from 'react-native-fast-image';

export type ChatThemeMode = 'white' | 'dusk' | 'ivory';

export interface ChatInfoModalProps {
  visible: boolean;
  onClose: () => void;
  sellerName: string;
  sellerAvatar?: string;
  isVerified?: boolean;
  isBlocked: boolean;
  activeTheme: ChatThemeMode;
  onToggleBlock: () => void;
  onDeleteChat: () => void;
  onSelectTheme: (theme: ChatThemeMode) => void;
  onReportSeller: (reason: string) => void;
}

export const THEME_OPTIONS: { id: ChatThemeMode; label: string; previewBg: string; border: string }[] = [
  { id: 'white', label: 'Pure Optical White', previewBg: '#FFFFFF', border: '#E2E8F0' },
  { id: 'dusk', label: 'Soft Luxury Dusk', previewBg: '#F1F5F9', border: '#CBD5E1' },
  { id: 'ivory', label: 'Warm Ivory', previewBg: '#FAF7F2', border: '#EFE8DE' },
];

export const ChatInfoModal: React.FC<ChatInfoModalProps> = memo(({
  visible,
  onClose,
  sellerName,
  sellerAvatar,
  isVerified = true,
  isBlocked,
  activeTheme,
  onToggleBlock,
  onDeleteChat,
  onSelectTheme,
  onReportSeller,
}) => {
  const insets = useSafeAreaInsets();
  const [showReportSubmenu, setShowReportSubmenu] = useState(false);

  const reportReasons = [
    'Counterfeit / Non-genuine item',
    'Unresponsive / Bargain harassment',
    'Off-platform payment request',
    'Spam or inappropriate behavior',
  ];

  const handleReportPress = () => {
    setShowReportSubmenu(true);
  };

  const handleReasonSelected = (reason: string) => {
    setShowReportSubmenu(false);
    onClose();
    onReportSeller(reason);
    Alert.alert(
      'Report Submitted',
      `Thank you for reporting ${sellerName}. Reason: "${reason}". Our Mitreno Trust & Safety team will inspect this conversation within 2 hours.`,
      [{ text: 'OK' }]
    );
  };

  const handleBlockPress = () => {
    Alert.alert(
      isBlocked ? 'Unblock Boutique?' : 'Block Boutique?',
      isBlocked
        ? `Are you sure you want to unblock ${sellerName}? You will be able to resume bargaining and messages.`
        : `Are you sure you want to block ${sellerName}? They will no longer be able to send counter-offers or chat with you.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isBlocked ? 'Unblock' : 'Block',
          style: isBlocked ? 'default' : 'destructive',
          onPress: () => {
            onToggleBlock();
            onClose();
          },
        },
      ]
    );
  };

  const handleDeletePress = () => {
    Alert.alert(
      'Delete Chat History?',
      `This will permanently erase all bargain messages with ${sellerName}. This action cannot be reversed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: () => {
            onDeleteChat();
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={[styles.sheetContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
              {/* Drag Handle */}
              <View style={styles.handleBar} />

              {/* Modal Header / Boutique Badge */}
              <View style={styles.headerRow}>
                <View style={styles.boutiqueSummary}>
                  {sellerAvatar ? (
                    <FastImage source={{ uri: sellerAvatar }} style={styles.boutiqueAvatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarPlaceholderText}>{sellerName.slice(0, 2).toUpperCase()}</Text>
                    </View>
                  )}
                  <View style={styles.boutiqueDetails}>
                    <View style={styles.nameRow}>
                      <Text style={styles.boutiqueName}>{sellerName}</Text>
                      {isVerified && (
                        <Icon name="check-decagram" size={14} color="#2563EB" style={{ marginLeft: 4 }} />
                      )}
                    </View>
                    <Text style={styles.boutiqueSubtitle}>Mitreno Verified Partner</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* REPORT REASONS SUBMENU */}
              {showReportSubmenu ? (
                <View style={styles.reportMenu}>
                  <View style={styles.reportHeader}>
                    <TouchableOpacity
                      onPress={() => setShowReportSubmenu(false)}
                      style={styles.reportBackBtn}
                    >
                      <Icon name="arrow-left" size={18} color="#0F172A" />
                    </TouchableOpacity>
                    <Text style={styles.reportTitle}>Select Report Reason</Text>
                  </View>
                  {reportReasons.map((reason, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.reasonOption}
                      onPress={() => handleReasonSelected(reason)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.reasonText}>{reason}</Text>
                      <Icon name="chevron-right" size={18} color="#94A3B8" />
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                /* MAIN ACTIONS LIST */
                <View style={styles.optionsList}>
                  {/* Option 1: Report */}
                  <TouchableOpacity
                    style={styles.optionRow}
                    onPress={handleReportPress}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
                      <Icon name="flag-outline" size={18} color="#DC2626" />
                    </View>
                    <View style={styles.optionTextCol}>
                      <Text style={styles.optionTitle}>Report Boutique / Seller</Text>
                      <Text style={styles.optionSubtitle}>
                        Flag policy violations, fake listings, or disputes
                      </Text>
                    </View>
                    <Icon name="chevron-right" size={20} color="#CBD5E1" />
                  </TouchableOpacity>

                  {/* Option 2: Block / Unblock */}
                  <TouchableOpacity
                    style={styles.optionRow}
                    onPress={handleBlockPress}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.iconBox,
                        { backgroundColor: isBlocked ? '#D1FAE5' : '#FEF3C7' },
                      ]}
                    >
                      <Icon
                        name={isBlocked ? 'shield-check-outline' : 'block-helper'}
                        size={18}
                        color={isBlocked ? '#059669' : '#D97706'}
                      />
                    </View>
                    <View style={styles.optionTextCol}>
                      <Text style={[styles.optionTitle, isBlocked && { color: '#059669' }]}>
                        {isBlocked ? 'Unblock Boutique' : 'Block Seller'}
                      </Text>
                      <Text style={styles.optionSubtitle}>
                        {isBlocked
                          ? 'Allow new messages and counter-offers'
                          : 'Prevent this seller from sending messages'}
                      </Text>
                    </View>
                    <Icon name="chevron-right" size={20} color="#CBD5E1" />
                  </TouchableOpacity>

                  {/* Option 3: Delete Chat History */}
                  <TouchableOpacity
                    style={styles.optionRow}
                    onPress={handleDeletePress}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
                      <Icon name="delete-outline" size={18} color="#DC2626" />
                    </View>
                    <View style={styles.optionTextCol}>
                      <Text style={[styles.optionTitle, { color: '#DC2626' }]}>
                        Delete Chat History
                      </Text>
                      <Text style={styles.optionSubtitle}>
                        Permanently clear all negotiation messages
                      </Text>
                    </View>
                    <Icon name="chevron-right" size={20} color="#CBD5E1" />
                  </TouchableOpacity>

                  {/* Option 4: Theme / Wallpaper Selector */}
                  <View style={styles.themeSection}>
                    <View style={styles.themeHeaderRow}>
                      <View style={[styles.iconBox, { backgroundColor: '#EEF2FF', marginRight: 12 }]}>
                        <Icon name="palette-outline" size={18} color="#4F46E5" />
                      </View>
                      <View style={styles.optionTextCol}>
                        <Text style={styles.optionTitle}>Change Wallpaper / Theme</Text>
                        <Text style={styles.optionSubtitle}>
                          Select ambient background for your boutique chat
                        </Text>
                      </View>
                    </View>

                    {/* Theme Swatches Row */}
                    <View style={styles.themeSwatchesRow}>
                      {THEME_OPTIONS.map((theme) => {
                        const isSelected = activeTheme === theme.id;
                        return (
                          <TouchableOpacity
                            key={theme.id}
                            style={[
                              styles.themeCard,
                              { backgroundColor: theme.previewBg, borderColor: theme.border },
                              isSelected && styles.themeCardSelected,
                            ]}
                            onPress={() => onSelectTheme(theme.id)}
                            activeOpacity={0.8}
                          >
                            <View style={styles.themeCardHeader}>
                              <View
                                style={[
                                  styles.swatchDot,
                                  { backgroundColor: theme.previewBg, borderColor: '#CBD5E1' },
                                ]}
                              />
                              {isSelected && (
                                <Icon name="check-circle" size={15} color="#2563EB" />
                              )}
                            </View>
                            <Text
                              style={[
                                styles.themeLabel,
                                isSelected && styles.themeLabelSelected,
                              ]}
                              numberOfLines={2}
                            >
                              {theme.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  handleBar: {
    width: 44,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  boutiqueSummary: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boutiqueAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
  },
  avatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarPlaceholderText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
  },
  boutiqueDetails: {
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boutiqueName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  boutiqueSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
  },
  optionsList: {
    paddingTop: 12,
    gap: 6,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionTextCol: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  optionSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  themeSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  themeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  themeSwatchesRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  themeCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 10,
    minHeight: 70,
    justifyContent: 'space-between',
  },
  themeCardSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#F8FAFC',
  },
  themeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  swatchDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
  },
  themeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginTop: 6,
  },
  themeLabelSelected: {
    color: '#1E293B',
    fontWeight: '800',
  },
  reportMenu: {
    paddingTop: 12,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  reportBackBtn: {
    padding: 6,
    marginRight: 8,
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  reasonText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#334155',
  },
});
