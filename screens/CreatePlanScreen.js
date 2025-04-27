import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { t } from '../i18n';

// 訓練強度選項
const intensityLevels = [
  { id: 'beginner', label: '初學者', description: '適合剛開始訓練的人' },
  { id: 'intermediate', label: '中級', description: '有1-2年訓練經驗的人' },
  { id: 'advanced', label: '進階', description: '有3年以上訓練經驗的人' }
];

// 週期類型
const cycleTypes = [
  { id: 'macro', title: '大週期', description: '通常持續3-6個月，針對特定目標的整體訓練週期' },
  { id: 'meso', title: '中週期', description: '通常持續3-6週，著重於特定訓練適應性的發展階段' },
  { id: 'micro', title: '小週期', description: '通常持續7-10天，包含每天的具體訓練安排' }
];

export default function CreatePlanScreen({ onBack, selectedGoal, onPlanCreated }) {
  const { isDarkMode } = useContext(ThemeContext);
  const [planName, setPlanName] = useState('');
  const [duration, setDuration] = useState('12');
  const [frequency, setFrequency] = useState('4');
  const [intensityLevel, setIntensityLevel] = useState('intermediate');
  const [notes, setNotes] = useState('');
  const [useCycles, setUseCycles] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // 選擇強度等級
  const selectIntensity = (level) => {
    setIntensityLevel(level);
  };
  
  // 創建訓練計劃
  const createPlan = async () => {
    // 驗證數據
    if (!planName.trim()) {
      Alert.alert('錯誤', '請輸入計劃名稱');
      return;
    }
    
    if (!duration || isNaN(parseInt(duration)) || parseInt(duration) <= 0) {
      Alert.alert('錯誤', '請輸入有效的週期數量');
      return;
    }
    
    if (!frequency || isNaN(parseInt(frequency)) || parseInt(frequency) <= 0 || parseInt(frequency) > 7) {
      Alert.alert('錯誤', '請輸入有效的每週訓練次數 (1-7)');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 生成計劃 ID
      const planId = 'plan_' + new Date().getTime();
      
      // 創建新計劃
      const newPlan = {
        id: planId,
        name: planName,
        goalType: selectedGoal.id,
        duration: parseInt(duration),
        frequency: parseInt(frequency),
        intensityLevel,
        useCycles,
        notes,
        createdAt: new Date().toISOString(),
        workouts: []
      };
      
      // 預先生成訓練日程 (示例)
      if (useCycles) {
        // 生成週期化訓練計劃
        const mesoLength = 4; // 每個中週期4週
        const mesoCount = Math.ceil(parseInt(duration) / mesoLength);
        
        // 簡單示例: 三種中週期類型輪流 (基礎/強度/恢復)
        const mesoCycles = [];
        for (let i = 0; i < mesoCount; i++) {
          const cycleType = i % 3 === 0 ? 'base' : (i % 3 === 1 ? 'intensity' : 'recovery');
          const remainingWeeks = Math.min(mesoLength, parseInt(duration) - i * mesoLength);
          
          // 創建中週期
          const mesoCycle = {
            id: `meso_${planId}_${i}`,
            name: cycleType === 'base' ? '基礎階段' : 
                 (cycleType === 'intensity' ? '強度階段' : '恢復階段'),
            type: cycleType,
            weeks: Array.from({ length: remainingWeeks }, (_, j) => {
              // 創建小週期 (1週)
              return {
                id: `week_${planId}_${i}_${j}`,
                name: `第 ${i * mesoLength + j + 1} 週`,
                workouts: Array.from({ length: parseInt(frequency) }, (_, k) => {
                  // 創建訓練日
                  return {
                    id: `workout_${planId}_${i}_${j}_${k}`,
                    day: k + 1,
                    name: '訓練日 ' + (k + 1),
                    completed: false,
                    exercises: []
                  };
                })
              };
            })
          };
          
          mesoCycles.push(mesoCycle);
        }
        
        newPlan.cycles = {
          type: 'periodized',
          mesoCycles
        };
      } else {
        // 生成簡單訓練計劃 (無週期化)
        newPlan.cycles = {
          type: 'simple',
          weeks: Array.from({ length: parseInt(duration) }, (_, i) => {
            return {
              id: `week_${planId}_${i}`,
              name: `第 ${i + 1} 週`,
              workouts: Array.from({ length: parseInt(frequency) }, (_, j) => {
                return {
                  id: `workout_${planId}_${i}_${j}`,
                  day: j + 1,
                  name: '訓練日 ' + (j + 1),
                  completed: false,
                  exercises: []
                };
              })
            };
          })
        };
      }
      
      // 獲取現有計劃
      const savedPlansJson = await AsyncStorage.getItem('training_plans');
      const savedPlans = savedPlansJson ? JSON.parse(savedPlansJson) : [];
      
      // 添加新計劃
      const updatedPlans = [...savedPlans, newPlan];
      
      // 保存更新後的計劃列表
      await AsyncStorage.setItem('training_plans', JSON.stringify(updatedPlans));
      
      // 通知父組件
      if (onPlanCreated) {
        onPlanCreated(newPlan);
      }
      
      // 顯示成功消息
      Alert.alert(
        '成功',
        '訓練計劃創建成功！',
        [{ text: '確定', onPress: () => onBack() }]
      );
    } catch (error) {
      console.error('創建訓練計劃失敗:', error);
      Alert.alert('錯誤', '無法創建訓練計劃');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <ScrollView 
      style={[
        styles.container, 
        isDarkMode ? styles.containerDark : styles.containerLight
      ]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
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
          創建訓練計劃
        </Text>
      </View>
      
      <View style={styles.goalInfoContainer}>
        <MaterialCommunityIcons
          name={selectedGoal?.icon || 'dumbbell'}
          size={28}
          color={isDarkMode ? '#fff' : '#333'}
          style={styles.goalIcon}
        />
        <Text style={[
          styles.goalTitle,
          isDarkMode ? styles.textDark : styles.textLight
        ]}>
          {selectedGoal?.title || '自定義訓練'} 訓練計劃
        </Text>
      </View>
      
      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={[
            styles.inputLabel,
            isDarkMode ? styles.textDark : styles.textLight
          ]}>
            計劃名稱
          </Text>
          <TextInput
            style={[
              styles.textInput,
              isDarkMode ? styles.inputDark : styles.inputLight
            ]}
            value={planName}
            onChangeText={setPlanName}
            placeholder="輸入計劃名稱..."
            placeholderTextColor={isDarkMode ? '#999' : '#aaa'}
          />
        </View>
        
        <View style={styles.inputRow}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={[
              styles.inputLabel,
              isDarkMode ? styles.textDark : styles.textLight
            ]}>
              持續週數
            </Text>
            <TextInput
              style={[
                styles.textInput,
                isDarkMode ? styles.inputDark : styles.inputLight
              ]}
              value={duration}
              onChangeText={setDuration}
              placeholder="例：12"
              placeholderTextColor={isDarkMode ? '#999' : '#aaa'}
              keyboardType="numeric"
            />
          </View>
          
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={[
              styles.inputLabel,
              isDarkMode ? styles.textDark : styles.textLight
            ]}>
              每週訓練天數
            </Text>
            <TextInput
              style={[
                styles.textInput,
                isDarkMode ? styles.inputDark : styles.inputLight
              ]}
              value={frequency}
              onChangeText={setFrequency}
              placeholder="例：4"
              placeholderTextColor={isDarkMode ? '#999' : '#aaa'}
              keyboardType="numeric"
            />
          </View>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={[
            styles.inputLabel,
            isDarkMode ? styles.textDark : styles.textLight
          ]}>
            訓練強度
          </Text>
          <View style={styles.intensityOptions}>
            {intensityLevels.map(level => (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.intensityOption,
                  intensityLevel === level.id && styles.intensityOptionSelected,
                  isDarkMode 
                    ? styles.intensityOptionDark 
                    : styles.intensityOptionLight,
                  intensityLevel === level.id && isDarkMode 
                    ? styles.intensityOptionSelectedDark 
                    : (intensityLevel === level.id 
                        ? styles.intensityOptionSelectedLight 
                        : null)
                ]}
                onPress={() => selectIntensity(level.id)}
              >
                <Text style={[
                  styles.intensityLabel,
                  intensityLevel === level.id && styles.intensityLabelSelected,
                  isDarkMode 
                    ? styles.textDark 
                    : styles.textLight
                ]}>
                  {level.label}
                </Text>
                <Text style={[
                  styles.intensityDescription,
                  isDarkMode 
                    ? styles.textDarkSecondary 
                    : styles.textLightSecondary
                ]}>
                  {level.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.inputGroup}>
          <View style={styles.cycleToggleContainer}>
            <Text style={[
              styles.inputLabel,
              isDarkMode ? styles.textDark : styles.textLight
            ]}>
              使用週期化訓練
            </Text>
            <Switch
              value={useCycles}
              onValueChange={setUseCycles}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={useCycles ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
          
          {useCycles && (
            <Text style={[
              styles.cycleDescription,
              isDarkMode ? styles.textDarkSecondary : styles.textLightSecondary
            ]}>
              週期化訓練將自動將您的計劃分為不同階段，包括基礎、強度和恢復週期。
            </Text>
          )}
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={[
            styles.inputLabel,
            isDarkMode ? styles.textDark : styles.textLight
          ]}>
            計劃備註（選填）
          </Text>
          <TextInput
            style={[
              styles.textArea,
              isDarkMode ? styles.inputDark : styles.inputLight
            ]}
            value={notes}
            onChangeText={setNotes}
            placeholder="輸入計劃相關備註..."
            placeholderTextColor={isDarkMode ? '#999' : '#aaa'}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
        
        <TouchableOpacity
          style={[
            styles.createButton,
            isDarkMode ? styles.buttonDark : styles.buttonLight,
            isLoading && styles.buttonDisabled
          ]}
          onPress={createPlan}
          disabled={isLoading}
        >
          {isLoading ? (
            <Text style={styles.createButtonText}>
              創建中...
            </Text>
          ) : (
            <Text style={styles.createButtonText}>
              創建訓練計劃
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  containerLight: {
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  textDark: {
    color: '#ffffff',
  },
  textLight: {
    color: '#000000',
  },
  textDarkSecondary: {
    color: '#aaaaaa',
  },
  textLightSecondary: {
    color: '#666666',
  },
  goalInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(100, 100, 255, 0.1)',
  },
  goalIcon: {
    marginRight: 12,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  formContainer: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    height: 46,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  inputDark: {
    backgroundColor: '#333',
    borderColor: '#555',
    color: '#fff',
  },
  inputLight: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    color: '#000',
  },
  textArea: {
    minHeight: 100,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    borderWidth: 1,
  },
  intensityOptions: {
    flexDirection: 'column',
  },
  intensityOption: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  intensityOptionLight: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
  },
  intensityOptionDark: {
    backgroundColor: '#333',
    borderColor: '#555',
  },
  intensityOptionSelected: {
    borderWidth: 2,
  },
  intensityOptionSelectedLight: {
    borderColor: '#007bff',
  },
  intensityOptionSelectedDark: {
    borderColor: '#81b0ff',
  },
  intensityLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  intensityLabelSelected: {
    color: '#007bff',
  },
  intensityDescription: {
    fontSize: 14,
  },
  cycleToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cycleDescription: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  createButton: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDark: {
    backgroundColor: '#007bff',
  },
  buttonLight: {
    backgroundColor: '#007bff',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 