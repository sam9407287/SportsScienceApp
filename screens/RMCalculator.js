import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  FlatList,
  SafeAreaView,
  Modal,
  Pressable,
  StatusBar,
  Dimensions,
  Image,
  Platform,
  TouchableWithoutFeedback,
  KeyboardAvoidingView
} from 'react-native';
import { t } from '../i18n';
import { ThemeContext } from '../context/ThemeContext';

// 獲取屏幕尺寸
const { width, height } = Dimensions.get('window');

// 自定義模態框組件 - 簡單確保在所有設備上能正確顯示
const ExerciseSelectionModal = ({ visible, onClose, options, selectedValue, onSelect, isDarkMode }) => {
  if (!visible) return null;
  
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
          }} />
        </TouchableWithoutFeedback>
        
        <View style={{
          backgroundColor: isDarkMode ? '#1e1e1e' : '#fff',
          borderRadius: 15,
          width: '80%',
          alignSelf: 'center',
          maxHeight: '70%',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDarkMode ? 0.25 : 0.1,
          shadowRadius: 3.84,
          elevation: 5,
          borderWidth: isDarkMode ? 1 : 0,
          borderColor: isDarkMode ? '#333' : 'transparent',
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? '#333' : '#f0f0f0',
            padding: 15,
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: isDarkMode ? '#fff' : '#333',
            }}>{t('select_exercise', '選擇訓練動作')}</Text>
            <TouchableOpacity
              style={{
                width: 30,
                height: 30,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={onClose}
            >
              <Text style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: isDarkMode ? '#fff' : '#333',
              }}>×</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={{ maxHeight: height * 0.5 }}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 15,
                  borderBottomWidth: 1,
                  borderBottomColor: isDarkMode ? '#333' : '#f0f0f0',
                  backgroundColor: selectedValue === option.value 
                    ? (isDarkMode 
                        ? 'rgba(67, 97, 238, 0.1)' 
                        : 'rgba(0, 122, 255, 0.05)')
                    : 'transparent',
                }}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                }}
              >
                <Text style={{
                  fontSize: 16,
                  color: selectedValue === option.value 
                    ? (isDarkMode ? '#4361ee' : '#007AFF') 
                    : (isDarkMode ? '#fff' : '#333'),
                  fontWeight: selectedValue === option.value ? 'bold' : 'normal',
                }}>
                  {option.label}
                </Text>
                {selectedValue === option.value && (
                  <Text style={{
                    color: isDarkMode ? '#4361ee' : '#007AFF',
                    fontSize: 18,
                    fontWeight: 'bold',
                  }}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default function RMCalculator({ onBack }) {
  const { isDarkMode } = useContext(ThemeContext);
  
  // 状态管理
  const [gender, setGender] = useState('male'); // 性别：男/女
  const [age, setAge] = useState(''); // 年龄
  const [exercise, setExercise] = useState('general'); // 训练动作
  const [weight, setWeight] = useState(''); // 重量
  const [reps, setReps] = useState(''); // 次数
  const [bodyWeight, setBodyWeight] = useState(''); // 体重（仅用于引体向上）
  const [rmValues, setRmValues] = useState([]); // RM值数组
  const [modalVisible, setModalVisible] = useState(false); // 控制动作选择模态框

  // 训练动作列表
  const exerciseOptions = [
    { label: t('squat', '深蹲'), value: 'squat' },
    { label: t('deadlift', '硬舉'), value: 'deadlift' },
    { label: t('sumo_deadlift', '相撲硬舉'), value: 'sumo_deadlift' },
    { label: t('high_bar_squat', '高背槓深蹲'), value: 'high_bar_squat' },
    { label: t('low_bar_squat', '低背槓深蹲'), value: 'low_bar_squat' },
    { label: t('row', '划船'), value: 'row' },
    { label: t('pull_up', '引體向上'), value: 'pull_up' },
    { label: t('shoulder_press', '肩推'), value: 'shoulder_press' },
    { label: t('bench_press', '臥推'), value: 'bench_press' },
    { label: t('general_model', '通用模型'), value: 'general' },
  ];

  // 计算RM值的函数
  const calculateRM = () => {
    if (!weight || !reps || (exercise === 'pull_up' && !bodyWeight)) {
      alert(t('fill_all_required_fields', '請填寫必填項'));
      return;
    }

    const w = parseFloat(weight);
    const r = parseFloat(reps);
    const bw = exercise === 'pull_up' ? parseFloat(bodyWeight) : 0;

    if (isNaN(w) || isNaN(r) || (exercise === 'pull_up' && isNaN(bw))) {
      alert(t('invalid_input', '輸入無效'));
      return;
    }

    // 使用Epley公式计算1RM
    const epley = w * (1 + r / 30);

    // 使用Brzycki公式计算1RM
    const brzycki = w * (36 / (37 - r));

    // 使用McGlothin公式计算1RM
    const mcglothin = (100 * w) / (101.3 - 2.67123 * r);

    // 使用Lombardi公式计算1RM
    const lombardi = w * Math.pow(r, 0.1);

    // 根据运动类型和个体特征调整预测RM
    let adjustedRM = (epley + brzycki + mcglothin + lombardi) / 4;
    
    // 調整系數 - 根據國際體壇研究數據及實際經驗優化
    const genderFactor = gender === 'male' ? 1.0 : 0.85; // 女性平均力量为男性的85%
    const ageFactor = age 
      ? (parseInt(age) < 20 
          ? 0.9 
          : parseInt(age) > 50 
            ? 0.8 
            : 1.0) 
      : 1.0;
    
    // 針對不同的動作做特定的調整
    let exerciseFactor = 1.0;
    switch(exercise) {
      case 'squat':
      case 'high_bar_squat':
        exerciseFactor = 0.98;
        break;
      case 'low_bar_squat':
        exerciseFactor = 1.05;
        break;
      case 'deadlift':
        exerciseFactor = 1.03;
        break;
      case 'sumo_deadlift':
        exerciseFactor = 1.02;
        break;
      case 'bench_press':
        exerciseFactor = 1.0;
        break;
      case 'shoulder_press':
        exerciseFactor = 0.95;
        break;
      case 'row':
        exerciseFactor = 0.97;
        break;
      case 'pull_up':
        // 引體向上需要考慮體重
        exerciseFactor = 0.9;
        // 如果是做附重引體向上
        if (w > 0) {
          // 計算總負荷（體重+附加重量）的1RM
          adjustedRM = (bw + w) * exerciseFactor * genderFactor * ageFactor;
          // 然後減去體重得到附加重量的1RM
          adjustedRM = adjustedRM - bw;
        } else {
          // 做不附重的引體向上，返回體重的百分比
          adjustedRM = bw * exerciseFactor * genderFactor * ageFactor;
        }
        break;
      case 'general':
      default:
        exerciseFactor = 1.0;
    }
    
    // 如果不是引體向上，正常計算
    if (exercise !== 'pull_up') {
      adjustedRM = adjustedRM * exerciseFactor * genderFactor * ageFactor;
    }
    
    // 计算不同次数的RM
    const results = [];
    for (let i = 1; i <= 10; i++) {
      let repRM;
      if (i === 1) {
        repRM = Math.round(adjustedRM);
      } else {
        // 使用调整后的Epley公式反向计算不同次数RM
        repRM = Math.round(adjustedRM / (1 + i / 30));
      }
      
      results.push({
        reps: i,
        weight: repRM
      });
    }
    
    setRmValues(results);
  };

  // 当输入改变时重新计算
  useEffect(() => {
    calculateRM();
  }, [weight, reps, gender, age, exercise, bodyWeight]);

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === "ios" ? "padding" : null}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <SafeAreaView 
        style={[
          {
            flex: 1,
          },
          isDarkMode ? { backgroundColor: '#121212' } : { backgroundColor: '#f7f7f7' }
        ]}
      >
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={isDarkMode ? '#121212' : '#f7f7f7'}
        />
        
        {/* 標題欄 */}
        <View style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
          },
          isDarkMode ? { borderBottomColor: '#333' } : { borderBottomColor: '#e1e1e1' }
        ]}>
          <TouchableOpacity
            style={{
              width: 40,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={onBack}
          >
            <Text style={[
              {
                fontSize: 24,
                fontWeight: 'bold',
              },
              isDarkMode ? { color: '#fff' } : { color: '#333' }
            ]}>
              ←
            </Text>
          </TouchableOpacity>
          
          <Text style={[
            {
              fontSize: 18,
              fontWeight: 'bold',
            },
            isDarkMode ? { color: '#fff' } : { color: '#333' }
          ]}>
            {t('rm_calculator', 'RM 計算器')}
          </Text>
          
          <View style={{ width: 40, height: 40 }} />
        </View>
        
        <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
          {/* 性別選擇 */}
          <View style={[
            {
              marginTop: 20,
              marginBottom: 10,
              borderRadius: 8,
              padding: 12,
            },
            isDarkMode ? { backgroundColor: '#1e1e1e', borderWidth: 1, borderColor: '#333' } : { backgroundColor: '#fff' }
          ]}>
            <Text style={[
              {
                fontSize: 16,
                fontWeight: '600',
                marginBottom: 8,
              },
              isDarkMode ? { color: '#fff' } : { color: '#333' }
            ]}>
              {t('gender', '性別')}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity
                style={[
                  {
                    flex: 1,
                    height: 48,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 8,
                    borderWidth: 1,
                    marginHorizontal: 4,
                  },
                  gender === 'male' && { borderColor: '#007AFF' },
                  gender === 'male' && { backgroundColor: 'rgba(0, 122, 255, 0.1)' },
                  gender === 'male' && { borderWidth: 2 },
                  isDarkMode && { backgroundColor: '#262626', borderColor: '#444' }
                ]}
                onPress={() => setGender('male')}
              >
                <Text style={[
                  {
                    fontSize: 16,
                    fontWeight: '500',
                    color: '#333',
                  },
                  gender === 'male' && { fontWeight: 'bold', color: '#007AFF' },
                  isDarkMode && { color: '#fff' }
                ]}>
                  {t('male', '男')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  {
                    flex: 1,
                    height: 48,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 8,
                    borderWidth: 1,
                    marginHorizontal: 4,
                  },
                  gender === 'female' && { borderColor: '#007AFF' },
                  gender === 'female' && { backgroundColor: 'rgba(0, 122, 255, 0.1)' },
                  gender === 'female' && { borderWidth: 2 },
                  isDarkMode && { backgroundColor: '#262626', borderColor: '#444' }
                ]}
                onPress={() => setGender('female')}
              >
                <Text style={[
                  {
                    fontSize: 16,
                    fontWeight: '500',
                    color: '#333',
                  },
                  gender === 'female' && { fontWeight: 'bold', color: '#007AFF' },
                  isDarkMode && { color: '#fff' }
                ]}>
                  {t('female', '女')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* 年齡輸入 */}
          <View style={[
            {
              marginTop: 20,
              marginBottom: 10,
              borderRadius: 8,
              padding: 12,
            },
            isDarkMode ? { backgroundColor: '#1e1e1e', borderWidth: 1, borderColor: '#333' } : { backgroundColor: '#fff' }
          ]}>
            <Text style={[
              {
                fontSize: 16,
                fontWeight: '600',
                marginBottom: 8,
              },
              isDarkMode ? { color: '#fff' } : { color: '#333' }
            ]}>
              {t('age', '年齡')}
              <Text style={{ fontSize: 14, fontWeight: 'normal', color: '#888' }}> ({t('optional', '選填')})</Text>
            </Text>
            <TextInput
              style={[
                {
                  height: 48,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  fontSize: 16,
                  borderWidth: 1,
                },
                isDarkMode ? { backgroundColor: '#262626', borderColor: '#444', color: '#fff' } : { backgroundColor: '#f9f9f9', borderColor: '#e1e1e1', color: '#333' }
              ]}
              placeholder={t('enter_age', '輸入年齡')}
              placeholderTextColor={isDarkMode ? '#888' : '#aaa'}
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
            />
          </View>
          
          {/* 訓練動作選擇 */}
          <View style={[
            {
              marginTop: 20,
              marginBottom: 10,
              borderRadius: 8,
              padding: 12,
            },
            isDarkMode ? { backgroundColor: '#1e1e1e', borderWidth: 1, borderColor: '#333' } : { backgroundColor: '#fff' }
          ]}>
            <Text style={[
              {
                fontSize: 16,
                fontWeight: '600',
                marginBottom: 8,
              },
              isDarkMode ? { color: '#fff' } : { color: '#333' }
            ]}>
              {t('exercise', '訓練動作')}
            </Text>
            <TouchableOpacity
              style={[
                {
                  height: 48,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                },
                isDarkMode ? { backgroundColor: '#262626', borderColor: '#444' } : { backgroundColor: '#f9f9f9', borderColor: '#e1e1e1' }
              ]}
              onPress={() => setModalVisible(true)}
            >
              <Text style={[
                {
                  fontSize: 16,
                },
                isDarkMode ? { color: '#fff' } : { color: '#333' }
              ]}>
                {exerciseOptions.find(opt => opt.value === exercise)?.label || t('select_exercise', '選擇訓練動作')}
              </Text>
              <Text style={{ fontSize: 14, color: '#888' }}>▼</Text>
            </TouchableOpacity>
          </View>
          
          {/* 體重輸入 (僅針對引體向上) */}
          {exercise === 'pull_up' && (
            <View style={[
              {
                marginTop: 20,
                marginBottom: 10,
                borderRadius: 8,
                padding: 12,
              },
              isDarkMode ? { backgroundColor: '#1e1e1e', borderWidth: 1, borderColor: '#333' } : { backgroundColor: '#fff' }
            ]}>
              <Text style={[
                {
                  fontSize: 16,
                  fontWeight: '600',
                  marginBottom: 8,
                },
                isDarkMode ? { color: '#fff' } : { color: '#333' }
              ]}>
                {t('body_weight', '體重')} (kg)
              </Text>
              <TextInput
                style={[
                  {
                    height: 48,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    fontSize: 16,
                    borderWidth: 1,
                  },
                  isDarkMode ? { backgroundColor: '#262626', borderColor: '#444', color: '#fff' } : { backgroundColor: '#f9f9f9', borderColor: '#e1e1e1', color: '#333' }
                ]}
                placeholder={t('enter_body_weight', '輸入體重')}
                placeholderTextColor={isDarkMode ? '#888' : '#aaa'}
                value={bodyWeight}
                onChangeText={setBodyWeight}
                keyboardType="numeric"
              />
            </View>
          )}
          
          {/* 重量輸入 */}
          <View style={[
            {
              marginTop: 20,
              marginBottom: 10,
              borderRadius: 8,
              padding: 12,
            },
            isDarkMode ? { backgroundColor: '#1e1e1e', borderWidth: 1, borderColor: '#333' } : { backgroundColor: '#fff' }
          ]}>
            <Text style={[
              {
                fontSize: 16,
                fontWeight: '600',
                marginBottom: 8,
              },
              isDarkMode ? { color: '#fff' } : { color: '#333' }
            ]}>
              {exercise === 'pull_up' 
                ? t('added_weight', '附加重量') 
                : t('weight', '重量')} (kg)
            </Text>
            <TextInput
              style={[
                {
                  height: 48,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  fontSize: 16,
                  borderWidth: 1,
                },
                isDarkMode ? { backgroundColor: '#262626', borderColor: '#444', color: '#fff' } : { backgroundColor: '#f9f9f9', borderColor: '#e1e1e1', color: '#333' }
              ]}
              placeholder={exercise === 'pull_up' 
                ? t('enter_added_weight', '輸入附加重量 (0表示無附加重量)') 
                : t('enter_weight', '輸入重量')}
              placeholderTextColor={isDarkMode ? '#888' : '#aaa'}
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
            />
          </View>
          
          {/* 次數輸入 */}
          <View style={[
            {
              marginTop: 20,
              marginBottom: 10,
              borderRadius: 8,
              padding: 12,
            },
            isDarkMode ? { backgroundColor: '#1e1e1e', borderWidth: 1, borderColor: '#333' } : { backgroundColor: '#fff' }
          ]}>
            <Text style={[
              {
                fontSize: 16,
                fontWeight: '600',
                marginBottom: 8,
              },
              isDarkMode ? { color: '#fff' } : { color: '#333' }
            ]}>
              {t('reps', '次數')}
            </Text>
            <TextInput
              style={[
                {
                  height: 48,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  fontSize: 16,
                  borderWidth: 1,
                },
                isDarkMode ? { backgroundColor: '#262626', borderColor: '#444', color: '#fff' } : { backgroundColor: '#f9f9f9', borderColor: '#e1e1e1', color: '#333' }
              ]}
              placeholder={t('enter_reps', '輸入完成的次數')}
              placeholderTextColor={isDarkMode ? '#888' : '#aaa'}
              value={reps}
              onChangeText={setReps}
              keyboardType="numeric"
            />
          </View>
          
          {/* 計算按鈕 */}
          <TouchableOpacity
            style={[
              {
                height: 50,
                borderRadius: 8,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 24,
                marginBottom: 30,
              },
              isDarkMode ? { backgroundColor: '#4361ee' } : { backgroundColor: '#007AFF' }
            ]}
            onPress={calculateRM}
          >
            <Text style={[
              {
                color: '#fff',
                fontSize: 18,
                fontWeight: 'bold',
              },
              isDarkMode ? { color: '#fff' } : { color: '#fff' }
            ]}>
              {t('calculate', '計算')}
            </Text>
          </TouchableOpacity>
          
          {/* 結果顯示 */}
          {rmValues.length > 0 && (
            <View style={[
              {
                borderRadius: 8,
                padding: 16,
                marginBottom: 30,
              },
              isDarkMode ? { backgroundColor: '#1e1e1e', borderWidth: 1, borderColor: '#333' } : { backgroundColor: '#fff' }
            ]}>
              <Text style={[
                {
                  fontSize: 18,
                  fontWeight: 'bold',
                  marginBottom: 16,
                  textAlign: 'center',
                },
                isDarkMode ? { color: '#fff' } : { color: '#333' }
              ]}>
                {t('estimated_rm', '預估 RM 值')}
              </Text>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#e1e1e1', marginBottom: 8 }}>
                <Text style={[
                  {
                    fontSize: 16,
                    fontWeight: 'bold',
                    flex: 1,
                    textAlign: 'center',
                  },
                  isDarkMode ? { color: '#fff' } : { color: '#333' }
                ]}>
                  {t('reps', '次數')}
                </Text>
                <Text style={[
                  {
                    fontSize: 16,
                    fontWeight: 'bold',
                    flex: 1,
                    textAlign: 'center',
                  },
                  isDarkMode ? { color: '#fff' } : { color: '#333' }
                ]}>
                  {t('weight', '重量')} (kg)
                </Text>
              </View>
              
              {rmValues.map((item, index) => (
                <View
                  key={index}
                  style={[
                    {
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      paddingVertical: 10,
                      borderBottomWidth: 1,
                      borderBottomColor: '#e1e1e1',
                    },
                    index % 2 === 0 ? { backgroundColor: '#f9f9f9' } : null,
                    index === 0 ? { backgroundColor: 'rgba(0, 122, 255, 0.1)' } : null
                  ]}>
                  <Text style={[
                    {
                      fontSize: 16,
                      flex: 1,
                      textAlign: 'center',
                    },
                    isDarkMode ? { color: '#fff' } : { color: '#333' },
                    index === 0 ? { fontWeight: 'bold', color: '#007AFF' } : null
                  ]}>
                    {item.reps}
                  </Text>
                  <Text style={[
                    {
                      fontSize: 16,
                      flex: 1,
                      textAlign: 'center',
                    },
                    isDarkMode ? { color: '#fff' } : { color: '#333' },
                    index === 0 ? { fontWeight: 'bold', color: '#007AFF' } : null
                  ]}>
                    {item.weight}
                  </Text>
                </View>
              ))}
              
              <Text style={[
                {
                  fontSize: 12,
                  marginTop: 16,
                  fontStyle: 'italic',
                  textAlign: 'center',
                },
                isDarkMode ? { color: '#aaa' } : { color: '#666' }
              ]}>
                {t('rm_disclaimer', '注意: 此為估算值，實際值可能因個人技術、疲勞程度等因素而異')}
              </Text>
            </View>
          )}
        </ScrollView>
        
        {/* 動作選擇模態框 */}
        <ExerciseSelectionModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          options={exerciseOptions}
          selectedValue={exercise}
          onSelect={setExercise}
          isDarkMode={isDarkMode}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// 樣式定義
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: '#f7f7f7',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLight: {
    backgroundColor: '#fff',
    borderBottomColor: '#e1e1e1',
  },
  headerDark: {
    backgroundColor: '#1e1e1e',
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  textLight: {
    color: '#333',
  },
  textDark: {
    color: '#fff',
  },
  inputGroup: {
    marginTop: 20,
    marginBottom: 10,
    borderRadius: 8,
    padding: 12,
  },
  inputGroupLight: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputGroupDark: {
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#333',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  optional: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#888',
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  inputLight: {
    backgroundColor: '#f9f9f9',
    borderColor: '#e1e1e1',
    color: '#333',
  },
  inputDark: {
    backgroundColor: '#262626',
    borderColor: '#444',
    color: '#fff',
  },
  genderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  genderButtonDark: {
    backgroundColor: '#262626',
    borderColor: '#444',
  },
  genderButtonActive: {
    borderWidth: 2,
  },
  genderButtonActiveLight: {
    borderColor: '#007AFF',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  genderButtonActiveDark: {
    borderColor: '#4361ee',
    backgroundColor: 'rgba(67, 97, 238, 0.2)',
  },
  genderButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  genderButtonTextActive: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
  selectButton: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectButtonLight: {
    backgroundColor: '#f9f9f9',
    borderColor: '#e1e1e1',
  },
  selectButtonDark: {
    backgroundColor: '#262626',
    borderColor: '#444',
  },
  selectButtonText: {
    fontSize: 16,
  },
  selectButtonIcon: {
    fontSize: 14,
    color: '#888',
  },
  calculateButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 30,
  },
  calculateButtonLight: {
    backgroundColor: '#007AFF',
  },
  calculateButtonDark: {
    backgroundColor: '#4361ee',
  },
  calculateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultsContainer: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 30,
  },
  resultsContainerLight: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultsContainerDark: {
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#333',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
    marginBottom: 8,
  },
  resultsHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  resultRowEven: {
    backgroundColor: '#f9f9f9',
  },
  resultRowEvenDark: {
    backgroundColor: '#262626',
  },
  resultRowHighlight: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  resultValue: {
    fontSize: 16,
    flex: 1,
    textAlign: 'center',
  },
  resultValueHighlight: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
  disclaimer: {
    fontSize: 12,
    marginTop: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  }
}); 