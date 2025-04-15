import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';
import type { DetailedReport } from '@/types/report';

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  item: {
    marginBottom: 10,
    padding: 10,
    border: '1 solid #ccc',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  studentName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 12,
  },
  details: {
    fontSize: 12,
    color: '#666',
  },
  summary: {
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  summaryValue: {
    fontSize: 12,
  },
});

interface ReportPDFProps {
  report: DetailedReport;
}

export default function ReportPDF({ report }: ReportPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Daily Report</Text>
        <Text style={{ textAlign: 'center', marginBottom: 20 }}>
          {format(report.date, 'PPP')}
        </Text>

        {/* Sleepovers Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sleepovers</Text>
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total:</Text>
              <Text style={styles.summaryValue}>{report.sleepovers.total}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Resolved:</Text>
              <Text style={styles.summaryValue}>{report.sleepovers.resolved}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Denied:</Text>
              <Text style={styles.summaryValue}>{report.sleepovers.denied}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Pending:</Text>
              <Text style={styles.summaryValue}>{report.sleepovers.pending}</Text>
            </View>
          </View>
          {report.sleepovers.items.map((item) => (
            <View key={item.id} style={styles.item}>
              <View style={styles.itemHeader}>
                <Text style={styles.studentName}>{item.studentName}</Text>
                <Text style={styles.status}>{item.status}</Text>
              </View>
              <Text style={styles.details}>{item.details}</Text>
            </View>
          ))}
        </View>

        {/* Maintenance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Maintenance</Text>
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total:</Text>
              <Text style={styles.summaryValue}>{report.maintenance.total}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Resolved:</Text>
              <Text style={styles.summaryValue}>{report.maintenance.resolved}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Denied:</Text>
              <Text style={styles.summaryValue}>{report.maintenance.denied}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Pending:</Text>
              <Text style={styles.summaryValue}>{report.maintenance.pending}</Text>
            </View>
          </View>
          {report.maintenance.items.map((item) => (
            <View key={item.id} style={styles.item}>
              <View style={styles.itemHeader}>
                <Text style={styles.studentName}>{item.studentName}</Text>
                <Text style={styles.status}>{item.status}</Text>
              </View>
              <Text style={styles.details}>{item.details}</Text>
            </View>
          ))}
        </View>

        {/* Complaints Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Complaints</Text>
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total:</Text>
              <Text style={styles.summaryValue}>{report.complaints.total}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Resolved:</Text>
              <Text style={styles.summaryValue}>{report.complaints.resolved}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Denied:</Text>
              <Text style={styles.summaryValue}>{report.complaints.denied}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Pending:</Text>
              <Text style={styles.summaryValue}>{report.complaints.pending}</Text>
            </View>
          </View>
          {report.complaints.items.map((item) => (
            <View key={item.id} style={styles.item}>
              <View style={styles.itemHeader}>
                <Text style={styles.studentName}>{item.studentName}</Text>
                <Text style={styles.status}>{item.status}</Text>
              </View>
              <Text style={styles.details}>{item.details}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
} 