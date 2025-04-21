import React, { useState, useEffect } from 'react';
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

// 獲取屏幕尺寸
const { width, height } = Dimensions.get('window');

// 自定義模態框組件 - 簡單確保在所有設備上能正確顯示
const ExerciseSelectionModal = ({ visible, onClose, options, selectedValue, onSelect, themeColors }) => {
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
          backgroundColor: themeColors.cardBackground,
          borderRadius: 15,
          width: '80%',
          alignSelf: 'center',
          maxHeight: '70%',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: themeColors.inputBorder,
            padding: 15,
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: themeColors.text,
            }}>選擇訓練動作</Text>
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
                color: themeColors.text,
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
                  borderBottomColor: themeColors.inputBorder,
                  backgroundColor: selectedValue === option.value 
                    ? (themeColors.accent === '#e94560' 
                        ? 'rgba(233, 69, 96, 0.1)' 
                        : themeColors.accent === '#6b9080' 
                          ? '#f0f7f4' 
                          : '#f0f5ff')
                    : 'transparent',
                }}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                }}
              >
                <Text style={{
                  fontSize: 16,
                  color: selectedValue === option.value ? themeColors.accent : themeColors.text,
                  fontWeight: selectedValue === option.value ? 'bold' : 'normal',
                }}>
                  {option.label}
                </Text>
                {selectedValue === option.value && (
                  <Text style={{
                    color: themeColors.accent,
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

export default function RMCalculator({ onBack, themeStyle = 'sport', isDarkMode = false }) {
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
    { label: '深蹲', value: 'squat' },
    { label: '硬舉', value: 'deadlift' },
    { label: '相撲硬舉', value: 'sumo_deadlift' },
    { label: '高背槓深蹲', value: 'high_bar_squat' },
    { label: '低背槓深蹲', value: 'low_bar_squat' },
    { label: '划船', value: 'row' },
    { label: '引體向上', value: 'pull_up' },
    { label: '肩推', value: 'shoulder_press' },
    { label: '臥推', value: 'bench_press' },
    { label: '通用模型', value: 'general' },
  ];

  // 获取当前选择的训练动作标签
  const getExerciseLabel = () => {
    const selectedExercise = exerciseOptions.find(option => option.value === exercise);
    return selectedExercise ? selectedExercise.label : '請選擇訓練動作';
  };

  // 计算RM值
  const calculateRM = () => {
    if (!weight || !reps) return;
    
    const weightNum = parseFloat(weight);
    const repsNum = parseInt(reps);
    
    if (isNaN(weightNum) || isNaN(repsNum)) return;
    
    // 基础1RM计算（使用Brzycki公式）
    // 1RM = 重量 × (36 / (37 - 重复次数))
    let oneRM = weightNum * (36 / (37 - repsNum));
    
    // 根据不同训练动作进行特定调整
    switch (exercise) {
      case 'squat':
        // 深蹲特定调整
        oneRM = oneRM * 1.05;
        break;
      case 'deadlift':
        // 硬举特定调整
        oneRM = oneRM * 1.08;
        break;
      case 'sumo_deadlift':
        // 相扑硬举特定调整
        oneRM = oneRM * 1.07;
        break;
      case 'high_bar_squat':
        // 高背杠深蹲调整
        oneRM = oneRM * 1.03;
        break;
      case 'low_bar_squat':
        // 低背杠深蹲调整
        oneRM = oneRM * 1.06;
        break;
      case 'row':
        // 划船特定调整
        oneRM = oneRM * 0.98;
        break;
      case 'bench_press':
        // 臥推特定调整
        oneRM = oneRM * 1.03;
        break;
      case 'pull_up':
        // 引体向上需要考虑体重
        if (bodyWeight && !isNaN(parseFloat(bodyWeight))) {
          const bodyWeightNum = parseFloat(bodyWeight);
          // 引体向上计算：(额外负重 + 体重) * 系数
          oneRM = (weightNum + bodyWeightNum) * (36 / (37 - repsNum)) * 0.95;
        } else {
          // 如果没有输入体重，使用默认计算
          oneRM = oneRM * 0.95;
        }
        break;
      case 'shoulder_press':
        // 肩推特定调整
        oneRM = oneRM * 0.97;
        break;
      case 'general':
      default:
        // 通用模型，不做额外调整
        break;
    }
    
    // 根据性别和年龄进行调整
    let adjustedOneRM = oneRM;
    
    if (age) {
      const ageNum = parseInt(age);
      if (!isNaN(ageNum)) {
        // 年龄调整系数（不同年龄段有不同的调整）
        if (ageNum > 55) {
          adjustedOneRM = adjustedOneRM * 0.90;
        } else if (ageNum > 40) {
          adjustedOneRM = adjustedOneRM * 0.95;
        } else if (ageNum < 18) {
          adjustedOneRM = adjustedOneRM * 0.93;
        }
      }
    }
    
    // 性别调整
    if (gender === 'female') {
      adjustedOneRM = adjustedOneRM * 0.85;
    }
    
    // 计算1RM至20RM
    const results = [];
    for (let i = 1; i <= 20; i++) {
      // 使用不同百分比计算不同的RM
      // 常用公式: n-RM = 1RM * (1 - (n-1) * 0.025)
      const percentage = 1 - (i-1) * 0.025;
      const value = Math.round(adjustedOneRM * percentage * 10) / 10; // 保留一位小数
      results.push({
        rm: i,
        weight: value,
      });
    }
    
    setRmValues(results);
  };

  // 当输入改变时重新计算
  useEffect(() => {
    calculateRM();
  }, [weight, reps, gender, age, exercise, bodyWeight]);

  // 根据不同主题风格返回不同样式
  const getThemeStyles = () => {
    switch(themeStyle) {
      case 'sport':
        return isDarkMode ? sportDarkStyles : sportStyles;
      case 'minimal':
        return isDarkMode ? minimalDarkStyles : minimalStyles;
      case 'professional':
        return isDarkMode ? professionalDarkStyles : professionalStyles;
      case 'fitness':
        return isDarkMode ? fitnessDarkStyles : fitnessStyles;
      case 'modern':
        return isDarkMode ? modernDarkStyles : modernStyles;
      default:
        return isDarkMode ? sportDarkStyles : sportStyles;
    }
  };

  // 根據主題獲取顏色
  const getThemeColors = () => {
    const themes = {
      // 運動風格
      sport: {
        light: {
          background: '#f2f2f2',
          cardBackground: '#fff',
          text: '#333',
          inputBackground: '#f5f5f5',
          inputBorder: '#ddd',
          accent: '#e94560',
          headerBackground: '#e94560',
        },
        dark: {
          background: '#1a1a2e',
          cardBackground: '#16213e',
          text: '#fff',
          inputBackground: '#0f3460',
          inputBorder: '#533483',
          accent: '#e94560',
          headerBackground: '#16213e',
        }
      },
      // 極簡風格
      minimal: {
        light: {
          background: '#f9f9f9',
          cardBackground: '#fff',
          text: '#333',
          inputBackground: '#f5f5f5',
          inputBorder: '#ddd',
          accent: '#6b9080',
          headerBackground: '#fff',
        },
        dark: {
          background: '#2c3e50',
          cardBackground: '#34495e',
          text: '#ecf0f1',
          inputBackground: '#2c3e50',
          inputBorder: '#597ea2',
          accent: '#6b9080',
          headerBackground: '#34495e',
        }
      },
      // 專業風格
      professional: {
        light: {
          background: '#f2f2f2',
          cardBackground: '#fff',
          text: '#333',
          inputBackground: '#f9f9f9',
          inputBorder: '#ddd',
          accent: '#1a2a6c',
          headerBackground: '#1a2a6c',
        },
        dark: {
          background: '#1c2331',
          cardBackground: '#273444',
          text: '#f1f1f1',
          inputBackground: '#1c2331',
          inputBorder: '#394b61',
          accent: '#4267b2',
          headerBackground: '#1c2331',
        }
      },
      // 健身風格
      fitness: {
        light: {
          background: '#f0f4f8',
          cardBackground: '#fff',
          text: '#333',
          inputBackground: '#f0f4f8',
          inputBorder: '#d0d0d0',
          accent: '#ff5722',
          headerBackground: '#ff5722',
        },
        dark: {
          background: '#2d3436',
          cardBackground: '#3c4245',
          text: '#f1f1f1',
          inputBackground: '#2d3436',
          inputBorder: '#5a6268',
          accent: '#ff5722',
          headerBackground: '#2d3436',
        }
      },
      // 現代風格
      modern: {
        light: {
          background: '#eef2f7',
          cardBackground: '#fff',
          text: '#334155',
          inputBackground: '#f1f5f9',
          inputBorder: '#cbd5e1',
          accent: '#3b82f6',
          headerBackground: '#3b82f6',
        },
        dark: {
          background: '#0f172a',
          cardBackground: '#1e293b',
          text: '#f8fafc',
          inputBackground: '#0f172a',
          inputBorder: '#334155',
          accent: '#3b82f6',
          headerBackground: '#1e293b',
        }
      }
    };
    
    return isDarkMode 
      ? themes[themeStyle]?.dark || themes.sport.dark
      : themes[themeStyle]?.light || themes.sport.light;
  };
  
  const themeColors = getThemeColors();
  const styles = getThemeStyles();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : (themeStyle === 'minimal' ? 'dark-content' : 'light-content')} 
        backgroundColor={themeColors.headerBackground}
      />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>{themeStyle === 'minimal' && !isDarkMode ? '←' : '返回'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>RM 換算計算器</Text>
        <View style={styles.placeholder}></View>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContent}>
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>輸入參數</Text>
            
            {/* 性別選擇 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>性別</Text>
              <View style={styles.genderSelection}>
                <TouchableOpacity 
                  style={[
                    styles.genderButton, 
                    gender === 'male' && styles.selectedGender
                  ]}
                  onPress={() => setGender('male')}
                >
                  <Text style={[
                    styles.genderText,
                    gender === 'male' && styles.selectedText
                  ]}>男</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.genderButton, 
                    gender === 'female' && styles.selectedGender
                  ]}
                  onPress={() => setGender('female')}
                >
                  <Text style={[
                    styles.genderText,
                    gender === 'female' && styles.selectedText
                  ]}>女</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* 年齡輸入 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>年齡</Text>
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                placeholder="請輸入年齡"
                keyboardType="numeric"
                placeholderTextColor={isDarkMode ? '#666' : '#bbb'}
              />
            </View>
            
            {/* 訓練動作選擇 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>訓練動作</Text>
              <TouchableOpacity 
                style={styles.dropdownButton}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.dropdownButtonText}>
                  {getExerciseLabel()}
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* 體重輸入（僅用於引體向上） */}
            {exercise === 'pull_up' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>體重 (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={bodyWeight}
                  onChangeText={setBodyWeight}
                  placeholder="請輸入您的體重"
                  keyboardType="numeric"
                  placeholderTextColor={isDarkMode ? '#666' : '#bbb'}
                />
              </View>
            )}
            
            {/* 重量輸入 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>重量 (kg)</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                placeholder={exercise === 'pull_up' ? "請輸入額外負重 (如有)" : "請輸入重量"}
                keyboardType="numeric"
                placeholderTextColor={isDarkMode ? '#666' : '#bbb'}
              />
            </View>
            
            {/* 次數輸入 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>次數</Text>
              <TextInput
                style={styles.input}
                value={reps}
                onChangeText={setReps}
                placeholder="請輸入完成次數"
                keyboardType="numeric"
                placeholderTextColor={isDarkMode ? '#666' : '#bbb'}
              />
            </View>
            
            {/* 計算按鈕 */}
            <TouchableOpacity 
              style={styles.calculateButton}
              onPress={calculateRM}
            >
              <Text style={styles.calculateButtonText}>計算換算結果</Text>
            </TouchableOpacity>
          </View>
          
          {/* RM結果顯示 */}
          {rmValues.length > 0 && (
            <View style={styles.resultsContainer}>
              <Text style={styles.resultsHeader}>RM 換算結果</Text>
              
              {/* 1RM 強調顯示 */}
              <View style={styles.oneRmBox}>
                <View style={styles.oneRmContent}>
                  <Text style={styles.oneRmLabel}>1RM (最大重量)</Text>
                  <Text style={styles.oneRmValue}>{rmValues[0].weight} kg</Text>
                </View>
              </View>
              
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>RM</Text>
                <Text style={styles.tableHeaderText}>重量 (kg)</Text>
                <Text style={styles.tableHeaderText}>百分比</Text>
              </View>
              <FlatList
                data={rmValues}
                keyExtractor={(item) => item.rm.toString()}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View style={[
                    styles.tableRow,
                    item.rm % 2 === 0 ? styles.evenRow : null
                  ]}>
                    <Text style={styles.tableCell}>{item.rm}RM</Text>
                    <Text style={styles.tableCell}>{item.weight}</Text>
                    <Text style={styles.tableCell}>
                      {Math.round((item.weight / rmValues[0].weight) * 100)}%
                    </Text>
                  </View>
                )}
              />
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* 使用統一的模態框組件 */}
      <ExerciseSelectionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        options={exerciseOptions}
        selectedValue={exercise}
        onSelect={setExercise}
        themeColors={themeColors}
      />
    </SafeAreaView>
  );
}

// 通用樣式混合器 - 用於確保各主題下相同的佈局結構
const createBaseStyles = (themeColors) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 20,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: themeColors.headerBackground,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.inputBorder,
    },
    backButton: {
      padding: 8,
    },
    backButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: themeColors.headerBackground === '#fff' ? themeColors.text : '#fff',
    },
    headerText: {
      fontSize: 22,
      fontWeight: 'bold',
      color: themeColors.headerBackground === '#fff' ? themeColors.text : '#fff',
      marginLeft: 16,
      flex: 1,
    },
    placeholder: {
      width: 40,
    },
    mainContent: {
      padding: 16,
    },
    formContainer: {
      backgroundColor: themeColors.cardBackground,
      borderRadius: 15,
      padding: 20,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: themeColors.text,
      marginBottom: 20,
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 8,
      color: themeColors.text,
    },
    input: {
      backgroundColor: themeColors.inputBackground,
      borderRadius: 8,
      padding: 14,
      fontSize: 16,
      borderWidth: 1,
      borderColor: themeColors.inputBorder,
      color: themeColors.text,
    },
    genderSelection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    genderButton: {
      flex: 1,
      padding: 14,
      borderRadius: 8,
      marginHorizontal: 5,
      alignItems: 'center',
      backgroundColor: themeColors.inputBackground,
      borderWidth: 1,
      borderColor: themeColors.inputBorder,
    },
    selectedGender: {
      backgroundColor: themeColors.accent,
      borderColor: themeColors.accent,
    },
    genderText: {
      fontSize: 16,
      fontWeight: '500',
      color: themeColors.text,
    },
    selectedText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    dropdownButton: {
      backgroundColor: themeColors.inputBackground,
      borderRadius: 8,
      padding: 14,
      borderWidth: 1,
      borderColor: themeColors.inputBorder,
    },
    dropdownButtonText: {
      fontSize: 16,
      color: themeColors.text,
    },
    calculateButton: {
      backgroundColor: themeColors.accent,
      borderRadius: 8,
      padding: 16,
      alignItems: 'center',
      marginTop: 10,
    },
    calculateButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
    resultsContainer: {
      backgroundColor: themeColors.cardBackground,
      borderRadius: 15,
      padding: 20,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    resultsHeader: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 16,
      textAlign: 'center',
      color: themeColors.text,
    },
    oneRmBox: {
      backgroundColor: themeColors.inputBackground,
      borderRadius: 8,
      padding: 16,
      marginBottom: 20,
      alignItems: 'center',
    },
    oneRmContent: {
      alignItems: 'center',
    },
    oneRmLabel: {
      fontSize: 16,
      fontWeight: 'bold',
      color: themeColors.text,
      marginBottom: 5,
    },
    oneRmValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: themeColors.accent,
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: themeColors.accent,
      paddingVertical: 12,
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
    },
    tableHeaderText: {
      flex: 1,
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    tableRow: {
      flexDirection: 'row',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.inputBorder,
    },
    evenRow: {
      backgroundColor: themeColors.inputBackground,
    },
    tableCell: {
      flex: 1,
      fontSize: 16,
      textAlign: 'center',
      color: themeColors.text,
    },
  });
};

// 各風格樣式
const sportStyles = createBaseStyles(getThemeColors('sport', false));
const sportDarkStyles = createBaseStyles(getThemeColors('sport', true));
const minimalStyles = createBaseStyles(getThemeColors('minimal', false));
const minimalDarkStyles = createBaseStyles(getThemeColors('minimal', true));
const professionalStyles = createBaseStyles(getThemeColors('professional', false));
const professionalDarkStyles = createBaseStyles(getThemeColors('professional', true));
const fitnessStyles = createBaseStyles(getThemeColors('fitness', false));
const fitnessDarkStyles = createBaseStyles(getThemeColors('fitness', true));
const modernStyles = createBaseStyles(getThemeColors('modern', false));
const modernDarkStyles = createBaseStyles(getThemeColors('modern', true));

// 獲取指定主題和模式的顏色
function getThemeColors(theme, isDark) {
  const themes = {
    // 運動風格
    sport: {
      light: {
        background: '#f2f2f2',
        cardBackground: '#fff',
        text: '#333',
        inputBackground: '#f5f5f5',
        inputBorder: '#ddd',
        accent: '#e94560',
        headerBackground: '#e94560',
      },
      dark: {
        background: '#1a1a2e',
        cardBackground: '#16213e',
        text: '#fff',
        inputBackground: '#0f3460',
        inputBorder: '#533483',
        accent: '#e94560',
        headerBackground: '#16213e',
      }
    },
    // 極簡風格
    minimal: {
      light: {
        background: '#f9f9f9',
        cardBackground: '#fff',
        text: '#333',
        inputBackground: '#f5f5f5',
        inputBorder: '#ddd',
        accent: '#6b9080',
        headerBackground: '#fff',
      },
      dark: {
        background: '#2c3e50',
        cardBackground: '#34495e',
        text: '#ecf0f1',
        inputBackground: '#2c3e50',
        inputBorder: '#597ea2',
        accent: '#6b9080',
        headerBackground: '#34495e',
      }
    },
    // 專業風格
    professional: {
      light: {
        background: '#f2f2f2',
        cardBackground: '#fff',
        text: '#333',
        inputBackground: '#f9f9f9',
        inputBorder: '#ddd',
        accent: '#1a2a6c',
        headerBackground: '#1a2a6c',
      },
      dark: {
        background: '#1c2331',
        cardBackground: '#273444',
        text: '#f1f1f1',
        inputBackground: '#1c2331',
        inputBorder: '#394b61',
        accent: '#4267b2',
        headerBackground: '#1c2331',
      }
    },
    // 健身風格
    fitness: {
      light: {
        background: '#f0f4f8',
        cardBackground: '#fff',
        text: '#333',
        inputBackground: '#f0f4f8',
        inputBorder: '#d0d0d0',
        accent: '#ff5722',
        headerBackground: '#ff5722',
      },
      dark: {
        background: '#2d3436',
        cardBackground: '#3c4245',
        text: '#f1f1f1',
        inputBackground: '#2d3436',
        inputBorder: '#5a6268',
        accent: '#ff5722',
        headerBackground: '#2d3436',
      }
    },
    // 現代風格
    modern: {
      light: {
        background: '#eef2f7',
        cardBackground: '#fff',
        text: '#334155',
        inputBackground: '#f1f5f9',
        inputBorder: '#cbd5e1',
        accent: '#3b82f6',
        headerBackground: '#3b82f6',
      },
      dark: {
        background: '#0f172a',
        cardBackground: '#1e293b',
        text: '#f8fafc',
        inputBackground: '#0f172a',
        inputBorder: '#334155',
        accent: '#3b82f6',
        headerBackground: '#1e293b',
      }
    }
  };
  
  return isDark ? themes[theme]?.dark || themes.sport.dark : themes[theme]?.light || themes.sport.light;
} 