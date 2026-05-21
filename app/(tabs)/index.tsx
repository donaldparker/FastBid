import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

const intakeActions: {
  title: string;
  detail: string;
  icon: MaterialIconName;
  accent: string;
  background: string;
}[] = [
  {
    title: 'Add job photos',
    detail: 'Fence, drywall, deck, floor, roof, or whatever needs pricing.',
    icon: 'add-a-photo',
    accent: '#116466',
    background: '#E0F2F1',
  },
  {
    title: 'Record voice notes',
    detail: 'Talk like you are explaining the job to your helper.',
    icon: 'keyboard-voice',
    accent: '#7C2D12',
    background: '#FFEDD5',
  },
  {
    title: 'Drop old invoices',
    detail: 'FastBid pulls prices, scope language, and lessons learned.',
    icon: 'receipt-long',
    accent: '#1D4ED8',
    background: '#DBEAFE',
  },
];

const lineItems = [
  ['Demo and haul away', '$340'],
  ['Replacement boards and hardware', '$620'],
  ['Two-person crew, one day', '$860'],
  ['Overhead and target margin', '$280'],
];

const riskFlags = [
  'Confirm existing posts are reusable before final quote.',
  'Last similar repair ran half a day long because the gate sagged.',
  'Exclude stain unless the customer approves it as an add-on.',
];

export default function BidScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoMark}>
            <MaterialIcons name="bolt" size={28} color="#FFFFFF" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.kicker}>FastBid</Text>
            <Text style={styles.title}>Photos and voice notes into a clean bid.</Text>
          </View>
        </View>

        <View style={styles.quickJob}>
          <View style={styles.quickJobTop}>
            <View>
              <Text style={styles.sectionLabel}>Current job</Text>
              <Text style={styles.jobTitle}>Johnson fence repair</Text>
            </View>
            <View style={styles.statusPill}>
              <MaterialIcons name="auto-awesome" size={15} color="#14532D" />
              <Text style={styles.statusText}>Draft ready</Text>
            </View>
          </View>

          <View style={styles.voiceNote}>
            <MaterialIcons name="graphic-eq" size={28} color="#0F172A" />
            <Text style={styles.voiceCopy}>
              Customer needs roughly 18 feet replaced, haul-away included, stain optional.
            </Text>
          </View>

          <View style={styles.actionGrid}>
            {intakeActions.map((action) => (
              <Pressable key={action.title} style={styles.actionButton}>
                <View style={[styles.actionIcon, { backgroundColor: action.background }]}>
                  <MaterialIcons name={action.icon} size={24} color={action.accent} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionDetail}>{action.detail}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.bidPreview}>
          <View style={styles.previewTop}>
            <View>
              <Text style={styles.darkSectionLabel}>Recommended quote</Text>
              <Text style={styles.price}>$2,100</Text>
            </View>
            <View style={styles.confidence}>
              <Text style={styles.confidenceValue}>82%</Text>
              <Text style={styles.confidenceLabel}>confidence</Text>
            </View>
          </View>

          <Text style={styles.scopeText}>
            Replace damaged fence boards, reuse existing posts if sound, install matching hardware,
            and haul away damaged material. Stain and gate adjustment are separate add-ons.
          </Text>

          <View style={styles.table}>
            {lineItems.map(([label, value]) => (
              <View key={label} style={styles.tableRow}>
                <Text style={styles.tableLabel}>{label}</Text>
                <Text style={styles.tableValue}>{value}</Text>
              </View>
            ))}
          </View>

          <View style={styles.buttonRow}>
            <Pressable style={styles.primaryButton}>
              <MaterialIcons name="send" size={18} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Send bid</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton}>
              <MaterialIcons name="edit" size={18} color="#0F172A" />
              <Text style={styles.secondaryButtonText}>Tune price</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Before you send</Text>
          <Text style={styles.sectionHint}>FastBid keeps the owner in control.</Text>
        </View>

        <View style={styles.riskList}>
          {riskFlags.map((risk) => (
            <View key={risk} style={styles.riskItem}>
              <MaterialIcons name="warning-amber" size={21} color="#B45309" />
              <Text style={styles.riskText}>{risk}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F6F2',
  },
  container: {
    alignSelf: 'center',
    gap: 18,
    maxWidth: 760,
    padding: 20,
    paddingBottom: 34,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    paddingTop: 8,
  },
  logoMark: {
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  headerText: {
    flex: 1,
    gap: 3,
  },
  kicker: {
    color: '#116466',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0,
  },
  title: {
    color: '#111827',
    flexShrink: 1,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 31,
  },
  quickJob: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E7E5E4',
    borderRadius: 8,
    borderWidth: 1,
    gap: 16,
    padding: 16,
  },
  quickJobTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  sectionLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  darkSectionLabel: {
    color: '#BAE6FD',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  jobTitle: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 27,
    marginTop: 2,
  },
  statusPill: {
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    color: '#14532D',
    fontSize: 12,
    fontWeight: '800',
  },
  voiceNote: {
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  voiceCopy: {
    color: '#334155',
    flex: 1,
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
  },
  actionGrid: {
    gap: 10,
  },
  actionButton: {
    alignItems: 'center',
    borderColor: '#E5E7EB',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 76,
    padding: 12,
  },
  actionIcon: {
    alignItems: 'center',
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  actionTitle: {
    color: '#111827',
    flexBasis: 116,
    flexGrow: 0,
    flexShrink: 0,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 19,
  },
  actionDetail: {
    color: '#64748B',
    flex: 1,
    flexShrink: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  bidPreview: {
    backgroundColor: '#172554',
    borderRadius: 8,
    gap: 16,
    padding: 18,
  },
  previewTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  price: {
    color: '#FFFFFF',
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 50,
    marginTop: 2,
  },
  confidence: {
    alignItems: 'flex-end',
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  confidenceValue: {
    color: '#1E3A8A',
    fontSize: 18,
    fontWeight: '900',
  },
  confidenceLabel: {
    color: '#1E40AF',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  scopeText: {
    color: '#E0F2FE',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  table: {
    backgroundColor: '#0F1E47',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableRow: {
    alignItems: 'center',
    borderBottomColor: '#263A74',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  tableLabel: {
    color: '#CBD5E1',
    flex: 1,
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 18,
  },
  tableValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    marginLeft: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#16A34A',
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 12,
  },
  secondaryButtonText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '900',
  },
  sectionHeader: {
    gap: 2,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0,
  },
  sectionHint: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  riskList: {
    gap: 10,
  },
  riskItem: {
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 13,
  },
  riskText: {
    color: '#78350F',
    flex: 1,
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
});
