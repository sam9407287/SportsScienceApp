import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Modal,
  Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import { t, getCurrentLanguage } from '../i18n';

export default function AerobicCalculator({ onBack }) {
  const { isDarkMode } = useContext(ThemeContext);
  const [calculationType, setCalculationType] = useState('vo2max');
  const [language, setLanguage] = useState('zh');
  
  // VO2Max計算的狀態
  const [age, setAge] = useState('');
  const [restingHR, setRestingHR] = useState('');
  const [maxHR, setMaxHR] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('male');
  const [vo2MaxResult, setVo2MaxResult] = useState(null);
  
  // 心率區間計算的狀態
  const [maxHeartRate, setMaxHeartRate] = useState('');
  const [restingHeartRate, setRestingHeartRate] = useState('');
  const [heartRateZones, setHeartRateZones] = useState(null);
  
  // 獲取當前語言
  useEffect(() => {
    setLanguage(getCurrentLanguage());
  }, []);
  
  // 標題文本
  const getTitleText = () => {
    return t('aerobic');
  };
  
  // 計算預測最大心率
  const calculateEstimatedMaxHR = () => {
    if (age) {
      const estimatedMaxHR = 220 - parseInt(age);
      setMaxHR(estimatedMaxHR.toString());
    }
  };
  
  // 計算VO2Max (使用Uth-Sørensen-Overgaard-Pedersen公式)
  const calculateVO2Max = () => {
    if (maxHR && restingHR) {
      const hrMax = parseInt(maxHR);
      const hrRest = parseInt(restingHR);
      
      // VO2Max = 15.3 × (HRmax/HRrest)
      const vo2Max = 15.3 * (hrMax / hrRest);
      
      setVo2MaxResult(vo2Max.toFixed(1));
    }
  };
  
  // 計算心率區間 (使用Karvonen公式)
  const calculateHeartRateZones = () => {
    if (maxHeartRate && restingHeartRate) {
      const max = parseInt(maxHeartRate);
      const rest = parseInt(restingHeartRate);
      const hrReserve = max - rest;
      
      const zones = [
        // Zone 1: 50-60% (恢復/休閒)
        {
          name: t('hr_zone_1'),
          description: t('hr_zone_1_desc'),
          min: Math.round(rest + (hrReserve * 0.5)),
          max: Math.round(rest + (hrReserve * 0.6))
        },
        // Zone 2: 60-70% (有氧/基礎耐力)
        {
          name: t('hr_zone_2'),
          description: t('hr_zone_2_desc'),
          min: Math.round(rest + (hrReserve * 0.6)),
          max: Math.round(rest + (hrReserve * 0.7))
        },
        // Zone 3: 70-80% (有氧/無氧閾值)
        {
          name: t('hr_zone_3'),
          description: t('hr_zone_3_desc'),
          min: Math.round(rest + (hrReserve * 0.7)),
          max: Math.round(rest + (hrReserve * 0.8))
        },
        // Zone 4: 80-90% (無氧/耐力)
        {
          name: t('hr_zone_4'),
          description: t('hr_zone_4_desc'),
          min: Math.round(rest + (hrReserve * 0.8)),
          max: Math.round(rest + (hrReserve * 0.9))
        },
        // Zone 5: 90-100% (最大努力)
        {
          name: t('hr_zone_5'),
          description: t('hr_zone_5_desc'),
          min: Math.round(rest + (hrReserve * 0.9)),
          max: max
        }
      ];
      
      setHeartRateZones(zones);
    }
  };
  
  // 清除VO2Max計算的數據
  const clearVO2MaxData = () => {
    setAge('');
    setRestingHR('');
    setMaxHR('');
    setWeight('');
    setVo2MaxResult(null);
  };
  
  // 清除心率區間計算的數據
  const clearHRZonesData = () => {
    setMaxHeartRate('');
    setRestingHeartRate('');
    setHeartRateZones(null);
  };
  
  return (
    <SafeAreaView style={[
      styles.container,
      isDarkMode ? styles.containerDark : styles.containerLight
    ]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* 頂部導航欄 */}
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
            color={isDarkMode ? '#ffffff' : '#000000'} 
          />
        </TouchableOpacity>
        <Text style={[
          styles.headerTitle,
          isDarkMode ? styles.textDark : styles.textLight
        ]}>
          {getTitleText()}
        </Text>
        <View style={styles.emptyRight} />
      </View>
      
      {/* 計算類型選擇 */}
      <View style={styles.calculationTypeContainer}>
        <TouchableOpacity
          style={[
            styles.calculationTypeButton,
            calculationType === 'vo2max' ? 
              (isDarkMode ? styles.activeTabDark : styles.activeTabLight) : 
              (isDarkMode ? styles.inactiveTabDark : styles.inactiveTabLight)
          ]}
          onPress={() => setCalculationType('vo2max')}
        >
          <Text style={[
            styles.calculationTypeText,
            calculationType === 'vo2max' ? 
              (isDarkMode ? styles.activeTextDark : styles.activeTextLight) : 
              (isDarkMode ? styles.inactiveTextDark : styles.inactiveTextLight)
          ]}>
            {t('vo2max_calculator')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.calculationTypeButton,
            calculationType === 'heartrate' ? 
              (isDarkMode ? styles.activeTabDark : styles.activeTabLight) : 
              (isDarkMode ? styles.inactiveTabDark : styles.inactiveTabLight)
          ]}
          onPress={() => setCalculationType('heartrate')}
        >
          <Text style={[
            styles.calculationTypeText,
            calculationType === 'heartrate' ? 
              (isDarkMode ? styles.activeTextDark : styles.activeTextLight) : 
              (isDarkMode ? styles.inactiveTextDark : styles.inactiveTextLight)
          ]}>
            {t('hr_zone_calculator')}
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* VO2Max計算 */}
        {calculationType === 'vo2max' && (
          <View style={styles.calculatorContainer}>
            <Text style={[
              styles.sectionTitle,
              isDarkMode ? styles.textDark : styles.textLight
            ]}>
              {t('vo2max_calculator')}
            </Text>
            
            <Text style={[
              styles.description,
              isDarkMode ? styles.textDarkSecondary : styles.textLightSecondary
            ]}>
              {t('vo2max_description')}
            </Text>
            
            {/* 年齡輸入 */}
            <View style={styles.inputGroup}>
              <Text style={[
                styles.inputLabel,
                isDarkMode ? styles.textDark : styles.textLight
              ]}>
                {t('age')}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  isDarkMode ? styles.inputDark : styles.inputLight
                ]}
                value={age}
                onChangeText={setAge}
                placeholder={t('enter_age')}
                placeholderTextColor={isDarkMode ? '#777' : '#999'}
                keyboardType="numeric"
                onEndEditing={calculateEstimatedMaxHR}
              />
            </View>
            
            {/* 靜息心率輸入 */}
            <View style={styles.inputGroup}>
              <Text style={[
                styles.inputLabel,
                isDarkMode ? styles.textDark : styles.textLight
              ]}>
                {t('resting_hr')}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  isDarkMode ? styles.inputDark : styles.inputLight
                ]}
                value={restingHR}
                onChangeText={setRestingHR}
                placeholder={t('enter_resting_hr')}
                placeholderTextColor={isDarkMode ? '#777' : '#999'}
                keyboardType="numeric"
              />
            </View>
            
            {/* 最大心率輸入 */}
            <View style={styles.inputGroup}>
              <Text style={[
                styles.inputLabel,
                isDarkMode ? styles.textDark : styles.textLight
              ]}>
                {t('max_hr')}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  isDarkMode ? styles.inputDark : styles.inputLight
                ]}
                value={maxHR}
                onChangeText={setMaxHR}
                placeholder={t('enter_max_hr')}
                placeholderTextColor={isDarkMode ? '#777' : '#999'}
                keyboardType="numeric"
              />
            </View>
            
            {/* 性別選擇 */}
            <View style={styles.inputGroup}>
              <Text style={[
                styles.inputLabel,
                isDarkMode ? styles.textDark : styles.textLight
              ]}>
                {t('gender')}
              </Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    gender === 'male' && styles.radioButtonSelected,
                    isDarkMode && gender === 'male' && styles.radioButtonSelectedDark
                  ]}
                  onPress={() => setGender('male')}
                >
                  <Text style={[
                    styles.radioText,
                    gender === 'male' ? styles.radioTextSelected : (isDarkMode ? styles.textDark : styles.textLight),
                    isDarkMode && gender === 'male' && styles.radioTextSelectedDark
                  ]}>
                    {t('male')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    gender === 'female' && styles.radioButtonSelected,
                    isDarkMode && gender === 'female' && styles.radioButtonSelectedDark
                  ]}
                  onPress={() => setGender('female')}
                >
                  <Text style={[
                    styles.radioText,
                    gender === 'female' ? styles.radioTextSelected : (isDarkMode ? styles.textDark : styles.textLight),
                    isDarkMode && gender === 'female' && styles.radioTextSelectedDark
                  ]}>
                    {t('female')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* 計算和清除按鈕 */}
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.calculateButton,
                  isDarkMode ? styles.calculateButtonDark : styles.calculateButtonLight
                ]}
                onPress={calculateVO2Max}
              >
                <Text style={styles.calculateButtonText}>
                  {t('calculate')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.clearButton,
                  isDarkMode ? styles.clearButtonDark : styles.clearButtonLight
                ]}
                onPress={clearVO2MaxData}
              >
                <Text style={[
                  styles.clearButtonText,
                  isDarkMode ? styles.clearButtonTextDark : styles.clearButtonTextLight
                ]}>
                  {t('clear')}
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* 結果顯示 */}
            {vo2MaxResult && (
              <View style={[
                styles.resultContainer,
                isDarkMode ? styles.resultContainerDark : styles.resultContainerLight
              ]}>
                <Text style={[
                  styles.resultTitle,
                  isDarkMode ? styles.textDark : styles.textLight
                ]}>
                  {t('vo2max_result')}
                </Text>
                <Text style={[
                  styles.resultValue,
                  isDarkMode ? styles.resultValueDark : styles.resultValueLight
                ]}>
                  {vo2MaxResult} mL/kg/min
                </Text>
                <Text style={[
                  styles.resultExplanation,
                  isDarkMode ? styles.textDarkSecondary : styles.textLightSecondary
                ]}>
                  {t('vo2max_explanation')}
                </Text>
              </View>
            )}
          </View>
        )}
        
        {/* 心率區間計算 */}
        {calculationType === 'heartrate' && (
          <View style={styles.calculatorContainer}>
            <Text style={[
              styles.sectionTitle,
              isDarkMode ? styles.textDark : styles.textLight
            ]}>
              {t('hr_zone_calculator')}
            </Text>
            
            <Text style={[
              styles.description,
              isDarkMode ? styles.textDarkSecondary : styles.textLightSecondary
            ]}>
              {t('hr_zone_description')}
            </Text>
            
            {/* 最大心率輸入 */}
            <View style={styles.inputGroup}>
              <Text style={[
                styles.inputLabel,
                isDarkMode ? styles.textDark : styles.textLight
              ]}>
                {t('max_hr')}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  isDarkMode ? styles.inputDark : styles.inputLight
                ]}
                value={maxHeartRate}
                onChangeText={setMaxHeartRate}
                placeholder={t('enter_max_hr')}
                placeholderTextColor={isDarkMode ? '#777' : '#999'}
                keyboardType="numeric"
              />
            </View>
            
            {/* 靜息心率輸入 */}
            <View style={styles.inputGroup}>
              <Text style={[
                styles.inputLabel,
                isDarkMode ? styles.textDark : styles.textLight
              ]}>
                {t('resting_hr')}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  isDarkMode ? styles.inputDark : styles.inputLight
                ]}
                value={restingHeartRate}
                onChangeText={setRestingHeartRate}
                placeholder={t('enter_resting_hr')}
                placeholderTextColor={isDarkMode ? '#777' : '#999'}
                keyboardType="numeric"
              />
            </View>
            
            {/* 計算和清除按鈕 */}
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.calculateButton,
                  isDarkMode ? styles.calculateButtonDark : styles.calculateButtonLight
                ]}
                onPress={calculateHeartRateZones}
              >
                <Text style={styles.calculateButtonText}>
                  {t('calculate')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.clearButton,
                  isDarkMode ? styles.clearButtonDark : styles.clearButtonLight
                ]}
                onPress={clearHRZonesData}
              >
                <Text style={[
                  styles.clearButtonText,
                  isDarkMode ? styles.clearButtonTextDark : styles.clearButtonTextLight
                ]}>
                  {t('clear')}
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* 心率區間結果 */}
            {heartRateZones && (
              <View style={[
                styles.resultContainer,
                isDarkMode ? styles.resultContainerDark : styles.resultContainerLight
              ]}>
                <Text style={[
                  styles.resultTitle,
                  isDarkMode ? styles.textDark : styles.textLight
                ]}>
                  {t('hr_zone_results')}
                </Text>
                
                {heartRateZones.map((zone, index) => (
                  <View key={index} style={styles.zoneContainer}>
                    <View style={styles.zoneHeader}>
                      <Text style={[
                        styles.zoneName,
                        isDarkMode ? styles.textDark : styles.textLight
                      ]}>
                        {zone.name}
                      </Text>
                      <Text style={[
                        styles.zoneRange,
                        isDarkMode ? styles.textHighlightDark : styles.textHighlightLight
                      ]}>
                        {zone.min} - {zone.max} bpm
                      </Text>
                    </View>
                    <Text style={[
                      styles.zoneDescription,
                      isDarkMode ? styles.textDarkSecondary : styles.textLightSecondary
                    ]}>
                      {zone.description}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: '#f8f9fa',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerLight: {
    backgroundColor: '#fff',
    borderBottomColor: '#e0e0e0',
  },
  headerDark: {
    backgroundColor: '#1e1e1e',
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  emptyRight: {
    width: 40,
  },
  textLight: {
    color: '#333',
  },
  textDark: {
    color: '#fff',
  },
  textLightSecondary: {
    color: '#666',
  },
  textDarkSecondary: {
    color: '#aaa',
  },
  textHighlightLight: {
    color: '#0080ff',
  },
  textHighlightDark: {
    color: '#66b0ff',
  },
  calculationTypeContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  calculationTypeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabLight: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  inactiveTabLight: {
    backgroundColor: '#f0f0f0',
  },
  activeTabDark: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#444',
  },
  inactiveTabDark: {
    backgroundColor: '#1a1a1a',
  },
  calculationTypeText: {
    fontWeight: '500',
  },
  activeTextLight: {
    color: '#0080ff',
  },
  inactiveTextLight: {
    color: '#888',
  },
  activeTextDark: {
    color: '#66b0ff',
  },
  inactiveTextDark: {
    color: '#aaa',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 32,
  },
  calculatorContainer: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  inputLight: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#333',
  },
  inputDark: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#444',
    color: '#fff',
  },
  radioGroup: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  radioButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  radioButtonSelected: {
    backgroundColor: '#0080ff',
    borderColor: '#0080ff',
  },
  radioButtonSelectedDark: {
    backgroundColor: '#0055cc',
    borderColor: '#0055cc',
  },
  radioText: {
    fontSize: 16,
  },
  radioTextSelected: {
    color: '#fff',
    fontWeight: '500',
  },
  radioTextSelectedDark: {
    color: '#fff',
  },
  buttonGroup: {
    flexDirection: 'row',
    marginVertical: 16,
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calculateButton: {
    marginRight: 8,
  },
  calculateButtonLight: {
    backgroundColor: '#0080ff',
  },
  calculateButtonDark: {
    backgroundColor: '#0055cc',
  },
  calculateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    marginLeft: 8,
  },
  clearButtonLight: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  clearButtonDark: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#444',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  clearButtonTextLight: {
    color: '#666',
  },
  clearButtonTextDark: {
    color: '#aaa',
  },
  resultContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  resultContainerLight: {
    backgroundColor: '#f8f9fa',
    borderColor: '#ddd',
  },
  resultContainerDark: {
    backgroundColor: '#2a2a2a',
    borderColor: '#444',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  resultValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  resultValueLight: {
    color: '#0080ff',
  },
  resultValueDark: {
    color: '#66b0ff',
  },
  resultExplanation: {
    fontSize: 14,
    lineHeight: 20,
  },
  zoneContainer: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  zoneName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  zoneRange: {
    fontSize: 16,
    fontWeight: '500',
  },
  zoneDescription: {
    fontSize: 14,
    lineHeight: 20,
  }
}); 