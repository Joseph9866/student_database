import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '@/lib/supabaseClient';

interface Student {
  id: number;
  registration_no: string;
  name: string;
  marks: number;
}

export default function HomeScreen() {
  const [registrationNo, setRegistrationNo] = useState('');
  const [name, setName] = useState('');
  const [marks, setMarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewedStudent, setViewedStudent] = useState<Student | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearForm = () => {
    setRegistrationNo('');
    setName('');
    setMarks('');
    setViewedStudent(null);
    setError(null);
  };

  const handleInsert = async () => {
    if (!registrationNo || !name || !marks) {
      setError('Please fill in all fields');
      return;
    }

    const marksNum = parseInt(marks);
    if (isNaN(marksNum)) {
      setError('Marks must be a valid number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('students')
        .insert([
          {
            registration_no: registrationNo,
            name: name,
            marks: marksNum,
          },
        ])
        .select();

      if (error) {
        if (error.code === '23505') {
          setError('A student with this registration number already exists');
        } else {
          setError(error.message);
        }
      } else {
        Alert.alert('Success', 'Student record inserted successfully');
        clearForm();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleView = async () => {
    if (!registrationNo) {
      setError('Please enter a registration number');
      return;
    }

    setLoading(true);
    setError(null);
    setViewedStudent(null);

    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('registration_no', registrationNo)
        .maybeSingle();

      if (error) {
        setError(error.message);
      } else if (!data) {
        setError('No student found with this registration number');
      } else {
        setViewedStudent(data);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!registrationNo) {
      setError('Please enter a registration number');
      return;
    }

    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this student record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            setError(null);

            try {
              const { error } = await supabase
                .from('students')
                .delete()
                .eq('registration_no', registrationNo);

              if (error) {
                setError(error.message);
              } else {
                Alert.alert('Success', 'Student record deleted successfully');
                clearForm();
              }
            } catch (err) {
              setError('An unexpected error occurred');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Student Manager</Text>
        <Text style={styles.subtitle}>Manage student records</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Registration No</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g, REG001"
            value={registrationNo}
            onChangeText={setRegistrationNo}
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Student Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Marks</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Marks"
            value={marks}
            onChangeText={setMarks}
            keyboardType="numeric"
          />
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.buttonGrid}>
          <TouchableOpacity
            style={[styles.button, styles.insertButton]}
            onPress={handleInsert}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Insert</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.viewButton]}
            onPress={handleView}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>View</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={handleDelete}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Delete</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={clearForm}
            disabled={loading}>
            <Text style={styles.buttonText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {viewedStudent && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Student Details</Text>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Registration No:</Text>
              <Text style={styles.resultValue}>{viewedStudent.registration_no}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Name:</Text>
              <Text style={styles.resultValue}>{viewedStudent.name}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Marks:</Text>
              <Text style={styles.resultValue}>{viewedStudent.marks}</Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#0b3891ff',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
  },
  button: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  insertButton: {
    backgroundColor: '#0f46b6ff',
  },
  viewButton: {
    backgroundColor: '#0f46b6ff',
  },
  deleteButton: {
    backgroundColor: '#0f46b6ff',
  },
  clearButton: {
    backgroundColor: '#0f46b6ff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultCard: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  resultLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  resultValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
});
