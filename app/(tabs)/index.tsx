import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  getCurrentJobs,
  type BusinessRule,
  type CurrentJobSummary,
  type MemoryOverview,
} from '@/lib/job-details-api';

type JobsScreenData = {
  businessRules: BusinessRule[];
  jobs: CurrentJobSummary[];
  memory: MemoryOverview;
};

export default function JobsScreen() {
  const router = useRouter();
  const { refresh } = useLocalSearchParams<{ refresh?: string }>();
  const [screenData, setScreenData] = useState<JobsScreenData | null>(null);

  useEffect(() => {
    let isMounted = true;

    setScreenData(null);
    getCurrentJobs().then((data) => {
      if (isMounted) {
        setScreenData(data);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [refresh]);

  const openBid = (jobId: string) => {
    router.push(`/(tabs)/explore?jobId=${jobId}`);
  };

  const createProject = () => {
    router.push('/project-onboard');
  };

  if (!screenData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <View style={styles.logoMark}>
            <MaterialIcons name="construction" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.loadingTitle}>Loading home</Text>
          <Text style={styles.loadingCopy}>Pulling the bid queue from the mock API.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { businessRules, jobs, memory } = screenData;
  const featuredJob = jobs[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>{memory.kicker}</Text>
          <Text style={styles.title}>{memory.headline}</Text>
          <Pressable accessibilityLabel="Create project" onPress={createProject} style={styles.createButton}>
            <MaterialIcons name="add" size={21} color="#FFFFFF" />
            <Text style={styles.createButtonText}>Create project</Text>
          </Pressable>
          <Text style={styles.subtitle}>{memory.description}</Text>
        </View>

        <View style={styles.jobPhoto}>
          <View style={styles.photoTopBar}>
            <View style={styles.photoDot} />
            <Text style={styles.photoLabel}>today estimate</Text>
          </View>
          <View style={styles.fenceLine}>
            <View style={styles.fencePost} />
            <View style={styles.fenceBoard} />
            <View style={styles.fenceBoardShort} />
            <View style={styles.fencePost} />
          </View>
          <View style={styles.quoteStrip}>
            <Text style={styles.quoteLabel}>{featuredJob.name}</Text>
            <Text style={styles.quoteValue}>{featuredJob.price}</Text>
          </View>
        </View>

        <View style={styles.metricRow}>
          {memory.metrics.map((metric) => (
            <View key={metric.label} style={styles.metric}>
              <Text style={styles.metricValue}>{metric.value}</Text>
              <Text style={styles.metricLabel}>{metric.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.sectionLabel}>{memory.currentJobsLabel}</Text>
              <Text style={styles.sectionTitle}>{memory.currentJobsTitle}</Text>
            </View>
            <View style={styles.sourceBadge}>
              <MaterialIcons name="touch-app" size={15} color="#0F766E" />
              <Text style={styles.sourceBadgeText}>tap to open</Text>
            </View>
          </View>

          <View style={styles.jobList}>
            {jobs.map((job) => (
              <Pressable key={job.id} onPress={() => openBid(job.id)} style={styles.jobCard}>
                <View style={styles.jobCardTop}>
                  <View style={styles.jobNameBlock}>
                    <Text style={styles.jobName}>{job.name}</Text>
                    <Text style={styles.jobDate}>{job.date}</Text>
                  </View>
                  <View style={styles.priceBlock}>
                    <Text style={styles.jobPrice}>{job.price}</Text>
                    <Text style={styles.jobMargin}>{job.margin} margin</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color="#64748B" />
                </View>
                <Text style={styles.jobNote}>{job.note}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.sectionLabel}>Estimator defaults</Text>
          <Text style={styles.sectionTitle}>Rules FastBid should apply</Text>

          <View style={styles.ruleList}>
            {businessRules.map((rule) => (
              <View key={rule.title} style={styles.ruleItem}>
                <View style={styles.ruleIcon}>
                  <MaterialIcons name={rule.icon} size={22} color="#0F172A" />
                </View>
                <View style={styles.ruleCopy}>
                  <Text style={styles.ruleTitle}>{rule.title}</Text>
                  <Text style={styles.ruleDetail}>{rule.detail}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.architecturePanel}>
          <MaterialIcons name="hub" size={26} color="#FFFFFF" />
          <View style={styles.architectureCopy}>
            <Text style={styles.architectureTitle}>MVP AI stack</Text>
            <Text style={styles.architectureText}>
              OpenAI for extraction, RAG-grounded drafting, and risk review. Postgres plus pgvector
              for company memory. Keep the model layer swappable for local Ollama experiments later.
            </Text>
          </View>
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
  logoMark: {
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    height: 52,
    justifyContent: 'center',
    width: 52,
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
    gap: 8,
    paddingTop: 8,
  },
  kicker: {
    color: '#0F766E',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    color: '#111827',
    fontSize: 29,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 33,
  },
  createButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 7,
    minHeight: 44,
    paddingHorizontal: 13,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  subtitle: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 23,
  },
  jobPhoto: {
    backgroundColor: '#D9E8DF',
    borderRadius: 8,
    minHeight: 184,
    overflow: 'hidden',
    padding: 14,
  },
  photoTopBar: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 7,
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 2,
  },
  photoDot: {
    backgroundColor: '#22C55E',
    borderRadius: 999,
    height: 7,
    width: 7,
  },
  photoLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  fenceLine: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 10,
    height: 126,
    justifyContent: 'center',
    paddingTop: 36,
  },
  fencePost: {
    backgroundColor: '#7C2D12',
    borderRadius: 4,
    height: 112,
    width: 22,
  },
  fenceBoard: {
    backgroundColor: '#A16207',
    borderRadius: 5,
    height: 88,
    width: 54,
  },
  fenceBoardShort: {
    backgroundColor: '#92400E',
    borderRadius: 5,
    height: 64,
    width: 54,
  },
  quoteStrip: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
  quoteLabel: {
    color: '#334155',
    flex: 1,
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '800',
  },
  quoteValue: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '900',
    marginLeft: 12,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metric: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E7E5E4',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 88,
    padding: 13,
  },
  metricValue: {
    color: '#111827',
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: 0,
  },
  metricLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  panel: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E7E5E4',
    borderRadius: 8,
    borderWidth: 1,
    gap: 14,
    padding: 16,
  },
  panelHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  sectionLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 26,
    marginTop: 2,
  },
  sourceBadge: {
    alignItems: 'center',
    backgroundColor: '#CCFBF1',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  sourceBadgeText: {
    color: '#0F766E',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  jobList: {
    gap: 10,
  },
  jobCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderRadius: 8,
    borderWidth: 1,
    gap: 9,
    padding: 13,
  },
  jobCardTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  jobNameBlock: {
    flex: 1,
    flexShrink: 1,
  },
  jobName: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 19,
  },
  jobDate: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
  },
  priceBlock: {
    alignItems: 'flex-end',
  },
  jobPrice: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '900',
  },
  jobMargin: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 1,
  },
  jobNote: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  ruleList: {
    gap: 12,
  },
  ruleItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  ruleIcon: {
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  ruleCopy: {
    flex: 1,
    flexShrink: 1,
  },
  ruleTitle: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20,
  },
  ruleDetail: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19,
  },
  architecturePanel: {
    alignItems: 'flex-start',
    backgroundColor: '#116466',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 13,
    padding: 16,
  },
  architectureCopy: {
    flex: 1,
    flexShrink: 1,
    gap: 5,
  },
  architectureTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  architectureText: {
    color: '#DCFCE7',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
  },
});
