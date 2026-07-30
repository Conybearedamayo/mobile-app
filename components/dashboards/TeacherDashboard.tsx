import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Surface, Avatar, Divider, Searchbar } from 'react-native-paper';
import { GraduationCap, Users, AlertCircle, CheckCircle2, ChevronRight, Copy, Check, Inbox } from 'lucide-react-native';

const JUCOCH_GREEN = '#2D6A4F';

export default function TeacherDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);

  const teacherClassCode = 'TEACH-10A';

  const filteredStudents = enrolledStudents.filter(s => 
    s.alias.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.grade.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const needsSupportCount = enrolledStudents.filter(s => s.status === 'Needs Support').length;

  const handleCopyCode = () => {
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerBadgeRow}>
        <View style={styles.iconBg}>
          <GraduationCap size={20} color="#1E88E5" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Teacher Classroom Monitor</Text>
          <Text style={styles.headerSub}>Monitoring students registered under your class code</Text>
        </View>
      </View>

      {/* Classroom Join Code Card */}
      <Surface style={styles.codeCard} elevation={2}>
        <View style={styles.codeInfo}>
          <Text style={styles.codeLabel}>YOUR CLASSROOM JOIN CODE FOR STUDENTS</Text>
          <Text style={styles.codeValue}>{teacherClassCode}</Text>
          <Text style={styles.codeSub}>Give this code to your students during registration so they automatically link to your class roster.</Text>
        </View>
        <TouchableOpacity style={styles.copyBtn} onPress={handleCopyCode} activeOpacity={0.7}>
          {copiedCode ? <Check size={18} color="#FFF" /> : <Copy size={18} color="#FFF" />}
          <Text style={styles.copyBtnText}>{copiedCode ? 'Copied!' : 'Copy Code'}</Text>
        </TouchableOpacity>
      </Surface>

      {/* Summary Cards */}
      <View style={styles.statsRow}>
        <Surface style={styles.statCard} elevation={1}>
          <Text style={styles.statNumber}>{enrolledStudents.length}</Text>
          <Text style={styles.statLabel}>Enrolled Students</Text>
        </Surface>

        <Surface style={styles.statCard} elevation={1}>
          <Text style={[styles.statNumber, { color: JUCOCH_GREEN }]}>
            {enrolledStudents.length - needsSupportCount}
          </Text>
          <Text style={styles.statLabel}>Healthy / Stable</Text>
        </Surface>

        <Surface style={[styles.statCard, { borderColor: '#FF8080' }]} elevation={1}>
          <Text style={[styles.statNumber, { color: '#D90429' }]}>{needsSupportCount}</Text>
          <Text style={styles.statLabel}>Needs Support</Text>
        </Surface>
      </View>

      {/* Search Bar */}
      <Searchbar
        placeholder="Search student alias..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        inputStyle={{ fontSize: 13, minHeight: 0 }}
      />

      {/* Roster Header */}
      <View style={styles.rosterHeader}>
        <Text style={styles.rosterTitle}>MY LINKED STUDENTS ({filteredStudents.length})</Text>
        <Text style={styles.privacyNote}>🔒 Anonymous Alias Privacy</Text>
      </View>

      {/* Student List */}
      <Surface style={styles.listContainer} elevation={2}>
        {filteredStudents.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Inbox size={32} color="#A0A5A1" style={{ marginBottom: 8 }} />
            <Text style={styles.emptyTitle}>No Students Enrolled Yet</Text>
            <Text style={styles.emptySub}>
              Share your Classroom Code <Text style={{ fontWeight: 'bold', color: '#1E88E5' }}>{teacherClassCode}</Text> with your students during registration to view their check-ins here.
            </Text>
          </View>
        ) : (
          filteredStudents.map((student, index) => {
            const isAlert = student.status === 'Needs Support';
            return (
              <View key={student.id}>
                {index > 0 && <Divider style={styles.divider} />}
                <TouchableOpacity style={styles.studentItem} activeOpacity={0.7}>
                  <Avatar.Text 
                    size={42} 
                    label={student.alias.slice(0, 2).toUpperCase()} 
                    style={{ backgroundColor: isAlert ? '#FF9F43' : JUCOCH_GREEN }} 
                  />
                  
                  <View style={styles.studentDetails}>
                    <View style={styles.nameRow}>
                      <Text style={styles.studentName}>{student.alias}</Text>
                      <Text style={styles.gradeText}>Code: {student.codeUsed}</Text>
                    </View>
                    <Text style={styles.wellnessMeta}>
                      Mood: {student.mood} • Sleep: {student.sleepHours}h • Streak: {student.streak}d
                    </Text>
                  </View>

                  {isAlert ? (
                    <Surface style={styles.alertChip} elevation={0}>
                      <AlertCircle size={12} color="#D90429" style={{ marginRight: 4 }} />
                      <Text style={styles.alertChipText}>Alert</Text>
                    </Surface>
                  ) : (
                    <Surface style={styles.goodChip} elevation={0}>
                      <CheckCircle2 size={12} color={JUCOCH_GREEN} style={{ marginRight: 4 }} />
                      <Text style={styles.goodChipText}>OK</Text>
                    </Surface>
                  )}
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  headerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    backgroundColor: '#E3F2FD',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  iconBg: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1565C0',
  },
  headerSub: {
    fontSize: 11,
    color: '#5C6BC0',
    marginTop: 2,
  },
  codeCard: {
    backgroundColor: '#1E88E5',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeInfo: {
    flex: 1,
    paddingRight: 12,
  },
  codeLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  codeValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginVertical: 2,
  },
  codeSub: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
    lineHeight: 15,
  },
  copyBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 6,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EBF2EE',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1F1D',
  },
  statLabel: {
    fontSize: 10,
    color: '#707571',
    marginTop: 2,
  },
  searchBar: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    height: 44,
    marginBottom: 16,
    elevation: 1,
  },
  rosterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  rosterTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#808983',
    letterSpacing: 1,
  },
  privacyNote: {
    fontSize: 10,
    color: '#707571',
  },
  listContainer: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2EFE7',
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  studentDetails: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  studentName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1C1F1D',
  },
  gradeText: {
    fontSize: 11,
    color: '#707571',
  },
  wellnessMeta: {
    fontSize: 12,
    color: '#555',
    marginTop: 3,
  },
  alertChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  alertChipText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#D90429',
  },
  goodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  goodChipText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: JUCOCH_GREEN,
  },
  divider: {
    backgroundColor: '#F0F4F2',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1C1F1D',
  },
  emptySub: {
    fontSize: 11,
    color: '#707571',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },
});
