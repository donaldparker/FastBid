import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ComponentProps } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

const similarJobs = [
  {
    name: 'Lopez side-yard fence',
    date: 'Aug 2025',
    price: '$2,250',
    margin: '24%',
    note: 'Won after adding haul-away and gate adjustment as options.',
  },
  {
    name: 'Brown deck rail patch',
    date: 'Jun 2025',
    price: '$1,740',
    margin: '13%',
    note: 'Labor ran long because rotten framing was missed in photos.',
  },
  {
    name: 'Martinez board replacement',
    date: 'Apr 2025',
    price: '$1,925',
    margin: '21%',
    note: 'Best match for material count and one-day crew schedule.',
  },
];

const businessRules: {
  icon: MaterialIconName;
  title: string;
  detail: string;
}[] = [
  {
    icon: 'paid',
    title: 'Default labor rate',
    detail: '$86 per crew hour for two-person repair jobs.',
  },
  {
    icon: 'percent',
    title: 'Target margin',
    detail: 'Aim for 22% to 28% after material markup and overhead.',
  },
  {
    icon: 'block',
    title: 'Usual exclusions',
    detail: 'Permits, hidden rot, paint/stain, electrical, and customer-supplied materials.',
  },
];

export default function MemoryScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>Company memory</Text>
          <Text style={styles.title}>The bid gets smarter after every job.</Text>
          <Text style={styles.subtitle}>
            FastBid should remember what the owner charged, which jobs won, and where profit leaked.
          </Text>
        </View>

        <View style={styles.metricRow}>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>128</Text>
            <Text style={styles.metricLabel}>old bids</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>41</Text>
            <Text style={styles.metricLabel}>invoices</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>19%</Text>
            <Text style={styles.metricLabel}>avg margin</Text>
          </View>
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.sectionLabel}>Matches for this bid</Text>
              <Text style={styles.sectionTitle}>Similar past jobs</Text>
            </View>
            <View style={styles.sourceBadge}>
              <MaterialIcons name="link" size={15} color="#0F766E" />
              <Text style={styles.sourceBadgeText}>cited</Text>
            </View>
          </View>

          <View style={styles.jobList}>
            {similarJobs.map((job) => (
              <View key={job.name} style={styles.jobCard}>
                <View style={styles.jobCardTop}>
                  <View style={styles.jobNameBlock}>
                    <Text style={styles.jobName}>{job.name}</Text>
                    <Text style={styles.jobDate}>{job.date}</Text>
                  </View>
                  <View style={styles.priceBlock}>
                    <Text style={styles.jobPrice}>{job.price}</Text>
                    <Text style={styles.jobMargin}>{job.margin} margin</Text>
                  </View>
                </View>
                <Text style={styles.jobNote}>{job.note}</Text>
              </View>
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
  subtitle: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 23,
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
