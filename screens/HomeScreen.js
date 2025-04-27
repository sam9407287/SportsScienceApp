import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  StatusBar,
  Platform,
  Alert
} from 'react-native';
import RMCalculator from './RMCalculator';
import Settings from './Settings';
import NutrientConverter from './NutrientConverter';
import AerobicCalculator from './AerobicCalculator';
import HealthRecord from './HealthRecord';
import RPECalculator from './RPECalculator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { t, initLanguage, isI18nInitialized, getCurrentLanguage } from '../i18n';
import { ThemeContext } from '../context/ThemeContext';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

// 模塊顏色定義
const moduleColors = {
  rmCalculator: { light: '#FF6B6B', dark: '#B91C1C' },
  nutrient: { light: '#4ECDC4', dark: '#0F766E' },
  rpeCalculator: { light: '#FFD166', dark: '#B45309' },
  aerobic: { light: '#06D6A0', dark: '#047857' },
  healthRecord: { light: '#9775FA', dark: '#5B21B6' },
  settings: { light: '#118AB2', dark: '#1E40AF' },
};

// 定義基本模塊 - 不依賴翻譯，避免初始化前使用
const basicModules = [
  { key: 'rmCalculator', title: 'RM 換算計算器', icon: 'weight-lifter', iconType: 'MaterialCommunityIcons' },
  { key: 'nutrient', title: '營養素換算', icon: 'nutrition', iconType: 'MaterialCommunityIcons' },
  { key: 'rpeCalculator', title: 'RPE 換算計算器', icon: 'arm-flex', iconType: 'MaterialCommunityIcons' },
  { key: 'aerobic', title: '有氧能力計算', icon: 'heart-pulse', iconType: 'MaterialCommunityIcons' },
  { key: 'healthRecord', title: '健康記錄', icon: 'chart-line', iconType: 'MaterialCommunityIcons' },
  { key: 'settings', title: '設置', icon: 'settings-outline', iconType: 'Ionicons' },
];

// 獲取翻譯後的模塊
const getTranslatedModules = () => {
  if (!isI18nInitialized()) {
    return basicModules;
  }
  
  try {
    return [
      { key: 'rmCalculator', title: t('rm_calculator'), icon: 'weight-lifter', iconType: 'MaterialCommunityIcons' },
      { key: 'nutrient', title: t('nutrient_converter'), icon: 'nutrition', iconType: 'MaterialCommunityIcons' },
      { key: 'rpeCalculator', title: t('rpe_calculator'), icon: 'arm-flex', iconType: 'MaterialCommunityIcons' },
      { key: 'aerobic', title: t('aerobic'), icon: 'heart-pulse', iconType: 'MaterialCommunityIcons' },
      { key: 'healthRecord', title: t('health_record'), icon: 'chart-line', iconType: 'MaterialCommunityIcons' },
      { key: 'settings', title: t('settings'), icon: 'settings-outline', iconType: 'Ionicons' },
    ];
  } catch (error) {
    console.error('Error getting translated modules:', error);
    return basicModules;
  }
};

export default function HomeScreen() {
  const { isDarkMode } = useContext(ThemeContext);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [modules, setModules] = useState(basicModules);
  const [isI18nReady, setIsI18nReady] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('zh');
  
  // 初始化語言設置
  useEffect(() => {
    const initialize = async () => {
      try {
        // 初始化語言設置
        await initLanguage();
        setIsI18nReady(true);
        
        // 獲取當前語言
        const lang = getCurrentLanguage();
        setCurrentLanguage(lang);
        
        // 更新模塊列表
        setModules(getTranslatedModules());
      } catch (error) {
        console.error('初始化失敗:', error);
        // 確保我們至少有默認模塊可以顯示
        setModules(basicModules);
      }
    };
    
    initialize();
  }, []);
  
  // 當 i18n 準備就緒時更新模塊
  useEffect(() => {
    if (isI18nReady) {
      // 獲取最新的語言
      const lang = getCurrentLanguage();
      setCurrentLanguage(lang);
      
      // 強制更新模塊標題
      setModules(getTranslatedModules());
    }
  }, [isI18nReady]);
  
  // 監聽從設置頁面返回時的語言變化
  useEffect(() => {
    if (currentScreen === 'home') {
      const newLang = getCurrentLanguage();
      if (newLang !== currentLanguage) {
        setCurrentLanguage(newLang);
        // 語言變更時強制更新模塊
        setModules(getTranslatedModules());
      }
    }
  }, [currentScreen, currentLanguage]);
  
  // 返回主頁時強制刷新模塊列表
  const handleBackToHome = () => {
    setCurrentScreen('home');
    // 返回主頁時強制更新模塊列表，以應用最新的語言設置
    setModules(getTranslatedModules());
  };
  
  // 渲染屏幕
  if (currentScreen === 'rmCalculator') {
    return (
      <RMCalculator 
        onBack={handleBackToHome}
      />
    );
  }
  
  if (currentScreen === 'nutrient') {
    return (
      <NutrientConverter
        onBack={handleBackToHome}
      />
    );
  }
  
  if (currentScreen === 'rpeCalculator') {
    return (
      <RPECalculator
        onBack={handleBackToHome}
      />
    );
  }
  
  if (currentScreen === 'aerobic') {
    return (
      <AerobicCalculator
        onBack={handleBackToHome}
      />
    );
  }
  
  if (currentScreen === 'healthRecord') {
    return (
      <HealthRecord
        onBack={handleBackToHome}
      />
    );
  }
  
  if (currentScreen === 'settings') {
    return (
      <Settings 
        onBack={handleBackToHome}
      />
    );
  }
  
  // 獲取應用標題
  const appTitle = isI18nReady && isI18nInitialized() ? t('app_title') : '運動科學平台';
  
  return (
    <SafeAreaView 
      style={[
        styles.safeArea, 
        isDarkMode ? styles.containerDark : styles.containerLight
      ]}
    >
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      <View style={[styles.headerContainer, isDarkMode && styles.headerContainerDark]}>
        <View style={styles.headerContent}>
          <MaterialCommunityIcons 
            name="dumbbell" 
            size={28} 
            color={isDarkMode ? "#9d6dde" : "#ff6b6b"} 
            style={styles.headerIcon}
          />
          <Text style={[styles.header, isDarkMode ? styles.textDark : styles.textLight]}>{appTitle}</Text>
        </View>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {modules.map((mod) => (
          <TouchableOpacity 
            key={mod.key} 
            style={[
              styles.card, 
              isDarkMode ? styles.cardDark : styles.cardLight
            ]} 
            onPress={() => setCurrentScreen(mod.key)}
            activeOpacity={0.7}
          >
            <View style={styles.cardContent}>
              <View style={[
                styles.iconContainer,
                { 
                  backgroundColor: isDarkMode 
                    ? `${moduleColors[mod.key]?.dark}30` || '#33333330'
                    : `${moduleColors[mod.key]?.light}20` || '#f0f0f0'
                }
              ]}>
                {renderIcon(mod, moduleColors[mod.key]?.light, moduleColors[mod.key]?.dark, isDarkMode)}
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={[
                  styles.cardText, 
                  isDarkMode ? styles.textDark : styles.textLight
                ]}>
                  {mod.title}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// 渲染圖標函數
const renderIcon = (module, lightColor, darkColor, isDark) => {
  const iconColor = isDark ? (darkColor || '#fff') : (lightColor || '#333');
  const iconSize = 24;
  
  switch (module.iconType) {
    case 'Ionicons':
      return <Ionicons name={module.icon} size={iconSize} color={iconColor} />;
    case 'MaterialCommunityIcons':
      return <MaterialCommunityIcons name={module.icon} size={iconSize} color={iconColor} />;
    case 'FontAwesome5':
      return <FontAwesome5 name={module.icon} size={iconSize} color={iconColor} />;
    default:
      return null;
  }
};

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
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContainerDark: {
    backgroundColor: '#1e1e1e',
    borderBottomColor: '#333',
    shadowOpacity: 0.2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    marginRight: 10,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textLight: {
    color: '#333',
  },
  textDark: {
    color: '#fff',
  },
  container: {
    padding: 20,
    paddingTop: 20,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 0,
  },
  cardLight: {
    backgroundColor: '#fff',
    shadowOpacity: 0.1,
  },
  cardDark: {
    backgroundColor: '#1e1e1e',
    shadowOpacity: 0.3,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  cardText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
