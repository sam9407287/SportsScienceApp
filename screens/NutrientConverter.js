import React, { useState, useEffect, useContext } from 'react';
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
import { ThemeContext } from '../context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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

export default function NutrientConverter({ onBack }) {
  const { isDarkMode } = useContext(ThemeContext);
  
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
              <Text style={isDarkMode ? styles.labelDark : styles.label}>{t('protein', '蛋白质')} ({t('grams', '克')})</Text>
              <TextInput
                style={isDarkMode ? styles.inputDark : styles.input}
                keyboardType="numeric"
                value={protein}
                onChangeText={setProtein}
                placeholder={t('enter_protein_grams', '输入蛋白质克数')}
                placeholderTextColor={isDarkMode ? '#99a8cc' : '#aaa'}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={isDarkMode ? styles.labelDark : styles.label}>{t('carbs', '碳水化合物')} ({t('grams', '克')})</Text>
              <TextInput
                style={isDarkMode ? styles.inputDark : styles.input}
                keyboardType="numeric"
                value={carbs}
                onChangeText={setCarbs}
                placeholder={t('enter_carbs_grams', '输入碳水克数')}
                placeholderTextColor={isDarkMode ? '#99a8cc' : '#aaa'}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={isDarkMode ? styles.labelDark : styles.label}>{t('fat', '脂肪')} ({t('grams', '克')})</Text>
              <TextInput
                style={isDarkMode ? styles.inputDark : styles.input}
                keyboardType="numeric"
                value={fat}
                onChangeText={setFat}
                placeholder={t('enter_fat_grams', '输入脂肪克数')}
                placeholderTextColor={isDarkMode ? '#99a8cc' : '#aaa'}
              />
            </View>
            
            <TouchableOpacity
              style={isDarkMode ? styles.buttonDark : styles.button}
              onPress={calculateCaloriesFromMacros}
            >
              <Text style={styles.buttonText}>{t('calculate_calories', '计算卡路里')}</Text>
            </TouchableOpacity>
            
            <View style={isDarkMode ? styles.resultCardDark : styles.resultCard}>
              <Text style={isDarkMode ? styles.resultLabelDark : styles.resultLabel}>{t('total_calories', '总卡路里')}</Text>
              <Text style={isDarkMode ? styles.resultValueDark : styles.resultValue}>{calories ? `${calories} ${t('kcal', '千卡')}` : '-'}</Text>
            </View>
          </View>
        );
        
      case CONVERSION_TYPE_KEYS.CALORIES_TO_MACROS:
        return (
          <View style={styles.conversionContainer}>
            <View style={styles.inputGroup}>
              <Text style={isDarkMode ? styles.labelDark : styles.label}>{t('calories', '卡路里')}</Text>
              <TextInput
                style={isDarkMode ? styles.inputDark : styles.input}
                keyboardType="numeric"
                value={calories}
                onChangeText={setCalories}
                placeholder={t('enter_total_calories', '输入总卡路里')}
                placeholderTextColor={isDarkMode ? '#99a8cc' : '#aaa'}
              />
            </View>
            
            <TouchableOpacity
              style={isDarkMode ? styles.buttonDark : styles.button}
              onPress={calculateMacrosFromCalories}
            >
              <Text style={styles.buttonText}>{t('calculate_macros', '计算宏量营养素')}</Text>
            </TouchableOpacity>
            
            <View style={isDarkMode ? styles.resultCardDark : styles.resultCard}>
              <Text style={isDarkMode ? styles.resultLabelDark : styles.resultLabel}>{t('protein', '蛋白质')} (30%)</Text>
              <Text style={isDarkMode ? styles.resultValueDark : styles.resultValue}>{protein ? `${protein}${t('grams', '克')}` : '-'}</Text>
            </View>
            
            <View style={isDarkMode ? styles.resultCardDark : styles.resultCard}>
              <Text style={isDarkMode ? styles.resultLabelDark : styles.resultLabel}>{t('carbs', '碳水化合物')} (50%)</Text>
              <Text style={isDarkMode ? styles.resultValueDark : styles.resultValue}>{carbs ? `${carbs}${t('grams', '克')}` : '-'}</Text>
            </View>
            
            <View style={isDarkMode ? styles.resultCardDark : styles.resultCard}>
              <Text style={isDarkMode ? styles.resultLabelDark : styles.resultLabel}>{t('fat', '脂肪')} (20%)</Text>
              <Text style={isDarkMode ? styles.resultValueDark : styles.resultValue}>{fat ? `${fat}${t('grams', '克')}` : '-'}</Text>
            </View>
          </View>
        );
        
      case CONVERSION_TYPE_KEYS.FOOD_TO_NUTRIENTS:
        return (
          <View style={styles.conversionContainer}>
            <TouchableOpacity
              style={isDarkMode ? styles.foodSelectorDark : styles.foodSelector}
              onPress={() => setFoodModalVisible(true)}
            >
              <Text style={isDarkMode ? styles.textDark : styles.text}>
                {selectedFood ? getLocalizedFoodName(selectedFood.name) : t('select_food', '选择食物')}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.inputGroup}>
              <Text style={isDarkMode ? styles.labelDark : styles.label}>{t('food_weight', '重量')} ({t('grams', '克')})</Text>
              <TextInput
                style={isDarkMode ? styles.inputDark : styles.input}
                keyboardType="numeric"
                value={foodWeight}
                onChangeText={setFoodWeight}
                placeholder={t('enter_food_weight', '输入食物重量')}
                placeholderTextColor={isDarkMode ? '#99a8cc' : '#aaa'}
              />
            </View>
            
            {selectedFood && (
              <>
                <View style={isDarkMode ? styles.resultCardDark : styles.resultCard}>
                  <Text style={isDarkMode ? styles.resultLabelDark : styles.resultLabel}>{t('calories', '卡路里')}</Text>
                  <Text style={isDarkMode ? styles.resultValueDark : styles.resultValue}>{`${foodNutrients.calories} ${t('kcal', '千卡')}`}</Text>
                </View>
                
                <View style={isDarkMode ? styles.resultCardDark : styles.resultCard}>
                  <Text style={isDarkMode ? styles.resultLabelDark : styles.resultLabel}>{t('protein', '蛋白质')}</Text>
                  <Text style={isDarkMode ? styles.resultValueDark : styles.resultValue}>{`${foodNutrients.protein}${t('grams', '克')}`}</Text>
                </View>
                
                <View style={isDarkMode ? styles.resultCardDark : styles.resultCard}>
                  <Text style={isDarkMode ? styles.resultLabelDark : styles.resultLabel}>{t('carbs', '碳水化合物')}</Text>
                  <Text style={isDarkMode ? styles.resultValueDark : styles.resultValue}>{`${foodNutrients.carbs}${t('grams', '克')}`}</Text>
                </View>
                
                <View style={isDarkMode ? styles.resultCardDark : styles.resultCard}>
                  <Text style={isDarkMode ? styles.resultLabelDark : styles.resultLabel}>{t('fat', '脂肪')}</Text>
                  <Text style={isDarkMode ? styles.resultValueDark : styles.resultValue}>{`${foodNutrients.fat}${t('grams', '克')}`}</Text>
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
        <View style={isDarkMode ? styles.modalViewDark : styles.modalView}>
          <View style={styles.modalHeader}>
            <Text style={isDarkMode ? styles.modalTitleDark : styles.modalTitle}>
              {t('select_food', '选择食物')}
            </Text>
            <TouchableOpacity onPress={() => setFoodModalVisible(false)}>
              <MaterialCommunityIcons 
                name="close" 
                size={24} 
                color={isDarkMode ? "#aaa" : "#666"} 
              />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.foodList}>
            {commonFoods.map((food, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  isDarkMode ? styles.foodItemDark : styles.foodItem,
                  selectedFood && selectedFood.name === food.name && (isDarkMode ? styles.selectedFoodItemDark : styles.selectedFoodItem)
                ]}
                onPress={() => {
                  setSelectedFood(food);
                  setFoodModalVisible(false);
                }}
              >
                <View style={styles.foodItemContent}>
                  <MaterialCommunityIcons 
                    name="food-apple" 
                    size={20} 
                    color={
                      selectedFood && selectedFood.name === food.name 
                        ? (isDarkMode ? '#9d6dde' : '#ff6b6b') 
                        : (isDarkMode ? '#aaa' : '#666')
                    } 
                    style={styles.foodIcon}
                  />
                  <View style={styles.foodTextContainer}>
                    <Text style={[
                      isDarkMode ? styles.foodItemTextDark : styles.foodItemText,
                      selectedFood && selectedFood.name === food.name && 
                      (isDarkMode ? styles.selectedFoodTextDark : styles.selectedFoodText)
                    ]}>
                      {getLocalizedFoodName(food.name)}
                    </Text>
                    <Text style={isDarkMode ? styles.foodItemDetailsDark : styles.foodItemDetails}>
                      {t('protein', '蛋白质')}: {food.protein}g, {t('carbs', '碳水')}: {food.carbs}g, {t('fat', '脂肪')}: {food.fat}g
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
  
  // 获取转换类型选项
  const conversionTypeOptions = getConversionTypeOptions();
  
  return (
    <SafeAreaView style={[styles.safeArea, isDarkMode ? styles.containerDark : styles.container]}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={isDarkMode ? '#121212' : '#ffffff'} 
      />
      
      <View style={[styles.header, isDarkMode ? styles.headerDark : styles.headerLight]}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={isDarkMode ? styles.backButtonTextDark : styles.backButtonText}>
            {t('back', '返回')}
          </Text>
        </TouchableOpacity>
        <Text style={isDarkMode ? styles.headerTitleDark : styles.headerTitle}>
          {t('nutrient_converter', '营养素換算')}
        </Text>
        <View style={styles.placeholder}></View>
      </View>
      
      <ScrollView>
        <View style={styles.contentContainer}>
          {/* 转换类型选择器 */}
          <View style={styles.typeSelector}>
            {conversionTypeOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  isDarkMode ? styles.typeButtonDark : styles.typeButton,
                  {
                    backgroundColor: conversionType === option.key 
                      ? (isDarkMode ? '#4361ee' : '#007AFF') 
                      : 'transparent'
                  },
                  conversionType === option.key && styles.selectedTypeButton
                ]}
                onPress={() => setConversionType(option.key)}
              >
                <View style={styles.typeButtonContent}>
                  {option.key === CONVERSION_TYPE_KEYS.MACROS_TO_CALORIES && (
                    <MaterialCommunityIcons 
                      name="calculator-variant" 
                      size={18} 
                      color={conversionType === option.key ? '#fff' : (isDarkMode ? '#fff' : '#333')} 
                      style={styles.typeButtonIcon} 
                    />
                  )}
                  {option.key === CONVERSION_TYPE_KEYS.CALORIES_TO_MACROS && (
                    <MaterialCommunityIcons 
                      name="fire" 
                      size={18} 
                      color={conversionType === option.key ? '#fff' : (isDarkMode ? '#fff' : '#333')} 
                      style={styles.typeButtonIcon} 
                    />
                  )}
                  {option.key === CONVERSION_TYPE_KEYS.FOOD_TO_NUTRIENTS && (
                    <MaterialCommunityIcons 
                      name="food-apple" 
                      size={18} 
                      color={conversionType === option.key ? '#fff' : (isDarkMode ? '#fff' : '#333')} 
                      style={styles.typeButtonIcon} 
                    />
                  )}
                  <Text style={[
                    styles.typeButtonText,
                    { color: conversionType === option.key ? '#fff' : (isDarkMode ? '#fff' : '#333') },
                    conversionType === option.key && styles.selectedTypeText
                  ]}>
                    {option.label}
                  </Text>
                </View>
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
  container: {
    backgroundColor: '#f5f5f5',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 15,
  },
  headerLight: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerDark: {
    backgroundColor: '#1e1e1e',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  backButtonTextDark: {
    fontSize: 16,
    color: '#4361ee',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  headerTitleDark: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 50,
  },
  contentContainer: {
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
  typeButtonDark: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#444',
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
    color: '#333',
  },
  labelDark: {
    fontSize: 16,
    marginBottom: 5,
    color: '#fff',
  },
  input: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    color: '#333',
  },
  inputDark: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#2a2a2a',
    borderColor: '#444',
    color: '#fff',
  },
  text: {
    color: '#333',
  },
  textDark: {
    color: '#fff',
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: '#007AFF',
  },
  buttonDark: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: '#4361ee',
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
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  resultCardDark: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#444',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  resultLabel: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
  resultLabelDark: {
    fontSize: 14,
    marginBottom: 5,
    color: '#aaa',
  },
  resultValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  resultValueDark: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  foodSelector: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    justifyContent: 'center',
    marginBottom: 15,
  },
  foodSelectorDark: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    backgroundColor: '#2a2a2a',
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
    borderRadius: 15,
    padding: 20,
    backgroundColor: '#fff',
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalViewDark: {
    borderRadius: 15,
    padding: 20,
    backgroundColor: '#1e1e1e',
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  modalTitleDark: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#fff',
  },
  foodList: {
    width: '100%',
  },
  foodItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    marginBottom: 4,
  },
  foodItemDark: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    marginBottom: 4,
  },
  selectedFoodItem: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#ff6b6b',
  },
  selectedFoodItemDark: {
    backgroundColor: 'rgba(157, 109, 222, 0.15)',
    borderLeftWidth: 3,
    borderLeftColor: '#9d6dde',
  },
  foodItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  foodItemTextDark: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  foodItemDetails: {
    fontSize: 12,
    marginTop: 3,
    opacity: 0.7,
    color: '#666',
  },
  foodItemDetailsDark: {
    fontSize: 12,
    marginTop: 3,
    opacity: 0.7,
    color: '#aaa',
  },
  selectedFoodText: {
    color: '#ff6b6b',
    fontWeight: '600',
  },
  selectedFoodTextDark: {
    color: '#9d6dde',
    fontWeight: '600',
  },
  typeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeButtonIcon: {
    marginRight: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    paddingBottom: 10,
  },
  foodItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  foodIcon: {
    marginRight: 10,
  },
  foodTextContainer: {
    flex: 1,
  },
}); 