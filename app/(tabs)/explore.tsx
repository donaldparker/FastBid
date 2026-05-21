import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getJobDetails, type JobDetails } from '@/lib/job-details-api';

export default function BidScreen() {
  const router = useRouter();
  const { jobId } = useLocalSearchParams<{ jobId?: string }>();
  const selectedJobId = Array.isArray(jobId) ? jobId[0] : jobId;
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);

  useEffect(() => {
    let isMounted = true;

    setJobDetails(null);
    getJobDetails(selectedJobId).then((details) => {
      if (isMounted) {
        setJobDetails(details);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedJobId]);

  if (!jobDetails) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <View style={styles.logoMark}>
            <MaterialIcons name="bolt" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.loadingTitle}>Loading job details</Text>
          <Text style={styles.loadingCopy}>Pulling the selected estimate from the mock API.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { brand, currentJob, generatedBid, intakeActions, preSendReview } = jobDetails;

  const returnHome = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.topHeader}>
          <Pressable
            accessibilityLabel="Back to Home"
            onPress={returnHome}
            style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={20} color="#0F172A" />
            <Text style={styles.backButtonText}>Home</Text>
          </Pressable>
          <View style={styles.topHeaderTitleWrap}>
            <Text style={styles.topHeaderLabel}>Bid detail</Text>
            <Text style={styles.topHeaderTitle}>{currentJob.title}</Text>
          </View>
        </View>

        <View style={styles.header}>
          <View style={styles.logoMark}>
            <MaterialIcons name="bolt" size={28} color="#FFFFFF" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.kicker}>{brand.name}</Text>
            <Text style={styles.title}>{brand.headline}</Text>
          </View>
        </View>

        <View style={styles.quickJob}>
          <View style={styles.quickJobTop}>
            <View style={styles.jobHeading}>
              <Text style={styles.sectionLabel}>{currentJob.label}</Text>
              <Text style={styles.jobTitle}>{currentJob.title}</Text>
            </View>
            <View style={styles.statusPill}>
              <MaterialIcons name="auto-awesome" size={15} color="#14532D" />
              <Text style={styles.statusText}>{currentJob.status}</Text>
            </View>
          </View>

          <View style={styles.voiceNote}>
            <MaterialIcons name="graphic-eq" size={28} color="#0F172A" />
            <Text style={styles.voiceCopy}>{currentJob.voiceNote}</Text>
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
              <Text style={styles.darkSectionLabel}>{generatedBid.label}</Text>
              <Text style={styles.price}>{generatedBid.recommendedQuote}</Text>
            </View>
            <View style={styles.confidence}>
              <Text style={styles.confidenceValue}>{generatedBid.confidence}</Text>
              <Text style={styles.confidenceLabel}>confidence</Text>
            </View>
          </View>

          <Text style={styles.scopeText}>{generatedBid.scope}</Text>

          <View style={styles.table}>
            {generatedBid.lineItems.map(({ label, value }) => (
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
          <Text style={styles.sectionTitle}>{preSendReview.title}</Text>
          <Text style={styles.sectionHint}>{preSendReview.hint}</Text>
        </View>

        <View style={styles.riskList}>
          {preSendReview.riskFlags.map((risk) => (
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
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    gap: 10,
    justifyContent: 'center',
    padding: 24,
  },
  loadingTitle: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0,
    marginTop: 10,
  },
  loadingCopy: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
    maxWidth: 300,
    textAlign: 'center',
  },
  container: {
    alignSelf: 'center',
    gap: 18,
    maxWidth: 760,
    padding: 20,
    paddingBottom: 34,
    width: '100%',
  },
  topHeader: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E7E5E4',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    padding: 12,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 6,
    minHeight: 42,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '900',
  },
  topHeaderTitleWrap: {
    alignItems: 'flex-end',
    flex: 1,
    flexShrink: 1,
  },
  topHeaderLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  topHeaderTitle: {
    color: '#111827',
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20,
    textAlign: 'right',
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
  jobHeading: {
    flex: 1,
    flexShrink: 1,
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
