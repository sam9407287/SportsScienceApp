import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { t } from '../i18n';
import { ThemeContext } from '../context/ThemeContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function RPECalculator({ onBack }) {
  const { isDarkMode } = useContext(ThemeContext);
  const [rpe, setRpe] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [percentage, setPercentage] = useState('');
  const [estimatedOneRM, setEstimatedOneRM] = useState('');
  const [percentageOfOneRM, setPercentageOfOneRM] = useState('');
  const [calculationType, setCalculationType] = useState('rpe'); // 'rpe' or 'percentage'

  // 從RPE和重複次數計算1RM百分比
  const rpeToPercentage = (rpe, reps) => {
    // RPE到百分比的換算表
    const rpeChart = {
      10: { 1: 100, 2: 95, 3: 92, 4: 89, 5: 86, 6: 84, 7: 81, 8: 79, 9: 76, 10: 74 },
      9.5: { 1: 98, 2: 93, 3: 90, 4: 87, 5: 84, 6: 82, 7: 79, 8: 77, 9: 74, 10: 72 },
      9: { 1: 96, 2: 91, 3: 88, 4: 85, 5: 82, 6: 80, 7: 77, 8: 75, 9: 72, 10: 70 },
      8.5: { 1: 94, 2: 89, 3: 86, 4: 83, 5: 80, 6: 78, 7: 75, 8: 73, 9: 70, 10: 68 },
      8: { 1: 92, 2: 87, 3: 84, 4: 81, 5: 78, 6: 76, 7: 73, 8: 71, 9: 68, 10: 66 },
      7.5: { 1: 90, 2: 85, 3: 82, 4: 79, 5: 76, 6: 74, 7: 71, 8: 69, 9: 66, 10: 64 },
      7: { 1: 88, 2: 83, 3: 80, 4: 77, 5: 74, 6: 72, 7: 69, 8: 67, 9: 64, 10: 62 },
      6.5: { 1: 86, 2: 81, 3: 78, 4: 75, 5: 72, 6: 70, 7: 67, 8: 65, 9: 62, 10: 60 },
      6: { 1: 84, 2: 79, 3: 76, 4: 73, 5: 70, 6: 68, 7: 65, 8: 63, 9: 60, 10: 58 }
    };

    // 如果RPE或reps不在範圍內，返回null
    const rpeVal = parseFloat(rpe);
    const repsVal = parseInt(reps);
    
    if (isNaN(rpeVal) || isNaN(repsVal) || !rpeChart[rpeVal] || !rpeChart[rpeVal][repsVal]) {
      return null;
    }
    
    return rpeChart[rpeVal][repsVal];
  };

  // 從百分比和重複次數計算RPE
  const percentageToRPE = (percentage, reps) => {
    // 定義百分比範圍和對應的RPE值
    const rpeRanges = {
      1: [
        { min: 100, max: 100, rpe: 10 },
        { min: 97, max: 99, rpe: 9.5 },
        { min: 94, max: 96, rpe: 9 },
        { min: 91, max: 93, rpe: 8.5 },
        { min: 88, max: 90, rpe: 8 },
        { min: 85, max: 87, rpe: 7.5 },
        { min: 82, max: 84, rpe: 7 },
        { min: 79, max: 81, rpe: 6.5 },
        { min: 76, max: 78, rpe: 6 }
      ],
      // 其餘重複次數的範圍...
      2: [
        { min: 95, max: 97, rpe: 10 },
        { min: 92, max: 94, rpe: 9.5 },
        { min: 89, max: 91, rpe: 9 },
        { min: 86, max: 88, rpe: 8.5 },
        { min: 83, max: 85, rpe: 8 },
        { min: 80, max: 82, rpe: 7.5 },
        { min: 77, max: 79, rpe: 7 },
        { min: 74, max: 76, rpe: 6.5 },
        { min: 71, max: 73, rpe: 6 }
      ],
      // 其他次數略...
      3: [
        { min: 91, max: 93, rpe: 10 },
        { min: 88, max: 90, rpe: 9.5 },
        { min: 85, max: 87, rpe: 9 },
        { min: 82, max: 84, rpe: 8.5 },
        { min: 79, max: 81, rpe: 8 },
        { min: 76, max: 78, rpe: 7.5 },
        { min: 73, max: 75, rpe: 7 },
        { min: 70, max: 72, rpe: 6.5 },
        { min: 67, max: 69, rpe: 6 }
      ],
      5: [
        { min: 85, max: 87, rpe: 10 },
        { min: 82, max: 84, rpe: 9.5 },
        { min: 79, max: 81, rpe: 9 },
        { min: 76, max: 78, rpe: 8.5 },
        { min: 73, max: 75, rpe: 8 },
        { min: 70, max: 72, rpe: 7.5 },
        { min: 67, max: 69, rpe: 7 },
        { min: 64, max: 66, rpe: 6.5 },
        { min: 61, max: 63, rpe: 6 }
      ],
      10: [
        { min: 73, max: 75, rpe: 10 },
        { min: 70, max: 72, rpe: 9.5 },
        { min: 67, max: 69, rpe: 9 },
        { min: 64, max: 66, rpe: 8.5 },
        { min: 61, max: 63, rpe: 8 },
        { min: 58, max: 60, rpe: 7.5 },
        { min: 55, max: 57, rpe: 7 },
        { min: 52, max: 54, rpe: 6.5 },
        { min: 49, max: 51, rpe: 6 }
      ]
    };

    const percVal = parseFloat(percentage);
    const repsVal = parseInt(reps);
    
    if (isNaN(percVal) || isNaN(repsVal) || !rpeRanges[repsVal]) {
      return null;
    }
    
    // 找到百分比落在哪個範圍
    const range = rpeRanges[repsVal].find(range => 
      percVal >= range.min && percVal <= range.max
    );
    
    return range ? range.rpe : null;
  };

  const calculateFromRPE = () => {
    if (!rpe || !reps || !weight) {
      Alert.alert(t('invalid_input'), t('fill_all_required_fields'));
      return;
    }
    
    const rpeValue = parseFloat(rpe);
    const repsValue = parseInt(reps);
    const weightValue = parseFloat(weight);
    
    if (isNaN(rpeValue) || isNaN(repsValue) || isNaN(weightValue) || 
        rpeValue < 6 || rpeValue > 10 || 
        repsValue < 1 || repsValue > 10) {
      Alert.alert(t('invalid_input'), t('fill_all_required_fields'));
      return;
    }
    
    // 計算1RM的百分比
    const percentage = rpeToPercentage(rpeValue, repsValue);
    if (percentage === null) {
      Alert.alert(t('invalid_input'), 'RPE and reps combination not found in chart');
      return;
    }
    
    // 計算預估的1RM
    const oneRM = weightValue / (percentage / 100);
    
    // 更新狀態
    setPercentageOfOneRM(percentage.toFixed(1));
    setEstimatedOneRM(oneRM.toFixed(1));
    setPercentage(percentage.toFixed(1));
  };

  const calculateFromPercentage = () => {
    if (!percentage || !reps) {
      Alert.alert(t('invalid_input'), t('fill_all_required_fields'));
      return;
    }
    
    const percentageValue = parseFloat(percentage);
    const repsValue = parseInt(reps);
    
    if (isNaN(percentageValue) || isNaN(repsValue) || 
        percentageValue < 40 || percentageValue > 100 || 
        repsValue < 1 || repsValue > 10) {
      Alert.alert(t('invalid_input'), t('fill_all_required_fields'));
      return;
    }
    
    // 從百分比計算RPE
    const rpeValue = percentageToRPE(percentageValue, repsValue);
    if (rpeValue === null) {
      Alert.alert(t('invalid_input'), 'Percentage and reps combination not in valid range');
      return;
    }
    
    // 更新狀態
    setRpe(rpeValue.toString());
    setPercentageOfOneRM(percentageValue.toFixed(1));
  };

  const clearInputs = () => {
    setRpe('');
    setReps('');
    setWeight('');
    setPercentage('');
    setEstimatedOneRM('');
    setPercentageOfOneRM('');
  };

  return (
    <SafeAreaView style={[
      styles.safeArea, 
      isDarkMode ? styles.containerDark : styles.containerLight
    ]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      <View style={[
        styles.header, 
        isDarkMode ? styles.headerDark : styles.headerLight
      ]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={onBack}
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={isDarkMode ? '#fff' : '#000'} 
          />
        </TouchableOpacity>
        <Text style={[
          styles.headerTitle,
          isDarkMode ? styles.textDark : styles.textLight
        ]}>
          {t('rpe_title')}
        </Text>
        <View style={styles.emptySpace} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.descriptionContainer}>
            <Text style={[
              styles.description,
              isDarkMode ? styles.textDark : styles.textLight
            ]}>
              {t('rpe_description')}
            </Text>
          </View>

          <View style={styles.segmentedControlContainer}>
            <TouchableOpacity 
              style={[
                styles.segmentButton,
                calculationType === 'rpe' ? (isDarkMode ? styles.activeSegmentDark : styles.activeSegmentLight) : {},
                calculationType === 'rpe' ? styles.leftSegment : {},
                isDarkMode ? styles.segmentDark : styles.segmentLight
              ]}
              onPress={() => setCalculationType('rpe')}
            >
              <Text style={[
                calculationType === 'rpe' ? styles.activeSegmentText : {},
                isDarkMode ? styles.textDark : styles.textLight
              ]}>
                {t('rpe_to_percentage')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.segmentButton,
                calculationType === 'percentage' ? (isDarkMode ? styles.activeSegmentDark : styles.activeSegmentLight) : {},
                calculationType === 'percentage' ? styles.rightSegment : {},
                isDarkMode ? styles.segmentDark : styles.segmentLight
              ]}
              onPress={() => setCalculationType('percentage')}
            >
              <Text style={[
                calculationType === 'percentage' ? styles.activeSegmentText : {},
                isDarkMode ? styles.textDark : styles.textLight
              ]}>
                {t('percentage_to_rpe')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[
            styles.card,
            isDarkMode ? styles.cardDark : styles.cardLight
          ]}>
            {calculationType === 'rpe' ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, isDarkMode ? styles.textDark : styles.textLight]}>
                    {t('rpe_value')}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      isDarkMode ? styles.inputDark : styles.inputLight
                    ]}
                    value={rpe}
                    onChangeText={setRpe}
                    placeholder={t('enter_rpe')}
                    placeholderTextColor={isDarkMode ? '#666' : '#999'}
                    keyboardType="decimal-pad"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, isDarkMode ? styles.textDark : styles.textLight]}>
                    {t('reps_performed')}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      isDarkMode ? styles.inputDark : styles.inputLight
                    ]}
                    value={reps}
                    onChangeText={setReps}
                    placeholder={t('enter_reps')}
                    placeholderTextColor={isDarkMode ? '#666' : '#999'}
                    keyboardType="number-pad"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, isDarkMode ? styles.textDark : styles.textLight]}>
                    {t('weight_lifted')}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      isDarkMode ? styles.inputDark : styles.inputLight
                    ]}
                    value={weight}
                    onChangeText={setWeight}
                    placeholder={t('enter_weight_lifted')}
                    placeholderTextColor={isDarkMode ? '#666' : '#999'}
                    keyboardType="decimal-pad"
                  />
                </View>
                
                <TouchableOpacity
                  style={[styles.button, isDarkMode ? styles.buttonDark : styles.buttonLight]}
                  onPress={calculateFromRPE}
                >
                  <Text style={[styles.buttonText, isDarkMode ? styles.buttonTextDark : styles.buttonTextLight]}>
                    {t('calculate_from_rpe')}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, isDarkMode ? styles.textDark : styles.textLight]}>
                    {t('percentage')}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      isDarkMode ? styles.inputDark : styles.inputLight
                    ]}
                    value={percentage}
                    onChangeText={setPercentage}
                    placeholder="60-100%"
                    placeholderTextColor={isDarkMode ? '#666' : '#999'}
                    keyboardType="decimal-pad"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, isDarkMode ? styles.textDark : styles.textLight]}>
                    {t('reps_performed')}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      isDarkMode ? styles.inputDark : styles.inputLight
                    ]}
                    value={reps}
                    onChangeText={setReps}
                    placeholder={t('enter_reps')}
                    placeholderTextColor={isDarkMode ? '#666' : '#999'}
                    keyboardType="number-pad"
                  />
                </View>
                
                <TouchableOpacity
                  style={[styles.button, isDarkMode ? styles.buttonDark : styles.buttonLight]}
                  onPress={calculateFromPercentage}
                >
                  <Text style={[styles.buttonText, isDarkMode ? styles.buttonTextDark : styles.buttonTextLight]}>
                    {t('calculate_from_percentage')}
                  </Text>
                </TouchableOpacity>
              </>
            )}
            
            <TouchableOpacity
              style={[styles.clearButton, isDarkMode ? styles.clearButtonDark : styles.clearButtonLight]}
              onPress={clearInputs}
            >
              <Text style={[styles.clearButtonText, isDarkMode ? styles.clearButtonTextDark : styles.clearButtonTextLight]}>
                {t('clear')}
              </Text>
            </TouchableOpacity>
          </View>

          {(estimatedOneRM || percentageOfOneRM) && (
            <View style={[
              styles.resultCard,
              isDarkMode ? styles.cardDark : styles.cardLight
            ]}>
              <Text style={[styles.resultTitle, isDarkMode ? styles.textDark : styles.textLight]}>
                {t('rpe_calc_result')}
              </Text>
              
              {calculationType === 'rpe' && (
                <>
                  <View style={styles.resultRow}>
                    <Text style={[styles.resultLabel, isDarkMode ? styles.textDark : styles.textLight]}>
                      {t('estimated_1rm')}:
                    </Text>
                    <Text style={[styles.resultValue, isDarkMode ? styles.textDark : styles.textLight]}>
                      {estimatedOneRM} kg
                    </Text>
                  </View>
                  
                  <View style={styles.resultRow}>
                    <Text style={[styles.resultLabel, isDarkMode ? styles.textDark : styles.textLight]}>
                      {t('percent_of_1rm')}:
                    </Text>
                    <Text style={[styles.resultValue, isDarkMode ? styles.textDark : styles.textLight]}>
                      {percentageOfOneRM}%
                    </Text>
                  </View>
                </>
              )}
              
              {calculationType === 'percentage' && (
                <View style={styles.resultRow}>
                  <Text style={[styles.resultLabel, isDarkMode ? styles.textDark : styles.textLight]}>
                    {t('rpe_value')}:
                  </Text>
                  <Text style={[styles.resultValue, isDarkMode ? styles.textDark : styles.textLight]}>
                    {rpe}
                  </Text>
                </View>
              )}
            </View>
          )}

          <View style={[
            styles.explainCard,
            isDarkMode ? styles.cardDark : styles.cardLight
          ]}>
            <Text style={[styles.explainTitle, isDarkMode ? styles.textDark : styles.textLight]}>
              {t('rpe_chart')}
            </Text>
            <Text style={[styles.explainText, isDarkMode ? styles.textDark : styles.textLight]}>
              {t('rpe_explanation')}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: '#f8f9fa',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  headerLight: {
    backgroundColor: '#fff',
    borderBottomColor: '#eee',
  },
  headerDark: {
    backgroundColor: '#1e1e1e',
    borderBottomColor: '#333',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptySpace: {
    width: 40,
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
  },
  textLight: {
    color: '#333',
  },
  textDark: {
    color: '#fff',
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardLight: {
    backgroundColor: '#fff',
  },
  cardDark: {
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#333',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  inputLight: {
    backgroundColor: '#f9f9f9',
    borderColor: '#ddd',
    color: '#333',
  },
  inputDark: {
    backgroundColor: '#2c2c2c',
    borderColor: '#444',
    color: '#fff',
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonLight: {
    backgroundColor: '#007bff',
  },
  buttonDark: {
    backgroundColor: '#0056b3',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextLight: {
    color: '#fff',
  },
  buttonTextDark: {
    color: '#fff',
  },
  clearButton: {
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
  },
  clearButtonLight: {
    backgroundColor: 'transparent',
    borderColor: '#ddd',
  },
  clearButtonDark: {
    backgroundColor: 'transparent',
    borderColor: '#444',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  clearButtonTextLight: {
    color: '#666',
  },
  clearButtonTextDark: {
    color: '#aaa',
  },
  resultCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 16,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  explainCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  explainTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  explainText: {
    fontSize: 15,
    lineHeight: 24,
  },
  segmentedControlContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  segmentDark: {
    backgroundColor: '#2c2c2c',
  },
  segmentLight: {
    backgroundColor: '#f1f1f1',
  },
  leftSegment: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  rightSegment: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  activeSegmentLight: {
    backgroundColor: '#007bff',
  },
  activeSegmentDark: {
    backgroundColor: '#0056b3',
  },
  activeSegmentText: {
    color: '#fff',
    fontWeight: '600',
  },
}); 