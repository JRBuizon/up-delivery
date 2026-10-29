// src/components/RatingModal.tsx
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../utils/supabase';

const UP_MAROON = '#7B1113';

interface RatingModalProps {
  visible: boolean;
  orderId: string;
  targetId: string;       // e.g., restaurant ID, rider name, or buyer name
  targetName: string;     // e.g., "Rodic's", "Rider Juan", "Anton"
  targetType: 'rider' | 'buyer' | 'restaurant';
  reviewerName: string;  // Optional reviewer email/name override
  onClose: () => void;
  onSubmitted: () => void;
}

export default function RatingModal({
  visible,
  orderId,
  targetId,
  targetName,
  targetType,
  reviewerName,
  onClose,
  onSubmitted,
}: RatingModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const { error: insertError } = await supabase.from('reviews').insert({
      order_id: orderId,
      reviewer_name: reviewerName,
      target_id: targetId,
      target_type: targetType,
      rating,
      comment,
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setComment('');
    onSubmitted();
    onClose();
  };

  const getSubtitle = () => {
    if (targetType === 'restaurant') return `How was the food from ${targetName}?`;
    if (targetType === 'rider') return `How was the delivery service by ${targetName}?`;
    return `How was your interaction with buyer ${targetName}?`;
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Rate {targetName}</Text>
          <Text style={styles.subtitle}>{getSubtitle()}</Text>

          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Star Selector */}
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={34}
                  color="#FFC107"
                  style={{ marginHorizontal: 4 }}
                />
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Write a comment (optional)..."
            placeholderTextColor="#999"
            multiline
            value={comment}
            onChangeText={setComment}
          />

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.submitBtnText}>{loading ? 'Submitting...' : 'Submit Rating'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelBtnText}>Skip / Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, alignItems: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', color: UP_MAROON, marginBottom: 4 },
  subtitle: { fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 16 },
  errorText: { color: '#C1121F', fontSize: 12, marginBottom: 10 },
  starsRow: { flexDirection: 'row', marginBottom: 16 },
  input: {
    width: '100%',
    backgroundColor: '#F4F4F6',
    borderRadius: 10,
    padding: 12,
    height: 80,
    textAlignVertical: 'top',
    fontSize: 14,
    marginBottom: 16,
  },
  submitBtn: { backgroundColor: UP_MAROON, width: '100%', padding: 14, borderRadius: 10, alignItems: 'center' },
  submitBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  cancelBtn: { marginTop: 10, padding: 8 },
  cancelBtnText: { color: '#666', fontSize: 13, fontWeight: '600' },
});