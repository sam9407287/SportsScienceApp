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

// 转换类型常量
const CONVERSION_TYPES = {
  MACROS_TO_CALORIES: '宏量营养素转卡路里',
  CALORIES_TO_MACROS: '卡路里转宏量营养素',
  FOOD_TO_NUTRIENTS: '食物转营养素'
};

// 营养素换算类型
const conversionTypes = [
  { id: 'calToMacro', name: '热量转换宏量素' },
  { id: 'macroToCal', name: '宏量素转换热量' },
  { id: 'weightConversion', name: '食物重量换算' },
  { id: 'nutrientPercentage', name: '营养素百分比计算' }
];

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
  const [conversionType, setConversionType] = useState(CONVERSION_TYPES.MACROS_TO_CALORIES);
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
  
  useEffect(() => {
    // 百分比总和应为100%
    const totalPercentage = parseInt(proteinPercentage || 0) + 
                            parseInt(carbsPercentage || 0) + 
                            parseInt(fatPercentage || 0);
                            
    if (conversionType === CONVERSION_TYPES.MACROS_TO_CALORIES && calories && totalPercentage === 100) {
      calculateMacrosFromCalories();
    } else if (conversionType === CONVERSION_TYPES.CALORIES_TO_MACROS && (protein || carbs || fat)) {
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
  
  // 食物选择模态框
  const FoodSelectionModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={foodModalVisible}
        onRequestClose={() => setFoodModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setFoodModalVisible(false)}
        >
          <View 
            style={[
              styles.modalView, 
              getCardStyle(),
              { width: '90%', alignSelf: 'center' }
            ]}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <Text style={[styles.modalTitle, getTextStyle()]}>选择食物</Text>
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
                  <Text 
                    style={[
                      styles.foodItemText, 
                      getTextStyle(),
                      selectedFood && selectedFood.name === food.name && styles.selectedFoodText
                    ]}
                  >
                    {food.name}
                  </Text>
                  <Text 
                    style={[
                      styles.foodItemDetails, 
                      getTextStyle(),
                      selectedFood && selectedFood.name === food.name && styles.selectedFoodText
                    ]}
                  >
                    {`蛋白质:${food.protein}g | 碳水:${food.carbs}g | 脂肪:${food.fat}g`}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    );
  };
  
  // 渲染不同转换类型的内容
  const renderConversionContent = () => {
    switch(conversionType) {
      case CONVERSION_TYPES.MACROS_TO_CALORIES:
        return (
          <View style={styles.conversionContainer}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, getTextStyle()]}>蛋白质 (克)</Text>
              <TextInput
                style={[styles.input, getInputStyle()]}
                keyboardType="numeric"
                value={protein}
                onChangeText={setProtein}
                placeholder="输入蛋白质克数"
                placeholderTextColor={themeStyle === 'sport' ? '#99a8cc' : '#aaa'}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, getTextStyle()]}>碳水化合物 (克)</Text>
              <TextInput
                style={[styles.input, getInputStyle()]}
                keyboardType="numeric"
                value={carbs}
                onChangeText={setCarbs}
                placeholder="输入碳水克数"
                placeholderTextColor={themeStyle === 'sport' ? '#99a8cc' : '#aaa'}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, getTextStyle()]}>脂肪 (克)</Text>
              <TextInput
                style={[styles.input, getInputStyle()]}
                keyboardType="numeric"
                value={fat}
                onChangeText={setFat}
                placeholder="输入脂肪克数"
                placeholderTextColor={themeStyle === 'sport' ? '#99a8cc' : '#aaa'}
              />
            </View>
            
            <TouchableOpacity
              style={[styles.button, getButtonStyle()]}
              onPress={calculateCaloriesFromMacros}
            >
              <Text style={styles.buttonText}>计算卡路里</Text>
            </TouchableOpacity>
            
            <View style={[styles.resultCard, getCardStyle()]}>
              <Text style={[styles.resultLabel, getTextStyle()]}>总卡路里</Text>
              <Text style={[styles.resultValue, getTextStyle()]}>{calories ? `${calories} 千卡` : '-'}</Text>
            </View>
          </View>
        );
        
      case CONVERSION_TYPES.CALORIES_TO_MACROS:
        return (
          <View style={styles.conversionContainer}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, getTextStyle()]}>卡路里</Text>
              <TextInput
                style={[styles.input, getInputStyle()]}
                keyboardType="numeric"
                value={calories}
                onChangeText={setCalories}
                placeholder="输入总卡路里"
                placeholderTextColor={themeStyle === 'sport' ? '#99a8cc' : '#aaa'}
              />
            </View>
            
            <TouchableOpacity
              style={[styles.button, getButtonStyle()]}
              onPress={calculateMacrosFromCalories}
            >
              <Text style={styles.buttonText}>计算宏量营养素</Text>
            </TouchableOpacity>
            
            <View style={[styles.resultCard, getCardStyle()]}>
              <Text style={[styles.resultLabel, getTextStyle()]}>蛋白质 (30%)</Text>
              <Text style={[styles.resultValue, getTextStyle()]}>{protein ? `${protein}克` : '-'}</Text>
            </View>
            
            <View style={[styles.resultCard, getCardStyle()]}>
              <Text style={[styles.resultLabel, getTextStyle()]}>碳水化合物 (50%)</Text>
              <Text style={[styles.resultValue, getTextStyle()]}>{carbs ? `${carbs}克` : '-'}</Text>
            </View>
            
            <View style={[styles.resultCard, getCardStyle()]}>
              <Text style={[styles.resultLabel, getTextStyle()]}>脂肪 (20%)</Text>
              <Text style={[styles.resultValue, getTextStyle()]}>{fat ? `${fat}克` : '-'}</Text>
            </View>
          </View>
        );
        
      case CONVERSION_TYPES.FOOD_TO_NUTRIENTS:
        return (
          <View style={styles.conversionContainer}>
            <TouchableOpacity
              style={[styles.foodSelector, getInputStyle()]}
              onPress={() => setFoodModalVisible(true)}
            >
              <Text style={[getTextStyle()]}>
                {selectedFood ? selectedFood.name : '选择食物'}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, getTextStyle()]}>重量 (克)</Text>
              <TextInput
                style={[styles.input, getInputStyle()]}
                keyboardType="numeric"
                value={foodWeight}
                onChangeText={setFoodWeight}
                placeholder="输入食物重量"
                placeholderTextColor={themeStyle === 'sport' ? '#99a8cc' : '#aaa'}
              />
            </View>
            
            {selectedFood && (
              <>
                <View style={[styles.resultCard, getCardStyle()]}>
                  <Text style={[styles.resultLabel, getTextStyle()]}>卡路里</Text>
                  <Text style={[styles.resultValue, getTextStyle()]}>{`${foodNutrients.calories} 千卡`}</Text>
                </View>
                
                <View style={[styles.resultCard, getCardStyle()]}>
                  <Text style={[styles.resultLabel, getTextStyle()]}>蛋白质</Text>
                  <Text style={[styles.resultValue, getTextStyle()]}>{`${foodNutrients.protein}克`}</Text>
                </View>
                
                <View style={[styles.resultCard, getCardStyle()]}>
                  <Text style={[styles.resultLabel, getTextStyle()]}>碳水化合物</Text>
                  <Text style={[styles.resultValue, getTextStyle()]}>{`${foodNutrients.carbs}克`}</Text>
                </View>
                
                <View style={[styles.resultCard, getCardStyle()]}>
                  <Text style={[styles.resultLabel, getTextStyle()]}>脂肪</Text>
                  <Text style={[styles.resultValue, getTextStyle()]}>{`${foodNutrients.fat}克`}</Text>
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
  
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: getBackgroundColor() }]}>
      <StatusBar barStyle={themeStyle === 'sport' ? 'light-content' : 'dark-content'} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onBack}
        >
          <Text style={[styles.backButtonText, getTextStyle()]}>返回</Text>
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, getTextStyle()]}>营养素换算</Text>
        
        <View style={styles.placeholder}></View>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.typeSelector}>
          {Object.values(CONVERSION_TYPES).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeButton,
                conversionType === type ? [styles.selectedTypeButton, getButtonStyle()] : null
              ]}
              onPress={() => setConversionType(type)}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  conversionType === type ? styles.selectedTypeText : getTextStyle()
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {renderConversionContent()}
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