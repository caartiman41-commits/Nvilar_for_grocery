import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiClient from '../../../../api/client';
import { useAuthStore } from '../../../auth/authStore';

interface StudioBillingModalProps {
  visible: boolean;
  onClose: () => void;
  shopId?: string;
}

export const StudioBillingModal: React.FC<StudioBillingModalProps> = ({
  visible,
  onClose,
  shopId = 'shop_KD56AHEq_42723',
}) => {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any>(null);

  // Sub-tabs: 'ledger' | 'payouts' | 'plans'
  const [activeTab, setActiveTab] = useState<'ledger' | 'payouts' | 'plans'>('ledger');
  const [payoutCycleMode, setPayoutCycleMode] = useState<'7d' | 'monthly'>('7d');
  const [expandedDayKey, setExpandedDayKey] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'settled' | 'in_escrow'>('all');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Plan switching state
  const [isSwitchingPlan, setIsSwitchingPlan] = useState(false);

  // UPI Update state
  const [upiModalVisible, setUpiModalVisible] = useState(false);
  const [upiInput, setUpiInput] = useState('');
  const [savingUpi, setSavingUpi] = useState(false);

  // Payout Support Tickets & Live Chat state
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [newTicketModalVisible, setNewTicketModalVisible] = useState(false);
  const [ticketCategory, setTicketCategory] = useState('payout_delay');
  const [ticketOrderId, setTicketOrderId] = useState('');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [creatingTicket, setCreatingTicket] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);

  const fetchPayoutTickets = useCallback(async (targetShopId?: string) => {
    try {
      const resolvedShop = targetShopId || shopId || 'shop_KD56AHEq_42723';
      const res = await apiClient.get('/seller/payout-tickets', {
        params: { shop_id: resolvedShop },
      });
      if (res.data?.success && Array.isArray(res.data.tickets)) {
        setTickets(res.data.tickets);
        if (!selectedTicketId && res.data.tickets.length > 0) {
          setSelectedTicketId(res.data.tickets[0].id);
        }
      }
    } catch {
      // silent
    }
  }, [shopId, selectedTicketId]);

  const fetchBilling = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await apiClient.get('/seller/billing', {
        params: {
          shop_id: shopId || 'shop_KD56AHEq_42723',
          user_id: user?.uid || 'usr_ashraf_01',
        },
      });
      if (res.data?.success) {
        setData(res.data);
        setUpiInput(
          res.data.plan?.payout_destination ||
          res.data.shop?.payout_upi_id ||
          'mitreno.boutique@okhdfcbank'
        );
        await fetchPayoutTickets(res.data.shop?.id);
      }
    } catch {
      // silent fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [shopId, user?.uid, fetchPayoutTickets]);

  useEffect(() => {
    if (visible) {
      fetchBilling();
    }
  }, [visible, fetchBilling]);

  const handleSwitchPlan = async (targetPlan: 'pro_monthly' | 'pay_as_you_sell') => {
    setIsSwitchingPlan(true);
    try {
      const res = await apiClient.post('/seller/plan/switch', {
        shop_id: data?.shop?.id || shopId || 'shop_KD56AHEq_42723',
        plan_id: targetPlan,
        payment_method: 'upi',
      });
      if (res.data?.success) {
        Alert.alert(
          targetPlan === 'pro_monthly' ? 'Nvilar Pro Activated!' : 'Plan Updated',
          res.data.message || 'Your commercial plan has been updated.'
        );
        await fetchBilling(true);
        setActiveTab('ledger');
      }
    } catch {
      Alert.alert('Error', 'Unable to switch commercial plan right now.');
    } finally {
      setIsSwitchingPlan(false);
    }
  };

  const handleSaveUpi = async () => {
    if (!upiInput.trim()) return;
    setSavingUpi(true);
    try {
      const res = await apiClient.put('/seller/billing/payout-account', {
        shop_id: data?.shop?.id || shopId || 'shop_KD56AHEq_42723',
        payout_upi_id: upiInput.trim(),
      });
      if (res.data?.success) {
        setUpiModalVisible(false);
        await fetchBilling(true);
        Alert.alert('Updated', 'Your registered UPI / Bank payout handle has been saved.');
      }
    } catch {
      Alert.alert('Error', 'Could not update payout account.');
    } finally {
      setSavingUpi(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!ticketMessage.trim() && !ticketSubject.trim()) {
      Alert.alert('Required', 'Please enter a subject or message for Admin Support.');
      return;
    }
    setCreatingTicket(true);
    try {
      const ledgerList = data?.ledger || [];
      const matched = ledgerList.find((l: any) => l.order_id === ticketOrderId);
      const amountToAttach = matched ? matched.net_seller_share : (data?.summary?.pending_escrow_amount || 0);

      const res = await apiClient.post('/seller/payout-tickets', {
        shop_id: data?.shop?.id || shopId || 'shop_KD56AHEq_42723',
        order_id: ticketOrderId,
        amount: amountToAttach,
        category: ticketCategory,
        subject: ticketSubject.trim() || (ticketOrderId ? `Payout Query for Order #${ticketOrderId}` : 'Payout Settlement Support'),
        message: ticketMessage.trim() || ticketSubject.trim(),
      });
      if (res.data?.success && res.data.ticket) {
        setNewTicketModalVisible(false);
        setTicketSubject('');
        setTicketMessage('');
        setTicketOrderId('');
        await fetchPayoutTickets(data?.shop?.id);
        setSelectedTicketId(res.data.ticket.id);
      }
    } catch {
      Alert.alert('Error', 'Failed to create payout support ticket.');
    } finally {
      setCreatingTicket(false);
    }
  };

  const handleSendChatMessage = async () => {
    if (!selectedTicketId || !chatInput.trim()) return;
    setSendingChat(true);
    try {
      const res = await apiClient.post(`/seller/payout-tickets/${selectedTicketId}/messages`, {
        message: chatInput.trim(),
      });
      if (res.data?.success) {
        setChatInput('');
        await fetchPayoutTickets(data?.shop?.id);
      }
    } catch {
      Alert.alert('Error', 'Failed to send message.');
    } finally {
      setSendingChat(false);
    }
  };

  const isProActive =
    data?.plan?.active_plan_id === 'pro_monthly' || data?.shop?.plan_type === 'pro_monthly';
  const summary = data?.summary || {};
  const plan = data?.plan || {};
  const ledger = data?.ledger || [];
  const invoices = data?.invoices || [];
  const faqs = data?.faqs || [];

  const filteredLedger = ledger.filter((item: any) => {
    if (statusFilter === 'settled') return item.settlement_status === 'settled';
    if (statusFilter === 'in_escrow') return item.settlement_status === 'in_escrow';
    return true;
  });

  const activeTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
        {/* TOP STICKY HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => {
                if (activeTab !== 'ledger') {
                  setActiveTab('ledger');
                } else {
                  onClose();
                }
              }}
              activeOpacity={0.7}
            >
              <Icon name="arrow-left" size={22} color="#0F172A" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <View style={styles.headerBadgeRow}>
                <View style={[styles.planBadge, isProActive ? styles.planBadgePro : styles.planBadgeStarter]}>
                  <View style={[styles.planDot, { backgroundColor: isProActive ? '#D97706' : '#10B981' }]} />
                  <Text style={[styles.planBadgeText, { color: isProActive ? '#92400E' : '#065F46' }]}>
                    {isProActive ? 'Nvilar Pro (0% Fee)' : 'Pay-As-You-Sell (4.5%)'}
                  </Text>
                </View>
                <Text style={styles.shopTag}>{data?.shop?.name || 'Nvilar.com'}</Text>
              </View>
              <Text style={styles.headerTitle}>
                {activeTab === 'payouts'
                  ? 'Payouts & Settlement'
                  : activeTab === 'plans'
                  ? 'Commercial Plans'
                  : 'Billing & Plans'}
              </Text>
            </View>

            {/* Upgrade Plan / Manage Plan PRO / Back to Billing Button */}
            <TouchableOpacity
              style={[styles.managePlanBtn, isProActive && activeTab === 'ledger' ? styles.managePlanBtnPro : styles.managePlanBtnUpgrade]}
              onPress={() => setActiveTab(activeTab === 'ledger' ? 'plans' : 'ledger')}
              activeOpacity={0.85}
            >
              <Icon
                name={activeTab !== 'ledger' ? 'arrow-left' : isProActive ? 'crown' : 'sparkles'}
                size={14}
                color={isProActive && activeTab === 'ledger' ? '#0F172A' : '#FFFFFF'}
              />
              <Text style={[styles.managePlanBtnText, { color: isProActive && activeTab === 'ledger' ? '#0F172A' : '#FFFFFF' }]}>
                {activeTab !== 'ledger' ? 'Back to Billing' : isProActive ? 'Manage Plan' : 'Upgrade Plan'}
              </Text>
              {isProActive && activeTab === 'ledger' && (
                <View style={styles.proMiniTag}>
                  <Text style={styles.proMiniTagText}>PRO</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {loading && !data ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color="#4338CA" />
            <Text style={styles.loaderText}>Syncing live billing & settlement ledger...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 28, 44) }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchBilling(true)}
                tintColor="#4338CA"
              />
            }
          >
            {/* ================================================================= */}
            {/* TAB 1: BILLING & COMMISSION LEDGER (With Vibrant Top 4 KPI Cards) */}
            {/* ================================================================= */}
            {activeTab === 'ledger' && (
              <>
                {/* 4 VIBRANT FINANCIAL KPI CARDS (Shown ONLY on Billing & Commission tab) */}
                <View style={styles.kpiGrid}>
                  {/* 1. Total Customer Sales (Royal Indigo Revenue Theme) */}
                  <View style={[styles.kpiCard, { backgroundColor: '#F8FAFF', borderColor: '#C7D2FE' }]}>
                    <View style={styles.kpiHeaderRow}>
                      <Text style={[styles.kpiLabel, { color: '#1E1B4B' }]}>Total Customer Sales</Text>
                      <View style={[styles.kpiIconBox, { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE', borderWidth: 1 }]}>
                        <Icon name="cash-multiple" size={16} color="#4338CA" />
                      </View>
                    </View>
                    <Text style={[styles.kpiValue, { color: '#4338CA' }]}>
                      ₹{(summary.total_gross_sales || 0).toLocaleString('en-IN')}
                    </Text>
                    <Text style={[styles.kpiSub, { color: '#4338CA' }]}>
                      {(summary.settled_orders_count || 0) + (summary.in_escrow_orders_count || 0)} valid orders ({summary.settled_orders_count || 0} delivered)
                    </Text>
                  </View>

                  {/* 2. Nvilar Commission (Warm Luxury Amber Theme) */}
                  <View style={[styles.kpiCard, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
                    <View style={styles.kpiHeaderRow}>
                      <Text style={[styles.kpiLabel, { color: '#78350F' }]}>
                        {isProActive ? 'Commission (0%)' : `Commission (${plan.active_commission ?? 4.5}%)`}
                      </Text>
                      <View style={[styles.kpiIconBox, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A', borderWidth: 1 }]}>
                        <Icon name="receipt" size={16} color="#B45309" />
                      </View>
                    </View>
                    <Text style={[styles.kpiValue, { color: '#D97706' }]}>
                      ₹{(summary.total_commission_deducted || 0).toLocaleString('en-IN')}
                    </Text>
                    <Text style={[styles.kpiSub, { color: '#B45309' }]}>
                      {isProActive
                        ? '0% Fee • Pro Pass Active'
                        : `+ ₹${(summary.total_platform_gst || 0).toLocaleString('en-IN')} GST (18%)`}
                    </Text>
                  </View>

                  {/* 3. Paid to Your Bank (Rich Emerald Theme) */}
                  <View style={[styles.kpiCard, { backgroundColor: '#F0FDF4', borderColor: '#A7F3D0' }]}>
                    <View style={styles.kpiHeaderRow}>
                      <Text style={[styles.kpiLabel, { color: '#064E3B' }]}>Paid to Your Bank</Text>
                      <View style={[styles.kpiIconBox, { backgroundColor: '#DCFCE7', borderColor: '#A7F3D0', borderWidth: 1 }]}>
                        <Icon name="bank-check" size={16} color="#059669" />
                      </View>
                    </View>
                    <Text style={[styles.kpiValue, { color: '#047857' }]}>
                      ₹{(summary.total_net_disbursed || 0).toLocaleString('en-IN')}
                    </Text>
                    <Text style={[styles.kpiSub, { color: '#059669' }]}>
                      {summary.settled_orders_count || 0} delivered order{(summary.settled_orders_count || 0) === 1 ? '' : 's'} settled
                    </Text>
                  </View>

                  {/* 4. Upcoming Payout (Vibrant Electric Blue Theme) */}
                  <View style={[styles.kpiCard, { backgroundColor: '#F0F7FF', borderColor: '#BFDBFE' }]}>
                    <View style={styles.kpiHeaderRow}>
                      <Text style={[styles.kpiLabel, { color: '#1E3A8A' }]}>Upcoming Payout</Text>
                      <View style={[styles.kpiIconBox, { backgroundColor: '#DBEAFE', borderColor: '#BFDBFE', borderWidth: 1 }]}>
                        <Icon name="clock-fast" size={16} color="#1D4ED8" />
                      </View>
                    </View>
                    <Text style={[styles.kpiValue, { color: '#1D4ED8' }]}>
                      ₹{(summary.pending_escrow_amount || 0).toLocaleString('en-IN')}
                    </Text>
                    <Text style={[styles.kpiSub, { color: '#1D4ED8' }]}>
                      {summary.in_escrow_orders_count || 0} pending • {isProActive ? '24h express' : 'Monday cycle'}
                    </Text>
                  </View>
                </View>

                {/* CENTERED 2-SECTION SUB-TAB BAR */}
                <View style={styles.subTabBar}>
                  <TouchableOpacity
                    style={[styles.subTabBtn, { backgroundColor: '#4F46E5' }]}
                    onPress={() => setActiveTab('ledger')}
                    activeOpacity={0.8}
                  >
                    <Icon name="file-document-outline" size={15} color="#FFFFFF" />
                    <Text style={[styles.subTabText, styles.subTabTextActive]}>
                      Billing & Commission
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.subTabBtn}
                    onPress={() => setActiveTab('payouts')}
                    activeOpacity={0.8}
                  >
                    <Icon name="bank-transfer" size={16} color="#475569" />
                    <Text style={styles.subTabText}>Payouts & Support</Text>
                    {tickets.some((t) => t.status !== 'resolved') && (
                      <View style={styles.ticketBadgeCount}>
                        <Text style={styles.ticketBadgeCountText}>
                          {tickets.filter((t) => t.status !== 'resolved').length}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.sectionStack}>
                {/* Order-by-Order Commission Ledger */}
                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.sectionTitle}>Order-by-Order Commission Ledger</Text>
                      <Text style={styles.sectionSub}>
                        Itemized fee deduction & net earning for every boutique order
                      </Text>
                    </View>
                  </View>

                  {/* Filter Pills */}
                  <View style={styles.filterRow}>
                    {(['all', 'settled', 'in_escrow'] as const).map((st) => (
                      <TouchableOpacity
                        key={st}
                        style={[styles.filterPill, statusFilter === st && styles.filterPillActive]}
                        onPress={() => setStatusFilter(st)}
                      >
                        <Text style={[styles.filterPillText, statusFilter === st && styles.filterPillTextActive]}>
                          {st === 'all' ? 'All Orders' : st === 'settled' ? 'Paid to UPI' : 'Pending Payout'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {filteredLedger.map((item: any) => (
                    <View key={item.order_id} style={styles.ledgerRowCard}>
                      <View style={styles.ledgerRowTop}>
                        <View>
                          <Text style={styles.ledgerOrderId}>#{item.order_id}</Text>
                          <Text style={styles.ledgerDate}>{item.date_formatted}</Text>
                        </View>
                        <View
                          style={[
                            styles.settlementPill,
                            item.settlement_status === 'settled'
                              ? styles.pillSettled
                              : item.settlement_status === 'waived_return'
                              ? styles.pillWaived
                              : styles.pillEscrow,
                          ]}
                        >
                          <Text
                            style={[
                              styles.settlementPillText,
                              item.settlement_status === 'settled'
                                ? { color: '#047857' }
                                : item.settlement_status === 'waived_return'
                                ? { color: '#475569' }
                                : { color: '#B45309' },
                            ]}
                          >
                            {item.settlement_status === 'settled'
                              ? 'Paid to UPI'
                              : item.settlement_status === 'waived_return'
                              ? 'Cancelled / Waived'
                              : 'Pending Payout'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.ledgerMetricsStrip}>
                        <View style={styles.ledgerMetricCol}>
                          <Text style={styles.ledgerMetricLabel}>Customer Paid</Text>
                          <Text style={styles.ledgerMetricVal}>
                            ₹{(item.gross_amount || 0).toLocaleString('en-IN')}
                          </Text>
                        </View>
                        <View style={styles.ledgerMetricCol}>
                          <Text style={styles.ledgerMetricLabel}>
                            Fee ({item.commission_rate ?? 0}%)
                          </Text>
                          <Text style={[styles.ledgerMetricVal, { color: '#059669' }]}>
                            {item.commission_amount > 0
                              ? `₹${item.commission_amount}`
                              : '₹0 (Waived)'}
                          </Text>
                        </View>
                        <View style={[styles.ledgerMetricCol, { alignItems: 'flex-end' }]}>
                          <Text style={styles.ledgerMetricLabel}>Your Earning</Text>
                          <Text style={[styles.ledgerMetricVal, { color: '#047857', fontWeight: '900' }]}>
                            ₹{(item.net_seller_share || 0).toLocaleString('en-IN')}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Monthly GST Invoices */}
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>Monthly Invoices & Tax Statements</Text>
                  <Text style={styles.sectionSub}>
                    Official GST tax statements for your boutique accounting
                  </Text>
                  {invoices.map((inv: any) => (
                    <View key={inv.invoice_id} style={styles.invoiceRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.invoiceMonth}>{inv.billing_month} Statement</Text>
                        <Text style={styles.invoiceRef}>
                          {inv.invoice_id} • {inv.invoice_status}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.invoiceAmount}>
                          ₹{(inv.gross_volume || 0).toLocaleString('en-IN')}
                        </Text>
                        <Text style={styles.invoiceFeeSub}>
                          Fee: ₹{(inv.platform_fee || 0).toLocaleString('en-IN')}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Commercial FAQs */}
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>Commercial Policies & Seller FAQ</Text>
                  {faqs.map((faq: any, idx: number) => {
                    const isOpen = expandedFaq === idx;
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={styles.faqItem}
                        onPress={() => setExpandedFaq(isOpen ? null : idx)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.faqHeader}>
                          <Text style={styles.faqQuestion}>{faq.question}</Text>
                          <Icon
                            name={isOpen ? 'chevron-up' : 'chevron-down'}
                            size={18}
                            color="#64748B"
                          />
                        </View>
                        {isOpen && <Text style={styles.faqAnswer}>{faq.answer}</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </View>
                </View>
              </>
            )}

            {/* ================================================================= */}
            {/* TAB 2: DEDICATED PAYOUTS & SETTLEMENT SUPPORT (No Top 4 KPI Cards)*/}
            {/* ================================================================= */}
            {activeTab === 'payouts' && (
              <>
                <View style={styles.subTabBar}>
                  <TouchableOpacity
                    style={styles.subTabBtn}
                    onPress={() => setActiveTab('ledger')}
                    activeOpacity={0.8}
                  >
                    <Icon name="arrow-left" size={15} color="#4338CA" />
                    <Text style={[styles.subTabText, { color: '#4338CA' }]}>
                      Back to Billing
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.subTabBtn, { backgroundColor: '#059669' }]}
                    onPress={() => setActiveTab('payouts')}
                    activeOpacity={0.8}
                  >
                    <Icon name="bank-transfer" size={16} color="#FFFFFF" />
                    <Text style={[styles.subTabText, styles.subTabTextActive]}>
                      Payouts & Support
                    </Text>
                    {tickets.some((t) => t.status !== 'resolved') && (
                      <View style={styles.ticketBadgeCount}>
                        <Text style={styles.ticketBadgeCountText}>
                          {tickets.filter((t) => t.status !== 'resolved').length}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.sectionStack}>
                  {/* Day-wise Sales & Payout Cycle Card (7-Day & Monthly) */}
                  <View style={styles.sectionCard}>
                    <View style={styles.sectionHeaderRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.sectionTitle}>Day-wise Sales & Payout Cycle</Text>
                        <Text style={styles.sectionSub}>
                          Tap any day to see total sales, payout amount due, and official Admin receipt
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.darkSmallBtn, { backgroundColor: '#059669' }]}
                        onPress={() => setUpiModalVisible(true)}
                      >
                        <Text style={styles.darkSmallBtnText}>
                          UPI: {plan.payout_destination || 'seller@upi'} ✎
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Cycle Switcher: 7-Day Cycle vs Monthly Cycle */}
                    <View style={styles.cycleToggleRow}>
                      <TouchableOpacity
                        style={[
                          styles.cycleToggleBtn,
                          payoutCycleMode === '7d' && styles.cycleToggleBtnActive,
                        ]}
                        onPress={() => setPayoutCycleMode('7d')}
                        activeOpacity={0.85}
                      >
                        <Icon
                          name="calendar-week"
                          size={15}
                          color={payoutCycleMode === '7d' ? '#FFFFFF' : '#475569'}
                        />
                        <Text
                          style={[
                            styles.cycleToggleText,
                            payoutCycleMode === '7d' && styles.cycleToggleTextActive,
                          ]}
                        >
                          7-Day Cycle (Weekly)
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.cycleToggleBtn,
                          payoutCycleMode === 'monthly' && styles.cycleToggleBtnActive,
                        ]}
                        onPress={() => setPayoutCycleMode('monthly')}
                        activeOpacity={0.85}
                      >
                        <Icon
                          name="calendar-month"
                          size={15}
                          color={payoutCycleMode === 'monthly' ? '#FFFFFF' : '#475569'}
                        />
                        <Text
                          style={[
                            styles.cycleToggleText,
                            payoutCycleMode === 'monthly' && styles.cycleToggleTextActive,
                          ]}
                        >
                          Monthly Cycle (1st–31st)
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Day-by-Day Rows */}
                    {(() => {
                      const activeCycleList: any[] =
                        payoutCycleMode === '7d'
                          ? data?.daily_payouts || []
                          : data?.monthly_payouts || [];

                      if (activeCycleList.length === 0) {
                        return (
                          <View style={styles.emptyTicketBox}>
                            <Text style={styles.emptyTicketSub}>No daily payout records available.</Text>
                          </View>
                        );
                      }

                      return activeCycleList.map((dayItem: any) => {
                        const rowKey = `${payoutCycleMode}_${dayItem.date_key}`;
                        const isExpanded = expandedDayKey === rowKey;
                        const isPaid = dayItem.payout_status === 'paid';
                        const hasSales = (dayItem.orders_count || 0) > 0 && (dayItem.net_payout_amount || 0) > 0;
                        const shortParts = String(dayItem.short_date || '06 Oct').split(' ');

                        return (
                          <View
                            key={rowKey}
                            style={[
                              styles.dayCycleCard,
                              isExpanded && styles.dayCycleCardExpanded,
                            ]}
                          >
                            {/* Clickable Day Header Row: Left = Day + Subtle Date, Right = Green Amount + Receipt Badge */}
                            <TouchableOpacity
                              style={styles.dayCycleHeader}
                              onPress={() => setExpandedDayKey(isExpanded ? null : rowKey)}
                              activeOpacity={0.8}
                            >
                              {/* LEFT SIDE */}
                              <View style={styles.dayCycleLeft}>
                                <View
                                  style={[
                                    styles.dayDateBadge,
                                    isPaid
                                      ? { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }
                                      : hasSales
                                      ? { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }
                                      : { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' },
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.dayDateNum,
                                      isPaid
                                        ? { color: '#047857' }
                                        : hasSales
                                        ? { color: '#1D4ED8' }
                                        : { color: '#64748B' },
                                    ]}
                                  >
                                    {shortParts[0] || ''}
                                  </Text>
                                  <Text
                                    style={[
                                      styles.dayDateMon,
                                      isPaid
                                        ? { color: '#059669' }
                                        : hasSales
                                        ? { color: '#2563EB' }
                                        : { color: '#94A3B8' },
                                    ]}
                                  >
                                    {shortParts[1] || ''}
                                  </Text>
                                </View>

                                <View style={{ flex: 1 }}>
                                  <View style={styles.dayTitleLine}>
                                    <Text style={styles.dayNameText}>{dayItem.day_label}</Text>
                                    <Text style={styles.daySubtleDateText}>
                                      {dayItem.date_formatted}
                                    </Text>
                                  </View>
                                  <Text style={styles.dayOrderSummaryText}>
                                    {dayItem.orders_count > 0
                                      ? `${dayItem.orders_count} Order${dayItem.orders_count === 1 ? '' : 's'} • Sale: ₹${(dayItem.gross_sales || 0).toLocaleString('en-IN')}`
                                      : 'No sales on this day'}
                                  </Text>
                                </View>
                              </View>

                              {/* RIGHT SIDE: Bold Green Amount + Receipt / Status Pill */}
                              <View style={styles.dayCycleRight}>
                                <Text
                                  style={[
                                    styles.dayGreenAmount,
                                    !hasSales && { color: '#94A3B8' },
                                  ]}
                                >
                                  ₹{(dayItem.net_payout_amount || 0).toLocaleString('en-IN')}
                                </Text>
                                {isPaid ? (
                                  <View style={styles.receiptPaidPill}>
                                    <Icon name="check-decagram" size={12} color="#047857" />
                                    <Text style={styles.receiptPaidPillText}>Receipt • Paid</Text>
                                  </View>
                                ) : hasSales ? (
                                  <View style={styles.pendingPayoutPill}>
                                    <Icon name="clock-outline" size={11} color="#1D4ED8" />
                                    <Text style={styles.pendingPayoutPillText}>Pending Payout</Text>
                                  </View>
                                ) : (
                                  <Text style={styles.noPayoutSubText}>No Payout</Text>
                                )}
                              </View>
                            </TouchableOpacity>

                            {/* CLICK-TO-EXPAND DAY HISAAB & OFFICIAL RECEIPT */}
                            {isExpanded && (
                              <View style={styles.dayExpandedBody}>
                                {/* 3-Column Hisaab Summary */}
                                <View style={styles.hisaabSummaryRow}>
                                  <View style={[styles.hisaabBox, { backgroundColor: '#F8FAFF', borderColor: '#C7D2FE' }]}>
                                    <Text style={[styles.hisaabLabel, { color: '#3730A3' }]}>Total Sale</Text>
                                    <Text style={[styles.hisaabVal, { color: '#4338CA' }]}>
                                      ₹{(dayItem.gross_sales || 0).toLocaleString('en-IN')}
                                    </Text>
                                    <Text style={styles.hisaabSub}>
                                      {dayItem.orders_count || 0} valid order{dayItem.orders_count === 1 ? '' : 's'}
                                    </Text>
                                  </View>

                                  <View style={[styles.hisaabBox, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
                                    <Text style={[styles.hisaabLabel, { color: '#92400E' }]}>
                                      Fee ({dayItem.commission_rate ?? 0}%)
                                    </Text>
                                    <Text style={[styles.hisaabVal, { color: '#D97706' }]}>
                                      - ₹{(dayItem.commission_amount || 0).toLocaleString('en-IN')}
                                    </Text>
                                    <Text style={styles.hisaabSub}>
                                      {dayItem.commission_rate === 0 ? '0% Pro VIP' : 'Platform fee'}
                                    </Text>
                                  </View>

                                  <View style={[styles.hisaabBox, { backgroundColor: '#F0FDF4', borderColor: '#86EFAC' }]}>
                                    <Text style={[styles.hisaabLabel, { color: '#065F46' }]}>Net Payout</Text>
                                    <Text style={[styles.hisaabVal, { color: '#047857' }]}>
                                      ₹{(dayItem.net_payout_amount || 0).toLocaleString('en-IN')}
                                    </Text>
                                    <Text style={[styles.hisaabSub, { color: '#059669' }]}>
                                      {isPaid ? 'Paid to UPI ✓' : 'Payable to UPI'}
                                    </Text>
                                  </View>
                                </View>

                                {/* Official Payment Receipt Banner (If Paid by Admin) */}
                                {isPaid && (
                                  <View style={styles.officialReceiptCard}>
                                    <View style={styles.officialReceiptTop}>
                                      <View style={styles.officialReceiptIcon}>
                                        <Icon name="receipt-text-check" size={18} color="#FFFFFF" />
                                      </View>
                                      <View style={{ flex: 1 }}>
                                        <Text style={styles.officialReceiptTitle}>
                                          Official Payment Receipt • {dayItem.receipt_id}
                                        </Text>
                                        <Text style={styles.officialReceiptMeta}>
                                          UTR: {dayItem.utr_reference} • UPI: {dayItem.payout_upi_id || plan.payout_destination}
                                        </Text>
                                        {dayItem.paid_at ? (
                                          <Text style={styles.officialReceiptTime}>
                                            Settled on {dayItem.paid_at}
                                          </Text>
                                        ) : null}
                                      </View>
                                    </View>
                                  </View>
                                )}

                                {/* Orders Placed on This Day */}
                                {Array.isArray(dayItem.orders) && dayItem.orders.length > 0 ? (
                                  <View style={styles.dayOrdersListWrap}>
                                    <View style={styles.dayOrdersListHeader}>
                                      <Text style={styles.dayOrdersListTitle}>
                                        Orders on {dayItem.day_label} ({dayItem.date_formatted})
                                      </Text>
                                      <TouchableOpacity
                                        onPress={() => {
                                          setTicketOrderId(dayItem.orders[0]?.order_id || '');
                                          setTicketSubject(
                                            `Payout Query for ${dayItem.day_label} (${dayItem.date_formatted})`
                                          );
                                          setNewTicketModalVisible(true);
                                        }}
                                      >
                                        <Text style={styles.askAdminLink}>Ask Admin →</Text>
                                      </TouchableOpacity>
                                    </View>

                                    {dayItem.orders.map((ord: any) => (
                                      <View key={ord.order_id} style={styles.dayOrderMiniRow}>
                                        <View>
                                          <Text style={styles.dayOrderMiniId}>#{ord.order_id}</Text>
                                          <Text style={styles.dayOrderMiniTime}>
                                            {ord.time_formatted || ord.date_formatted} • {String(ord.order_status || '').toUpperCase()}
                                          </Text>
                                        </View>
                                        <View style={{ alignItems: 'flex-end' }}>
                                          <Text style={styles.dayOrderMiniNet}>
                                            ₹{(ord.net_seller_share || 0).toLocaleString('en-IN')}
                                          </Text>
                                          <Text style={styles.dayOrderMiniGross}>
                                            Sale: ₹{(ord.gross_amount || 0).toLocaleString('en-IN')}
                                          </Text>
                                        </View>
                                      </View>
                                    ))}
                                  </View>
                                ) : (
                                  <Text style={styles.noOrdersDayNote}>
                                    No customer orders were placed on {dayItem.date_formatted}.
                                  </Text>
                                )}
                              </View>
                            )}
                          </View>
                        );
                      });
                    })()}
                  </View>


                {/* Admin Payout Support Desk (Smart Ticket + Live Chat) */}
                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.sectionTitle}>Admin Payout Support & Live Chat</Text>
                      <Text style={styles.sectionSub}>
                        Raise a payout ticket and chat directly with Nvilar Finance Desk
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.amberBtn}
                      onPress={() => setNewTicketModalVisible(true)}
                    >
                      <Text style={styles.amberBtnText}>+ New Ticket</Text>
                    </TouchableOpacity>
                  </View>

                  {tickets.length === 0 ? (
                    <View style={styles.emptyTicketBox}>
                      <Icon name="shield-check-outline" size={32} color="#10B981" />
                      <Text style={styles.emptyTicketTitle}>No Active Payout Issues</Text>
                      <Text style={styles.emptyTicketSub}>
                        If any payout is delayed or you need UTR verification, tap "+ New Ticket" to start a live chat with Admin.
                      </Text>
                    </View>
                  ) : (
                    <View style={{ marginTop: 10 }}>
                      {/* Horizontal Ticket Selector Pills */}
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={{ marginBottom: 12 }}
                      >
                        {tickets.map((t) => {
                          const selected = t.id === (activeTicket?.id || '');
                          return (
                            <TouchableOpacity
                              key={t.id}
                              style={[styles.ticketChip, selected && styles.ticketChipSelected]}
                              onPress={() => setSelectedTicketId(t.id)}
                            >
                              <Text
                                style={[
                                  styles.ticketChipTitle,
                                  selected && { color: '#FFFFFF' },
                                ]}
                              >
                                #{t.id} {t.order_id ? `• #${t.order_id}` : ''}
                              </Text>
                              <Text
                                style={[
                                  styles.ticketChipStatus,
                                  selected && { color: '#FDE68A' },
                                ]}
                              >
                                {String(t.status || 'open').toUpperCase()}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>

                      {/* Active Ticket Chat Box */}
                      {activeTicket && (
                        <View style={styles.chatThreadBox}>
                          <View style={styles.chatThreadHeader}>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.chatThreadSubject}>
                                #{activeTicket.id}: {activeTicket.subject}
                              </Text>
                              <Text style={styles.chatThreadMeta}>
                                Amount: ₹{(activeTicket.amount || 0).toLocaleString('en-IN')}
                                {activeTicket.utr_reference
                                  ? ` • UTR: ${activeTicket.utr_reference}`
                                  : ''}
                              </Text>
                            </View>
                            <View style={styles.chatStatusTag}>
                              <Text style={styles.chatStatusTagText}>
                                {String(activeTicket.status || 'open').toUpperCase()}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.chatMessagesArea}>
                            {(activeTicket.messages || []).map((m: any) => {
                              const isSeller = m.sender_role === 'seller';
                              return (
                                <View
                                  key={m.id}
                                  style={[
                                    styles.chatBubbleWrap,
                                    isSeller ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' },
                                  ]}
                                >
                                  <Text style={styles.chatSenderLabel}>
                                    {isSeller ? 'You (Seller)' : 'Nvilar Admin Desk'}
                                  </Text>
                                  <View
                                    style={[
                                      styles.chatBubble,
                                      isSeller ? styles.chatBubbleSeller : styles.chatBubbleAdmin,
                                    ]}
                                  >
                                    <Text
                                      style={[
                                        styles.chatBubbleText,
                                        isSeller ? { color: '#FFFFFF' } : { color: '#0F172A' },
                                      ]}
                                    >
                                      {m.message}
                                    </Text>
                                  </View>
                                </View>
                              );
                            })}
                          </View>

                          <View style={styles.chatInputRow}>
                            <TextInput
                              style={styles.chatTextInput}
                              value={chatInput}
                              onChangeText={setChatInput}
                              placeholder="Reply to Nvilar Admin Desk..."
                              placeholderTextColor="#94A3B8"
                            />
                            <TouchableOpacity
                              style={styles.chatSendBtn}
                              onPress={handleSendChatMessage}
                              disabled={sendingChat}
                            >
                              <Text style={styles.chatSendBtnText}>
                                {sendingChat ? '...' : 'Send'}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                    </View>
                  )}
                </View>
                </View>
              </>
            )}

            {/* ================================================================= */}
            {/* TAB 3: COMMERCIAL PLANS (Pay-As-You-Sell vs Nvilar Pro Pass)     */}
            {/* ================================================================= */}
            {activeTab === 'plans' && (
              <View style={styles.sectionStack}>
                {/* Plan 1: Pay-As-You-Sell */}
                <View style={[styles.planCard, !isProActive && styles.planCardActive]}>
                  <View style={styles.planCardTopRow}>
                    <Text style={styles.planTierPill}>Starter Boutique</Text>
                    {!isProActive && <Text style={styles.activePlanTag}>ACTIVE PLAN</Text>}
                  </View>
                  <Text style={styles.planCardTitle}>Pay-As-You-Sell</Text>
                  <Text style={styles.planCardSub}>
                    Zero upfront monthly rent. Pay only 4.5% when an order is delivered.
                  </Text>
                  <View style={styles.planPriceBox}>
                    <Text style={styles.planPriceBig}>₹0 / month</Text>
                    <Text style={styles.planFeeRight}>4.5% Fee per sale</Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.planActionBtn,
                      !isProActive ? styles.planActionBtnDisabled : styles.planActionBtnDark,
                    ]}
                    disabled={!isProActive || isSwitchingPlan}
                    onPress={() => handleSwitchPlan('pay_as_you_sell')}
                  >
                    <Text
                      style={[
                        styles.planActionBtnText,
                        !isProActive && { color: '#64748B' },
                      ]}
                    >
                      {!isProActive ? 'Current Active Plan' : 'Switch to Pay-As-You-Sell'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Plan 2: Nvilar Pro Boutique Pass */}
                <View style={[styles.planCard, isProActive && styles.planCardActive]}>
                  <View style={styles.planCardTopRow}>
                    <Text style={[styles.planTierPill, { backgroundColor: '#FEF3C7', color: '#92400E' }]}>
                      VIP Partner • 0% Fee
                    </Text>
                    {isProActive && <Text style={styles.activePlanTag}>ACTIVE VIP PLAN</Text>}
                  </View>
                  <Text style={styles.planCardTitle}>Nvilar Pro Boutique Pass</Text>
                  <Text style={styles.planCardSub}>
                    Keep 100% of your sales earnings with 0% commission, 2x Hyperlocal boost & 24h express payouts.
                  </Text>
                  <View style={styles.planPriceBox}>
                    <Text style={styles.planPriceBig}>₹1,999 / month</Text>
                    <Text style={[styles.planFeeRight, { color: '#047857' }]}>0% Commission</Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.planActionBtn,
                      isProActive ? styles.planActionBtnDisabled : styles.planActionBtnAmber,
                    ]}
                    disabled={isProActive || isSwitchingPlan}
                    onPress={() => handleSwitchPlan('pro_monthly')}
                  >
                    <Text
                      style={[
                        styles.planActionBtnText,
                        isProActive && { color: '#047857' },
                      ]}
                    >
                      {isProActive ? 'Current Active VIP Plan' : 'Upgrade to Pro (₹1,999/mo)'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        )}

        {/* MODAL: UPDATE UPI / BANK */}
        <Modal visible={upiModalVisible} transparent animationType="fade">
          <View style={styles.overlayModal}>
            <View style={styles.dialogCard}>
              <Text style={styles.dialogTitle}>Update Payout UPI / Bank ID</Text>
              <Text style={styles.dialogSub}>
                Enter your verified UPI ID where all boutique payouts should be transferred.
              </Text>
              <TextInput
                style={styles.dialogInput}
                value={upiInput}
                onChangeText={setUpiInput}
                placeholder="e.g. mitreno.boutique@okhdfcbank"
                placeholderTextColor="#94A3B8"
              />
              <View style={styles.dialogBtnRow}>
                <TouchableOpacity
                  style={styles.dialogCancelBtn}
                  onPress={() => setUpiModalVisible(false)}
                >
                  <Text style={styles.dialogCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dialogConfirmBtn}
                  onPress={handleSaveUpi}
                  disabled={savingUpi}
                >
                  <Text style={styles.dialogConfirmText}>
                    {savingUpi ? 'Saving...' : 'Save Account'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* MODAL: NEW PAYOUT SUPPORT TICKET */}
        <Modal visible={newTicketModalVisible} transparent animationType="fade">
          <View style={styles.overlayModal}>
            <View style={styles.dialogCard}>
              <Text style={styles.dialogTitle}>Raise Payout Support Ticket</Text>
              <Text style={styles.dialogSub}>
                Starts a direct live chat thread with the Nvilar Admin Finance Desk.
              </Text>
              <TextInput
                style={styles.dialogInput}
                value={ticketOrderId}
                onChangeText={setTicketOrderId}
                placeholder="Order ID (Optional, e.g. MIT-29310)"
                placeholderTextColor="#94A3B8"
              />
              <TextInput
                style={styles.dialogInput}
                value={ticketSubject}
                onChangeText={setTicketSubject}
                placeholder="Subject (e.g. Payout delayed for delivered order)"
                placeholderTextColor="#94A3B8"
              />
              <TextInput
                style={[styles.dialogInput, { height: 80, textAlignVertical: 'top' }]}
                multiline
                value={ticketMessage}
                onChangeText={setTicketMessage}
                placeholder="Describe your payout issue for Admin..."
                placeholderTextColor="#94A3B8"
              />
              <View style={styles.dialogBtnRow}>
                <TouchableOpacity
                  style={styles.dialogCancelBtn}
                  onPress={() => setNewTicketModalVisible(false)}
                >
                  <Text style={styles.dialogCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dialogConfirmBtn}
                  onPress={handleCreateTicket}
                  disabled={creatingTicket}
                >
                  <Text style={styles.dialogConfirmText}>
                    {creatingTicket ? 'Creating...' : 'Submit & Chat'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
    borderWidth: 1,
    gap: 5,
  },
  planBadgePro: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  planBadgeStarter: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  planDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  shopTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  managePlanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  managePlanBtnPro: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
  },
  managePlanBtnUpgrade: {
    backgroundColor: '#D97706',
    borderColor: '#B45309',
  },
  managePlanBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  proMiniTag: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  proMiniTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#6B21A8',
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 14,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  kpiCard: {
    width: '48.4%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 2,
  },
  kpiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  kpiLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    marginRight: 6,
  },
  kpiIconBox: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: {
    fontSize: 21,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  kpiSub: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
    marginTop: 4,
  },
  subTabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 14,
    marginBottom: 14,
    gap: 6,
  },
  subTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  subTabBtnActive: {
    backgroundColor: '#0F172A',
  },
  subTabText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#475569',
  },
  subTabTextActive: {
    color: '#FFFFFF',
  },
  ticketBadgeCount: {
    backgroundColor: '#F59E0B',
    borderRadius: 99,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  ticketBadgeCountText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#0F172A',
  },
  sectionStack: {
    gap: 14,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  sectionSub: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  filterPillActive: {
    backgroundColor: '#0F172A',
  },
  filterPillText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#475569',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  ledgerRowCard: {
    borderWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  ledgerRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ledgerOrderId: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#0F172A',
  },
  ledgerDate: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  settlementPill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 99,
    borderWidth: 1,
  },
  pillSettled: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  pillEscrow: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  pillWaived: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  settlementPillText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  ledgerMetricsStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
  },
  ledgerMetricCol: {
    flex: 1,
  },
  ledgerMetricLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
  },
  ledgerMetricVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  invoiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 8,
  },
  invoiceMonth: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  invoiceRef: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  invoiceAmount: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#0F172A',
  },
  invoiceFeeSub: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  faqItem: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingVertical: 10,
    marginTop: 6,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  faqQuestion: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  faqAnswer: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
    marginTop: 6,
    lineHeight: 18,
  },
  darkSmallBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  darkSmallBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  amberBtn: {
    backgroundColor: '#D97706',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  amberBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  payoutInfoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  payoutInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  payoutInfoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  payoutInfoValue: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#0F172A',
  },
  utrFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 6,
  },
  utrText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  askAdminLink: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptyTicketBox: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 6,
  },
  emptyTicketTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptyTicketSub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  ticketChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  ticketChipSelected: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  ticketChipTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  ticketChipStatus: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    marginTop: 2,
  },
  chatThreadBox: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
  },
  chatThreadHeader: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatThreadSubject: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  chatThreadMeta: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginTop: 2,
  },
  chatStatusTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
  },
  chatStatusTagText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#92400E',
  },
  chatMessagesArea: {
    padding: 12,
    gap: 10,
  },
  chatBubbleWrap: {
    marginBottom: 6,
  },
  chatSenderLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
  },
  chatBubble: {
    maxWidth: '85%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  chatBubbleSeller: {
    backgroundColor: '#0F172A',
  },
  chatBubbleAdmin: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chatBubbleText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  chatInputRow: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 8,
  },
  chatTextInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12.5,
    color: '#0F172A',
  },
  chatSendBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatSendBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  planCardActive: {
    borderColor: '#10B981',
  },
  planCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planTierPill: {
    fontSize: 10.5,
    fontWeight: '800',
    backgroundColor: '#F1F5F9',
    color: '#334155',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 99,
  },
  activePlanTag: {
    fontSize: 10,
    fontWeight: '900',
    color: '#047857',
  },
  planCardTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  planCardSub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 4,
    lineHeight: 17,
  },
  planPriceBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  planPriceBig: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  planFeeRight: {
    fontSize: 13,
    fontWeight: '800',
    color: '#B45309',
  },
  planActionBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  planActionBtnDark: {
    backgroundColor: '#0F172A',
  },
  planActionBtnAmber: {
    backgroundColor: '#D97706',
  },
  planActionBtnDisabled: {
    backgroundColor: '#F1F5F9',
  },
  planActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  overlayModal: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  dialogCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    gap: 10,
  },
  dialogTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  dialogSub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  dialogInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  dialogBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  dialogCancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  dialogCancelText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#475569',
  },
  dialogConfirmBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    alignItems: 'center',
  },
  dialogConfirmText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cycleToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    gap: 6,
    marginBottom: 12,
  },
  cycleToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 9,
    gap: 5,
  },
  cycleToggleBtnActive: {
    backgroundColor: '#0F172A',
  },
  cycleToggleText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
  },
  cycleToggleTextActive: {
    color: '#FFFFFF',
  },
  dayCycleCard: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 9,
    overflow: 'hidden',
  },
  dayCycleCardExpanded: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  dayCycleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  dayCycleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  dayDateBadge: {
    width: 42,
    height: 42,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDateNum: {
    fontSize: 13.5,
    fontWeight: '900',
  },
  dayDateMon: {
    fontSize: 9.5,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  dayTitleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  dayNameText: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#0F172A',
  },
  daySubtleDateText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#94A3B8',
  },
  dayOrderSummaryText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  dayCycleRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  dayGreenAmount: {
    fontSize: 17,
    fontWeight: '900',
    color: '#047857',
    letterSpacing: -0.3,
  },
  receiptPaidPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 99,
    marginTop: 3,
  },
  receiptPaidPillText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#047857',
  },
  pendingPayoutPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 99,
    marginTop: 3,
  },
  pendingPayoutPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  noPayoutSubText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 2,
  },
  dayExpandedBody: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    padding: 12,
    gap: 10,
  },
  hisaabSummaryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  hisaabBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 9,
  },
  hisaabLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  hisaabVal: {
    fontSize: 14,
    fontWeight: '900',
    marginTop: 2,
  },
  hisaabSub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  officialReceiptCard: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#6EE7B7',
    borderRadius: 12,
    padding: 10,
  },
  officialReceiptTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  officialReceiptIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  officialReceiptTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#064E3B',
  },
  officialReceiptMeta: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
    marginTop: 2,
  },
  officialReceiptTime: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#059669',
    marginTop: 1,
  },
  dayOrdersListWrap: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
    backgroundColor: '#F8FAFC',
    gap: 6,
  },
  dayOrdersListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayOrdersListTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  dayOrderMiniRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  dayOrderMiniId: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  dayOrderMiniTime: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  dayOrderMiniNet: {
    fontSize: 13,
    fontWeight: '900',
    color: '#047857',
  },
  dayOrderMiniGross: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
  },
  noOrdersDayNote: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 4,
  },
});

