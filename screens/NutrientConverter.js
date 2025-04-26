import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView,
  TextInput,
  Modal,
  Pressable,
  Platform,
  StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { t, getCurrentLanguage } from '../i18n';

// 定義轉換類型鍵
const CONVERSION_TYPE_KEYS = {
  MACROS_TO_CALORIES: 'macros_to_calories',
  CALORIES_TO_MACROS: 'calories_to_macros',
  FOOD_TO_NUTRIENTS: 'food_to_nutrients'
};

// 食物翻譯資料
const foodTranslations = {
  'en': {
    '鸡胸肉(生)': 'Chicken Breast (Raw)',
    '鸡胸肉(熟)': 'Chicken Breast (Cooked)',
    '鸡蛋': 'Egg',
    '牛肉(瘦)': 'Beef (Lean)',
    '三文鱼': 'Salmon',
    '金枪鱼': 'Tuna',
    '豆腐': 'Tofu',
    '米饭(熟)': 'Rice (Cooked)',
    '面包(白)': 'Bread (White)',
    '燕麦': 'Oats',
    '花生酱': 'Peanut Butter',
    '牛奶(全脂)': 'Milk (Whole)',
    '希腊酸奶': 'Greek Yogurt',
    '橄榄油': 'Olive Oil',
    '杏仁': 'Almonds',
    '花椰菜': 'Broccoli',
    '菠菜': 'Spinach',
    '香蕉': 'Banana',
    '苹果': 'Apple',
    '鳄梨': 'Avocado'
  },
  'zh': {
    '鸡胸肉(生)': '鸡胸肉(生)',
    '鸡胸肉(熟)': '鸡胸肉(熟)',
    '鸡蛋': '鸡蛋',
    '牛肉(瘦)': '牛肉(瘦)',
    '三文鱼': '三文鱼',
    '金枪鱼': '金枪鱼',
    '豆腐': '豆腐',
    '米饭(熟)': '米饭(熟)',
    '面包(白)': '面包(白)',
    '燕麦': '燕麦',
    '花生酱': '花生酱',
    '牛奶(全脂)': '牛奶(全脂)',
    '希腊酸奶': '希腊酸奶',
    '橄榄油': '橄榄油',
    '杏仁': '杏仁',
    '花椰菜': '花椰菜',
    '菠菜': '菠菜',
    '香蕉': '香蕉',
    '苹果': '苹果',
    '鳄梨': '鳄梨'
  }
};

// 宏量素热量值（每克）
const PROTEIN_CAL_PER_GRAM = 4;
const CARB_CAL_PER_GRAM = 4;
const FAT_CAL_PER_GRAM = 9;

// 常见食物及其营养成分(100g中的数据)
const commonFoods = [
  { name: '鸡胸肉(生)', protein: 23.1, carbs: 0, fat: 1.2 },
  { name: '鸡胸肉(熟)', protein: 31, carbs: 0, fat: 3.6 },
  { name: '鸡蛋', protein: 12.6, carbs: 0.7, fat: 9.5 },
  { name: '牛肉(瘦)', protein: 26.2, carbs: 0, fat: 11 },
  { name: '三文鱼', protein: 20, carbs: 0, fat: 13 },
  { name: '金枪鱼', protein: 23.6, carbs: 0, fat: 0.9 },
  { name: '豆腐', protein: 8, carbs: 1.9, fat: 4 },
  { name: '米饭(熟)', protein: 2.7, carbs: 28, fat: 0.3 },
  { name: '面包(白)', protein: 7.9, carbs: 49, fat: 3.2 },
  { name: '燕麦', protein: 16.9, carbs: 66.3, fat: 6.9 },
  { name: '花生酱', protein: 25, carbs: 20, fat: 50 },
  { name: '牛奶(全脂)', protein: 3.2, carbs: 4.8, fat: 3.9 },
  { name: '希腊酸奶', protein: 10, carbs: 4, fat: 0.4 },
  { name: '橄榄油', protein: 0, carbs: 0, fat: 100 },
  { name: '杏仁', protein: 21, carbs: 22, fat: 49 },
  { name: '花椰菜', protein: 2.8, carbs: 5, fat: 0.4 },
  { name: '菠菜', protein: 2.9, carbs: 3.6, fat: 0.4 },
  { name: '香蕉', protein: 1.1, carbs: 22.8, fat: 0.3 },
  { name: '苹果', protein: 0.3, carbs: 13.8, fat: 0.2 },
  { name: '鳄梨', protein: 2, carbs: 8.5, fat: 14.7 }
];

export default function NutrientConverter({ onBack, themeStyle }) {
  const [conversionType, setConversionType] = useState(CONVERSION_TYPE_KEYS.MACROS_TO_CALORIES);
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [proteinPercentage, setProteinPercentage] = useState('30');
  const [carbsPercentage, setCarbsPercentage] = useState('40');
  const [fatPercentage, setFatPercentage] = useState('30');
  const [foodModalVisible, setFoodModalVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [foodWeight, setFoodWeight] = useState('100');
  const [calculatedData, setCalculatedData] = useState(null);
  const [foodNutrients, setFoodNutrients] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
  const [currentLanguage, setCurrentLanguage] = useState(getCurrentLanguage());
  
  // 監聽語言變化
  useEffect(() => {
    const checkLanguage = () => {
      const newLang = getCurrentLanguage();
      if (newLang !== currentLanguage) {
        setCurrentLanguage(newLang);
      }
    };
    
    // 每秒檢查一次語言設置
    const intervalId = setInterval(checkLanguage, 1000);
    
    return () => clearInterval(intervalId);
  }, [currentLanguage]);
  
  // 翻譯食物名稱
  const getLocalizedFoodName = (chineseName) => {
    const currentLang = getCurrentLanguage();
    if (currentLang === 'zh' || !foodTranslations[currentLang]) {
      return chineseName;
    }
    return foodTranslations[currentLang][chineseName] || chineseName;
  };
  
  useEffect(() => {
    // 百分比总和应为100%
    const totalPercentage = parseInt(proteinPercentage || 0) + 
                            parseInt(carbsPercentage || 0) + 
                            parseInt(fatPercentage || 0);
                            
    if (conversionType === CONVERSION_TYPE_KEYS.MACROS_TO_CALORIES && calories && totalPercentage === 100) {
      calculateMacrosFromCalories();
    } else if (conversionType === CONVERSION_TYPE_KEYS.CALORIES_TO_MACROS && (protein || carbs || fat)) {
      calculateCaloriesFromMacros();
    }
  }, [calories, proteinPercentage, carbsPercentage, fatPercentage, protein, carbs, fat, conversionType]);
  
  // 从热量计算宏量营养素
  const calculateMacrosFromCalories = () => {
    const totalCalories = parseFloat(calories);
    if (isNaN(totalCalories) || totalCalories <= 0) return;
    
    // 使用常见配比: 蛋白质30%, 碳水50%, 脂肪20%
    const newProtein = ((totalCalories * 0.3) / PROTEIN_CAL_PER_GRAM).toFixed(1);
    const newCarbs = ((totalCalories * 0.5) / CARB_CAL_PER_GRAM).toFixed(1);
    const newFat = ((totalCalories * 0.2) / FAT_CAL_PER_GRAM).toFixed(1);
    
    setProtein(newProtein);
    setCarbs(newCarbs);
    setFat(newFat);
  };
  
  // 从宏量营养素计算热量
  const calculateCaloriesFromMacros = () => {
    const proteinVal = parseFloat(protein) || 0;
    const carbsVal = parseFloat(carbs) || 0;
    const fatVal = parseFloat(fat) || 0;
    
    const totalCalories = (proteinVal * PROTEIN_CAL_PER_GRAM) + 
                          (carbsVal * CARB_CAL_PER_GRAM) + 
                          (fatVal * FAT_CAL_PER_GRAM);
    
    setCalories(totalCalories.toFixed(1));
  };
  
  // 计算食物的营养素含量
  const calculateFoodNutrients = () => {
    if (!selectedFood) return;
    
    const weight = parseFloat(foodWeight) || 100;
    const ratio = weight / 100;
    
    const proteinVal = selectedFood.protein * ratio;
    const carbsVal = selectedFood.carbs * ratio;
    const fatVal = selectedFood.fat * ratio;
    const caloriesVal = (proteinVal * PROTEIN_CAL_PER_GRAM) + 
                        (carbsVal * CARB_CAL_PER_GRAM) + 
                        (fatVal * FAT_CAL_PER_GRAM);
    
    setFoodNutrients({
      calories: caloriesVal.toFixed(1),
      protein: proteinVal.toFixed(1),
      carbs: carbsVal.toFixed(1),
      fat: fatVal.toFixed(1)
    });
  };
  
  // 当食物或重量变化时重新计算
  useEffect(() => {
    if (selectedFood) {
      calculateFoodNutrients();
    }
  }, [selectedFood, foodWeight]);
  
  // 获取当前主题的样式
  const getBackgroundColor = () => {
    switch(themeStyle) {
      case 'sport':
        return '#1a1a2e';
      case 'minimal':
        return '#f9f9f9';
      case 'professional':
        return '#f2f2f2';
      default:
        return '#f5f5f5';
    }
  };
  
  // 获取头部样式
  const getHeaderStyle = () => {
    switch(themeStyle) {
      case 'sport':
        return '#16213e';
      case 'minimal':
        return '#fff';
      case 'professional':
        return '#1a2a6c';
      default:
        return '#007AFF';
    }
  };
  
  // 获取头部文本颜色
  const getThemeHeaderTextColor = () => {
    switch(themeStyle) {
      case 'sport':
        return '#fff';
      case 'minimal':
        return '#333';
      case 'professional':
        return '#fff';
      default:
        return '#fff';
    }
  };
  
  // 获取主题主色调
  const getThemePrimaryColor = () => {
    switch(themeStyle) {
      case 'sport':
        return '#4361ee';
      case 'minimal':
        return '#6b9080';
      case 'professional':
        return '#1a2a6c';
      default:
        return '#007AFF';
    }
  };
  
  // 获取文本颜色
  const getTextColor = () => {
    switch(themeStyle) {
      case 'sport':
        return '#fff';
      default:
        return '#333';
    }
  };
  
  const getCardStyle = () => {
    switch(themeStyle) {
      case 'sport':
        return { backgroundColor: '#16213e', borderColor: '#0f3460' };
      case 'minimal':
        return { backgroundColor: '#fff', borderColor: '#f0f0f0' };
      case 'professional':
        return { backgroundColor: '#fff', borderColor: '#e0e0e0' };
      default:
        return { backgroundColor: '#fff' };
    }
  };
  
  const getTextStyle = () => {
    switch(themeStyle) {
      case 'sport':
        return { color: '#fff' };
      default:
        return { color: '#333' };
    }
  };
  
  const getButtonStyle = () => {
    switch(themeStyle) {
      case 'sport':
        return { backgroundColor: '#4361ee' };
      case 'minimal':
        return { backgroundColor: '#000' };
      case 'professional':
        return { backgroundColor: '#2c3e50' };
      default:
        return { backgroundColor: '#007AFF' };
    }
  };
  
  const getInputStyle = () => {
    switch(themeStyle) {
      case 'sport':
        return { 
          backgroundColor: '#0f3460', 
          borderColor: '#4361ee',
          color: '#fff'
        };
      case 'minimal':
        return { 
          backgroundColor: '#f5f5f5', 
          borderColor: '#e0e0e0',
          color: '#333'
        };
      case 'professional':
        return { 
          backgroundColor: '#fff', 
          borderColor: '#ccc',
          color: '#333'
        };
      default:
        return { 
          backgroundColor: '#fff', 
          borderColor: '#ccc',
          color: '#333'
        };
    }
  };
  
  // 獲取轉換類型選項
  const getConversionTypeOptions = () => {
    return [
      { 
        key: CONVERSION_TYPE_KEYS.MACROS_TO_CALORIES, 
        label: t(CONVERSION_TYPE_KEYS.MACROS_TO_CALORIES, '宏量營養素轉卡路里')
      },
      { 
        key: CONVERSION_TYPE_KEYS.CALORIES_TO_MACROS, 
        label: t(CONVERSION_TYPE_KEYS.CALORIES_TO_MACROS, '卡路里轉宏量營養素')
      },
      { 
        key: CONVERSION_TYPE_KEYS.FOOD_TO_NUTRIENTS, 
        label: t(CONVERSION_TYPE_KEYS.FOOD_TO_NUTRIENTS, '食物轉營養素')
      }
    ];
  };
  
  // 渲染不同转换类型的内容
  const renderConversionContent = () => {
    switch(conversionType) {
      case CONVERSION_TYPE_KEYS.MACROS_TO_CALORIES:
        return (
          <View style={styles.conversionContainer}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, getTextStyle()]}>{t('protein', '蛋白质')} ({t('grams', '克')})</Text>
              <TextInput
                style={[styles.input, getInputStyle()]}
                keyboardType="numeric"
                value={protein}
                onChangeText={setProtein}
                placeholder={t('enter_protein_grams', '输入蛋白质克数')}
                placeholderTextColor={themeStyle === 'sport' ? '#99a8cc' : '#aaa'}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, getTextStyle()]}>{t('carbs', '碳水化合物')} ({t('grams', '克')})</Text>
              <TextInput
                style={[styles.input, getInputStyle()]}
                keyboardType="numeric"
                value={carbs}
                onChangeText={setCarbs}
                placeholder={t('enter_carbs_grams', '输入碳水克数')}
                placeholderTextColor={themeStyle === 'sport' ? '#99a8cc' : '#aaa'}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, getTextStyle()]}>{t('fat', '脂肪')} ({t('grams', '克')})</Text>
              <TextInput
                style={[styles.input, getInputStyle()]}
                keyboardType="numeric"
                value={fat}
                onChangeText={setFat}
                placeholder={t('enter_fat_grams', '输入脂肪克数')}
                placeholderTextColor={themeStyle === 'sport' ? '#99a8cc' : '#aaa'}
              />
            </View>
            
            <TouchableOpacity
              style={[styles.button, getButtonStyle()]}
              onPress={calculateCaloriesFromMacros}
            >
              <Text style={styles.buttonText}>{t('calculate_calories', '计算卡路里')}</Text>
            </TouchableOpacity>
            
            <View style={[styles.resultCard, getCardStyle()]}>
              <Text style={[styles.resultLabel, getTextStyle()]}>{t('total_calories', '总卡路里')}</Text>
              <Text style={[styles.resultValue, getTextStyle()]}>{calories ? `${calories} ${t('kcal', '千卡')}` : '-'}</Text>
            </View>
          </View>
        );
        
      case CONVERSION_TYPE_KEYS.CALORIES_TO_MACROS:
        return (
          <View style={styles.conversionContainer}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, getTextStyle()]}>{t('calories', '卡路里')}</Text>
              <TextInput
                style={[styles.input, getInputStyle()]}
                keyboardType="numeric"
                value={calories}
                onChangeText={setCalories}
                placeholder={t('enter_total_calories', '输入总卡路里')}
                placeholderTextColor={themeStyle === 'sport' ? '#99a8cc' : '#aaa'}
              />
            </View>
            
            <TouchableOpacity
              style={[styles.button, getButtonStyle()]}
              onPress={calculateMacrosFromCalories}
            >
              <Text style={styles.buttonText}>{t('calculate_macros', '计算宏量营养素')}</Text>
            </TouchableOpacity>
            
            <View style={[styles.resultCard, getCardStyle()]}>
              <Text style={[styles.resultLabel, getTextStyle()]}>{t('protein', '蛋白质')} (30%)</Text>
              <Text style={[styles.resultValue, getTextStyle()]}>{protein ? `${protein}${t('grams', '克')}` : '-'}</Text>
            </View>
            
            <View style={[styles.resultCard, getCardStyle()]}>
              <Text style={[styles.resultLabel, getTextStyle()]}>{t('carbs', '碳水化合物')} (50%)</Text>
              <Text style={[styles.resultValue, getTextStyle()]}>{carbs ? `${carbs}${t('grams', '克')}` : '-'}</Text>
            </View>
            
            <View style={[styles.resultCard, getCardStyle()]}>
              <Text style={[styles.resultLabel, getTextStyle()]}>{t('fat', '脂肪')} (20%)</Text>
              <Text style={[styles.resultValue, getTextStyle()]}>{fat ? `${fat}${t('grams', '克')}` : '-'}</Text>
            </View>
          </View>
        );
        
      case CONVERSION_TYPE_KEYS.FOOD_TO_NUTRIENTS:
        return (
          <View style={styles.conversionContainer}>
            <TouchableOpacity
              style={[styles.foodSelector, getInputStyle()]}
              onPress={() => setFoodModalVisible(true)}
            >
              <Text style={[getTextStyle()]}>
                {selectedFood ? getLocalizedFoodName(selectedFood.name) : t('select_food', '选择食物')}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, getTextStyle()]}>{t('food_weight', '重量')} ({t('grams', '克')})</Text>
              <TextInput
                style={[styles.input, getInputStyle()]}
                keyboardType="numeric"
                value={foodWeight}
                onChangeText={setFoodWeight}
                placeholder={t('enter_food_weight', '输入食物重量')}
                placeholderTextColor={themeStyle === 'sport' ? '#99a8cc' : '#aaa'}
              />
            </View>
            
            {selectedFood && (
              <>
                <View style={[styles.resultCard, getCardStyle()]}>
                  <Text style={[styles.resultLabel, getTextStyle()]}>{t('calories', '卡路里')}</Text>
                  <Text style={[styles.resultValue, getTextStyle()]}>{`${foodNutrients.calories} ${t('kcal', '千卡')}`}</Text>
                </View>
                
                <View style={[styles.resultCard, getCardStyle()]}>
                  <Text style={[styles.resultLabel, getTextStyle()]}>{t('protein', '蛋白质')}</Text>
                  <Text style={[styles.resultValue, getTextStyle()]}>{`${foodNutrients.protein}${t('grams', '克')}`}</Text>
                </View>
                
                <View style={[styles.resultCard, getCardStyle()]}>
                  <Text style={[styles.resultLabel, getTextStyle()]}>{t('carbs', '碳水化合物')}</Text>
                  <Text style={[styles.resultValue, getTextStyle()]}>{`${foodNutrients.carbs}${t('grams', '克')}`}</Text>
                </View>
                
                <View style={[styles.resultCard, getCardStyle()]}>
                  <Text style={[styles.resultLabel, getTextStyle()]}>{t('fat', '脂肪')}</Text>
                  <Text style={[styles.resultValue, getTextStyle()]}>{`${foodNutrients.fat}${t('grams', '克')}`}</Text>
                </View>
              </>
            )}
            
            <FoodSelectionModal />
          </View>
        );
      
      default:
        return null;
    }
  };
  
  // 食物选择模态框
  const FoodSelectionModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={foodModalVisible}
      onRequestClose={() => setFoodModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalView, getCardStyle()]}>
          <Text style={[styles.modalTitle, getTextStyle()]}>{t('select_food', '选择食物')}</Text>
          <ScrollView style={styles.foodList}>
            {commonFoods.map((food, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.foodItem,
                  selectedFood && selectedFood.name === food.name && styles.selectedFoodItem
                ]}
                onPress={() => {
                  setSelectedFood(food);
                  setFoodModalVisible(false);
                }}
              >
                <Text style={[
                  styles.foodItemText,
                  getTextStyle(),
                  selectedFood && selectedFood.name === food.name && styles.selectedFoodText
                ]}>
                  {getLocalizedFoodName(food.name)}
                </Text>
                <Text style={[styles.foodItemDetails, getTextStyle()]}>
                  {t('protein', '蛋白质')}: {food.protein}g, {t('carbs', '碳水')}: {food.carbs}g, {t('fat', '脂肪')}: {food.fat}g
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={[styles.button, getButtonStyle(), { marginTop: 15 }]}
            onPress={() => setFoodModalVisible(false)}
          >
            <Text style={styles.buttonText}>{t('cancel', '取消')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
  
  // 获取转换类型选项
  const conversionTypeOptions = getConversionTypeOptions();
  
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: getBackgroundColor() }]}>
      <StatusBar 
        barStyle={themeStyle === 'sport' ? 'light-content' : 'dark-content'} 
        backgroundColor={getHeaderStyle()} 
      />
      
      <View style={[styles.header, { backgroundColor: getHeaderStyle() }]}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={[styles.backButtonText, { color: getThemeHeaderTextColor() }]}>
            {t('back', '返回')}
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: getThemeHeaderTextColor() }]}>
          {t('nutrient_converter', '营养素换算')}
        </Text>
        <View style={styles.placeholder}></View>
      </View>
      
      <ScrollView>
        <View style={styles.container}>
          {/* 转换类型选择器 */}
          <View style={styles.typeSelector}>
            {conversionTypeOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: conversionType === option.key 
                      ? getThemePrimaryColor() 
                      : 'transparent'
                  },
                  conversionType === option.key ? styles.selectedTypeButton : null
                ]}
                onPress={() => setConversionType(option.key)}
              >
                <Text style={[
                  styles.typeButtonText,
                  { color: conversionType === option.key ? '#fff' : getTextColor() },
                  conversionType === option.key ? styles.selectedTypeText : null
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* 渲染不同类型的转换内容 */}
          {renderConversionContent()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 15,
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 50,
  },
  container: {
    padding: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  typeButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedTypeButton: {
    borderColor: 'transparent',
  },
  typeButtonText: {
    fontSize: 14,
    textAlign: 'center',
  },
  selectedTypeText: {
    color: '#fff',
    fontWeight: '500',
  },
  conversionContainer: {
    marginTop: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  resultCard: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  resultLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  resultValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  foodSelector: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 15,
    justifyContent: 'center',
    marginBottom: 15,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  foodList: {
    width: '100%',
  },
  foodItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  selectedFoodItem: {
    backgroundColor: 'rgba(67, 97, 238, 0.1)',
  },
  foodItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  foodItemDetails: {
    fontSize: 12,
    marginTop: 3,
    opacity: 0.7,
  },
  selectedFoodText: {
    color: '#4361ee',
  },
}); 