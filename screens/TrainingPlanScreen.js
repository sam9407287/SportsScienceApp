import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  FlatList,
  Modal,
  Alert
} from 'react-native';
import { t } from '../i18n';
import { ThemeContext } from '../context/ThemeContext';
import { Ionicons, MaterialCommunityIcons, AntDesign, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 訓練計劃模板類型
const trainingGoals = [
  { id: 'marathon', title: '馬拉松', icon: 'run-fast' },
  { id: 'triathlon', title: '鐵人三項', icon: 'triathlon' },
  { id: 'strength', title: '增肌', icon: 'weight-lifter' },
  { id: 'fatLoss', title: '減脂', icon: 'fire' },
  { id: 'crossfit', title: '交叉訓練', icon: 'dumbbell' },
  { id: 'custom', title: '自定義計劃', icon: 'plus' }
];

// 週期類型
const cycleTypes = [
  { id: 'macro', title: '大週期', description: '通常持續3-6個月，針對特定目標的整體訓練週期' },
  { id: 'meso', title: '中週期', description: '通常持續3-6週，著重於特定訓練適應性的發展階段' },
  { id: 'micro', title: '小週期', description: '通常持續7-10天，包含每天的具體訓練安排' }
];

export default function TrainingPlanScreen({ onBack }) {
  const { isDarkMode } = useContext(ThemeContext);
  const [currentView, setCurrentView] = useState('main'); // main, templates, createPlan, viewPlan, editPlan
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [userPlans, setUserPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  
  // 載入用戶訓練計劃
  useEffect(() => {
    loadUserPlans();
  }, []);
  
  // 載入用戶訓練計劃
  const loadUserPlans = async () => {
    try {
      const savedPlans = await AsyncStorage.getItem('training_plans');
      if (savedPlans) {
        setUserPlans(JSON.parse(savedPlans));
      }
    } catch (error) {
      console.error('載入訓練計劃失敗:', error);
    }
  };
  
  // 儲存用戶訓練計劃
  const saveUserPlans = async (plans) => {
    try {
      await AsyncStorage.setItem('training_plans', JSON.stringify(plans));
      setUserPlans(plans);
    } catch (error) {
      console.error('儲存訓練計劃失敗:', error);
      Alert.alert('錯誤', '無法儲存訓練計劃');
    }
  };
  
  // 刪除訓練計劃
  const deletePlan = (planId) => {
    Alert.alert(
      '確認刪除',
      '您確定要刪除這個訓練計劃嗎？此操作無法恢復。',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '刪除', 
          style: 'destructive',
          onPress: async () => {
            const updatedPlans = userPlans.filter(plan => plan.id !== planId);
            await saveUserPlans(updatedPlans);
          }
        }
      ]
    );
  };
  
  // 切換到主頁面
  const goToMainView = () => {
    setCurrentView('main');
    setSelectedPlan(null);
    setSelectedGoal(null);
  };
  
  // 渲染目標選擇模態視窗
  const renderGoalSelectionModal = () => {
    return (
      <Modal
        visible={showGoalModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGoalModal(false)}
      >
        <View style={[
          styles.modalContainer,
          isDarkMode ? styles.modalContainerDark : styles.modalContainerLight
        ]}>
          <View style={[
            styles.modalContent,
            isDarkMode ? styles.modalContentDark : styles.modalContentLight
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[
                styles.modalTitle,
                isDarkMode ? styles.textDark : styles.textLight
              ]}>
                選擇訓練目標
              </Text>
              <TouchableOpacity
                onPress={() => setShowGoalModal(false)}
                style={styles.closeButton}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={isDarkMode ? '#fff' : '#000'}
                />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={trainingGoals}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.goalList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.goalItem,
                    isDarkMode ? styles.goalItemDark : styles.goalItemLight
                  ]}
                  onPress={() => {
                    setSelectedGoal(item);
                    setShowGoalModal(false);
                    setCurrentView('createPlan');
                  }}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={24}
                    color={isDarkMode ? '#fff' : '#000'}
                    style={styles.goalIcon}
                  />
                  <Text style={[
                    styles.goalText,
                    isDarkMode ? styles.textDark : styles.textLight
                  ]}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    );
  };
  
  // 渲染主頁面
  const renderMainView = () => {
    return (
      <View style={styles.mainContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
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
            訓練計劃
          </Text>
        </View>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              isDarkMode ? styles.buttonDark : styles.buttonLight
            ]}
            onPress={() => setShowGoalModal(true)}
          >
            <AntDesign 
              name="plus" 
              size={22} 
              color={isDarkMode ? "#fff" : "#007bff"} 
            />
            <Text style={[
              styles.actionButtonText,
              { color: isDarkMode ? "#fff" : "#007bff" }
            ]}>
              創建新計劃
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.actionButton,
              isDarkMode ? styles.buttonDark : styles.buttonLight
            ]}
            onPress={() => setCurrentView('templates')}
          >
            <MaterialCommunityIcons 
              name="file-document-outline" 
              size={22} 
              color={isDarkMode ? "#fff" : "#007bff"} 
            />
            <Text style={[
              styles.actionButtonText,
              { color: isDarkMode ? "#fff" : "#007bff" }
            ]}>
              瀏覽模板
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.userPlansContainer}>
          <Text style={[
            styles.sectionTitle,
            isDarkMode ? styles.textDark : styles.textLight
          ]}>
            我的訓練計劃
          </Text>
          
          {userPlans.length > 0 ? (
            <FlatList
              data={userPlans}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.planCard,
                    isDarkMode ? styles.cardDark : styles.cardLight
                  ]}
                  onPress={() => {
                    setSelectedPlan(item);
                    setCurrentView('viewPlan');
                  }}
                >
                  <View style={styles.planHeader}>
                    <View style={styles.planTitleContainer}>
                      <MaterialCommunityIcons
                        name={trainingGoals.find(goal => goal.id === item.goalType)?.icon || 'dumbbell'}
                        size={20}
                        color={isDarkMode ? "#fff" : "#333"}
                        style={styles.planIcon}
                      />
                      <Text style={[
                        styles.planTitle,
                        isDarkMode ? styles.textDark : styles.textLight
                      ]}>
                        {item.name}
                      </Text>
                    </View>
                    
                    <View style={styles.planActions}>
                      <TouchableOpacity
                        style={styles.planActionButton}
                        onPress={() => {
                          setSelectedPlan(item);
                          setCurrentView('editPlan');
                        }}
                      >
                        <Ionicons
                          name="pencil"
                          size={18}
                          color={isDarkMode ? "#aaa" : "#666"}
                        />
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.planActionButton}
                        onPress={() => deletePlan(item.id)}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color={isDarkMode ? "#aaa" : "#666"}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <View style={styles.planDetails}>
                    <View style={styles.planDetailItem}>
                      <Text style={[
                        styles.planDetailLabel,
                        isDarkMode ? styles.textDarkSecondary : styles.textLightSecondary
                      ]}>
                        目標:
                      </Text>
                      <Text style={[
                        styles.planDetailValue,
                        isDarkMode ? styles.textDark : styles.textLight
                      ]}>
                        {trainingGoals.find(goal => goal.id === item.goalType)?.title || '自定義'}
                      </Text>
                    </View>
                    
                    <View style={styles.planDetailItem}>
                      <Text style={[
                        styles.planDetailLabel,
                        isDarkMode ? styles.textDarkSecondary : styles.textLightSecondary
                      ]}>
                        週期:
                      </Text>
                      <Text style={[
                        styles.planDetailValue,
                        isDarkMode ? styles.textDark : styles.textLight
                      ]}>
                        {item.duration} 週
                      </Text>
                    </View>
                    
                    <View style={styles.planDetailItem}>
                      <Text style={[
                        styles.planDetailLabel,
                        isDarkMode ? styles.textDarkSecondary : styles.textLightSecondary
                      ]}>
                        訓練頻率:
                      </Text>
                      <Text style={[
                        styles.planDetailValue,
                        isDarkMode ? styles.textDark : styles.textLight
                      ]}>
                        每週 {item.frequency} 次
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.planList}
            />
          ) : (
            <View style={styles.emptyPlansContainer}>
              <MaterialCommunityIcons
                name="calendar-blank-outline"
                size={60}
                color={isDarkMode ? "#555" : "#ccc"}
              />
              <Text style={[
                styles.emptyPlansText,
                isDarkMode ? styles.textDarkSecondary : styles.textLightSecondary
              ]}>
                您尚未創建任何訓練計劃
              </Text>
              <TouchableOpacity
                style={[
                  styles.createFirstPlanButton,
                  isDarkMode ? styles.buttonDark : styles.buttonLight
                ]}
                onPress={() => setShowGoalModal(true)}
              >
                <Text style={[
                  styles.createFirstPlanText,
                  { color: isDarkMode ? "#fff" : "#007bff" }
                ]}>
                  立即創建您的第一個計劃
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };
  
  // 渲染其他視圖（由於功能複雜，此處只包含主視圖部分）
  // TODO: 實現 renderTemplatesView, renderCreatePlanView, renderViewPlanView, renderEditPlanView

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        isDarkMode ? styles.containerDark : styles.containerLight
      ]}
    >
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {currentView === 'main' && renderMainView()}
        {/* TODO: 實現其他視圖 */}
      </ScrollView>
      
      {renderGoalSelectionModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  containerLight: {
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  mainContainer: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonDark: {
    backgroundColor: '#333333',
    borderColor: '#555555',
    borderWidth: 1,
  },
  buttonLight: {
    backgroundColor: '#ffffff',
    borderColor: '#dddddd',
    borderWidth: 1,
  },
  actionButtonText: {
    fontWeight: '600',
    marginLeft: 8,
  },
  userPlansContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  planList: {
    paddingBottom: 20,
  },
  planCard: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
  },
  cardDark: {
    backgroundColor: '#222222',
  },
  cardLight: {
    backgroundColor: '#ffffff',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planIcon: {
    marginRight: 8,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  planActions: {
    flexDirection: 'row',
  },
  planActionButton: {
    padding: 5,
    marginLeft: 8,
  },
  planDetails: {
    marginTop: 4,
  },
  planDetailItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  planDetailLabel: {
    marginRight: 4,
    fontSize: 14,
  },
  planDetailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyPlansContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyPlansText: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 20,
  },
  createFirstPlanButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  createFirstPlanText: {
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainerDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContainerLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    paddingBottom: 30,
    maxHeight: '70%',
  },
  modalContentDark: {
    backgroundColor: '#121212',
  },
  modalContentLight: {
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  goalList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  goalItemDark: {
    backgroundColor: '#333333',
  },
  goalItemLight: {
    backgroundColor: '#f5f5f5',
  },
  goalIcon: {
    marginRight: 16,
  },
  goalText: {
    fontSize: 16,
    fontWeight: '500',
  },
}); 