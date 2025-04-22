import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';
import RMCalculator from './RMCalculator';
import Settings from './Settings';
import NutrientConverter from './NutrientConverter';
import AsyncStorage from '@react-native-async-storage/async-storage';

const modules = [
  { key: 'rmCalculator', title: 'RM 換算計算器' },
  { key: 'nutrient', title: '營養素換算' },
  { key: 'maxEffort', title: '最大激勵換算' },
  { key: 'aerobic', title: '有氧能力計算' },
  { key: 'settings', title: '設置' },
];

export default function HomeScreen() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [themeStyle, setThemeStyle] = useState('sport'); // 默認風格
  
  // 從本地存儲加載主題風格
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('themeStyle');
        if (savedTheme) {
          setThemeStyle(savedTheme);
        }
      } catch (error) {
        console.error('加載主題失敗:', error);
      }
    };
    
    loadTheme();
  }, []);
  
  // 保存主題風格
  const handleThemeChange = async (newTheme) => {
    try {
      await AsyncStorage.setItem('themeStyle', newTheme);
      setThemeStyle(newTheme);
    } catch (error) {
      console.error('保存主題失敗:', error);
    }
  };
  
  // 根據當前主題獲取頁面樣式
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
  
  // 渲染屏幕
  if (currentScreen === 'rmCalculator') {
    return (
      <RMCalculator 
        onBack={() => setCurrentScreen('home')} 
        themeStyle={themeStyle}
      />
    );
  }
  
  if (currentScreen === 'nutrient') {
    return (
      <NutrientConverter
        onBack={() => setCurrentScreen('home')}
        themeStyle={themeStyle}
      />
    );
  }
  
  if (currentScreen === 'settings') {
    return (
      <Settings 
        onBack={() => setCurrentScreen('home')}
        currentTheme={themeStyle}
        onThemeChange={handleThemeChange}
      />
    );
  }
  
  // 獲取主頁背景顏色
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
  
  return (
    <SafeAreaView 
      style={[
        styles.safeArea, 
        { backgroundColor: getBackgroundColor() }
      ]}
    >
      <StatusBar barStyle={themeStyle === 'sport' ? 'light-content' : 'dark-content'} />
      
      <View style={styles.headerContainer}>
        <Text style={[styles.header, getTextStyle()]}>運動科學平台</Text>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {modules.map((mod) => (
          <TouchableOpacity 
            key={mod.key} 
            style={[styles.card, getCardStyle()]} 
            onPress={() => setCurrentScreen(mod.key)}
          >
            <Text style={[styles.cardText, getTextStyle()]}>{mod.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 20,
    paddingTop: 0,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  card: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardText: {
    fontSize: 18,
    fontWeight: '500',
  },
});
