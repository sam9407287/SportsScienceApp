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

// 預設訓練計劃模板
const trainingPlanTemplates = [
  // 馬拉松訓練計劃
  {
    id: 'template_marathon_beginner',
    name: '初學者馬拉松計劃',
    goalType: 'marathon',
    duration: 16,
    frequency: 4,
    intensityLevel: 'beginner',
    useCycles: true,
    description: '適合首次參加馬拉松的跑者，循序漸進增加里程，包含基礎、建設、強化和減量階段。',
    features: ['每週4次訓練', '最長跑距離逐步增加至32公里', '包含間歇訓練和長距離跑', '完整的減量期'],
    thumbnail: null
  },
  {
    id: 'template_marathon_intermediate',
    name: '中級馬拉松計劃',
    goalType: 'marathon',
    duration: 12,
    frequency: 5,
    intensityLevel: 'intermediate',
    useCycles: true,
    description: '適合有馬拉松經驗的跑者，專注於提高配速和耐力，包含更多高強度間歇訓練。',
    features: ['每週5次訓練', '包含速度訓練和配速跑', '強化期包含馬拉松配速訓練', '更短的減量期'],
    thumbnail: null
  },
  
  // 鐵人三項訓練計劃
  {
    id: 'template_triathlon_sprint',
    name: '短距離鐵人三項計劃',
    goalType: 'triathlon',
    duration: 12,
    frequency: 6,
    intensityLevel: 'beginner',
    useCycles: true,
    description: '為短距離鐵人三項(750m游泳/20km騎車/5km跑步)設計的訓練計劃，平衡三項運動訓練。',
    features: ['每週平均2次游泳、2次騎車、2次跑步', '包含轉換訓練', '漸進增加訓練量', '比賽策略準備'],
    thumbnail: null
  },
  {
    id: 'template_triathlon_olympic',
    name: '奧運距離鐵人三項計劃',
    goalType: 'triathlon',
    duration: 16,
    frequency: 7,
    intensityLevel: 'intermediate',
    useCycles: true,
    description: '為奧運距離鐵人三項(1.5km游泳/40km騎車/10km跑步)設計的全面訓練計劃。',
    features: ['每週7次訓練，涵蓋三項運動', '包含複合訓練日', '專注於轉換效率', '包含賽前模擬'],
    thumbnail: null
  },
  
  // 增肌訓練計劃
  {
    id: 'template_strength_beginner',
    name: '初學者增肌計劃',
    goalType: 'strength',
    duration: 12,
    frequency: 3,
    intensityLevel: 'beginner',
    useCycles: false,
    description: '適合健身新手的全身增肌計劃，著重於基礎複合動作和正確姿勢的建立。',
    features: ['全身訓練', '專注於基礎複合動作', '循序漸進增加重量', '充分的恢復時間'],
    thumbnail: null
  },
  {
    id: 'template_strength_hypertrophy',
    name: '肌肉肥大專項計劃',
    goalType: 'strength',
    duration: 8,
    frequency: 5,
    intensityLevel: 'intermediate',
    useCycles: true,
    description: '以肌肉肥大為主要目標的訓練計劃，採用高容量、中等強度的訓練方式。',
    features: ['分化訓練(推/拉/腿)', '高訓練容量', '適中休息時間', '漸進式超負荷'],
    thumbnail: null
  },
  
  // 減脂訓練計劃
  {
    id: 'template_fatLoss_beginner',
    name: '初學者減脂計劃',
    goalType: 'fatLoss',
    duration: 8,
    frequency: 4,
    intensityLevel: 'beginner',
    useCycles: false,
    description: '結合有氧運動和阻力訓練的全面減脂計劃，適合減脂初學者。',
    features: ['全身阻力訓練', 'HIIT和穩態有氧結合', '循序漸進增加強度', '簡單易執行'],
    thumbnail: null
  },
  {
    id: 'template_fatLoss_hiit',
    name: 'HIIT減脂強化計劃',
    goalType: 'fatLoss',
    duration: 6,
    frequency: 5,
    intensityLevel: 'intermediate',
    useCycles: true,
    description: '高強度間歇訓練為主的減脂計劃，高效燃脂並保留肌肉。',
    features: ['專注於HIIT訓練', '配合全身阻力訓練', '訓練時間短但高效', '適合時間有限的人群'],
    thumbnail: null
  },
  
  // 交叉訓練計劃
  {
    id: 'template_crossfit_beginner',
    name: '交叉訓練入門計劃',
    goalType: 'crossfit',
    duration: 10,
    frequency: 4,
    intensityLevel: 'beginner',
    useCycles: false,
    description: '為交叉訓練初學者設計的入門計劃，著重於基礎動作技巧和體能建設。',
    features: ['學習基本動作技巧', '逐步提高訓練強度', '每週有充分恢復時間', '包含技術和體能訓練'],
    thumbnail: null
  },
  {
    id: 'template_crossfit_wod',
    name: '交叉訓練WOD挑戰計劃',
    goalType: 'crossfit',
    duration: 8,
    frequency: 5,
    intensityLevel: 'advanced',
    useCycles: true,
    description: '高強度交叉訓練計劃，包含多樣化的每日訓練挑戰(WOD)，適合有經驗的訓練者。',
    features: ['多樣化WOD訓練', '力量和體能全面發展', '高強度訓練', '技術和強度並重'],
    thumbnail: null
  }
];

export default function TrainingPlanScreen({ onBack }) {
  const { isDarkMode } = useContext(ThemeContext);
  const [currentView, setCurrentView] = useState('main'); // main, templates, createPlan, viewPlan, editPlan
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [userPlans, setUserPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [filteredTemplates, setFilteredTemplates] = useState(trainingPlanTemplates);
  
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
  
  // 基於模板創建計劃
  const createPlanFromTemplate = (template) => {
    setSelectedGoal(trainingGoals.find(goal => goal.id === template.goalType));
    
    // 預設填充模板數據
    const newPlan = {
      ...template,
      id: undefined,  // 創建時會生成新ID
      name: `${template.name} (複製)`,
      createdAt: new Date().toISOString()
    };
    setSelectedPlan(newPlan);
    setCurrentView('createPlan');
  };
  
  // 篩選模板
  const filterTemplatesByGoal = (goalId) => {
    if (goalId === 'all') {
      setFilteredTemplates(trainingPlanTemplates);
    } else {
      setFilteredTemplates(trainingPlanTemplates.filter(template => template.goalType === goalId));
    }
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
  
  // 渲染模板瀏覽視圖
  const renderTemplatesView = () => {
    return (
      <View style={styles.mainContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={goToMainView}>
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
            訓練計劃模板
          </Text>
        </View>
        
        <View style={styles.filterContainer}>
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
          >
            <TouchableOpacity
              style={[
                styles.filterButton,
                isDarkMode ? styles.filterButtonDark : styles.filterButtonLight
              ]}
              onPress={() => filterTemplatesByGoal('all')}
            >
              <Text style={[
                styles.filterButtonText,
                isDarkMode ? styles.textDark : styles.textLight
              ]}>
                所有
              </Text>
            </TouchableOpacity>
            
            {trainingGoals.map(goal => (
              <TouchableOpacity
                key={goal.id}
                style={[
                  styles.filterButton,
                  isDarkMode ? styles.filterButtonDark : styles.filterButtonLight
                ]}
                onPress={() => filterTemplatesByGoal(goal.id)}
              >
                <MaterialCommunityIcons
                  name={goal.icon}
                  size={18}
                  color={isDarkMode ? '#fff' : '#333'}
                  style={styles.filterIcon}
                />
                <Text style={[
                  styles.filterButtonText,
                  isDarkMode ? styles.textDark : styles.textLight
                ]}>
                  {goal.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        <FlatList
          data={filteredTemplates}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={[
                styles.templateCard,
                isDarkMode ? styles.cardDark : styles.cardLight
              ]}
            >
              <View style={styles.templateHeader}>
                <View style={styles.templateTitleContainer}>
                  <MaterialCommunityIcons
                    name={trainingGoals.find(goal => goal.id === item.goalType)?.icon || 'dumbbell'}
                    size={24}
                    color={isDarkMode ? "#fff" : "#333"}
                    style={styles.templateIcon}
                  />
                  <View>
                    <Text style={[
                      styles.templateTitle,
                      isDarkMode ? styles.textDark : styles.textLight
                    ]}>
                      {item.name}
                    </Text>
                    <Text style={[
                      styles.templateType,
                      isDarkMode ? styles.textDarkSecondary : styles.textLightSecondary
                    ]}>
                      {trainingGoals.find(goal => goal.id === item.goalType)?.title || '自定義計劃'}
                    </Text>
                  </View>
                </View>
                
                <View style={[
                  styles.intensityBadge,
                  item.intensityLevel === 'beginner' 
                    ? styles.intensityBeginner 
                    : (item.intensityLevel === 'intermediate' 
                      ? styles.intensityIntermediate 
                      : styles.intensityAdvanced)
                ]}>
                  <Text style={styles.intensityText}>
                    {item.intensityLevel === 'beginner' 
                      ? '初級' 
                      : (item.intensityLevel === 'intermediate' 
                        ? '中級' 
                        : '高級')}
                  </Text>
                </View>
              </View>
              
              <Text style={[
                styles.templateDescription,
                isDarkMode ? styles.textDarkSecondary : styles.textLightSecondary
              ]}>
                {item.description}
              </Text>
              
              <View style={styles.templateDetails}>
                <View style={styles.templateDetailItem}>
                  <MaterialCommunityIcons
                    name="calendar-range"
                    size={18}
                    color={isDarkMode ? "#aaa" : "#666"}
                  />
                  <Text style={[
                    styles.templateDetailText,
                    isDarkMode ? styles.textDarkSecondary : styles.textLightSecondary
                  ]}>
                    {item.duration} 週
                  </Text>
                </View>
                
                <View style={styles.templateDetailItem}>
                  <MaterialCommunityIcons
                    name="run"
                    size={18}
                    color={isDarkMode ? "#aaa" : "#666"}
                  />
                  <Text style={[
                    styles.templateDetailText,
                    isDarkMode ? styles.textDarkSecondary : styles.textLightSecondary
                  ]}>
                    每週 {item.frequency} 次訓練
                  </Text>
                </View>
              </View>
              
              <View style={styles.templateFeatures}>
                {item.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={isDarkMode ? "#4caf50" : "#2e7d32"}
                      style={styles.featureIcon}
                    />
                    <Text style={[
                      styles.featureText,
                      isDarkMode ? styles.textDark : styles.textLight
                    ]}>
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>
              
              <TouchableOpacity
                style={[
                  styles.useTemplateButton,
                  isDarkMode ? styles.buttonDark : styles.buttonLight
                ]}
                onPress={() => createPlanFromTemplate(item)}
              >
                <Text style={[
                  styles.useTemplateButtonText,
                  { color: isDarkMode ? "#fff" : "#007bff" }
                ]}>
                  使用此模板
                </Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.templateList}
        />
      </View>
    );
  };
  
  // 渲染其他視圖（由於功能複雜，此處只包含主視圖部分）
  // TODO: 實現 renderCreatePlanView, renderViewPlanView, renderEditPlanView

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
        {currentView === 'templates' && renderTemplatesView()}
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
  // 模板瀏覽界面樣式
  filterContainer: {
    marginBottom: 16,
  },
  filterScrollContent: {
    paddingBottom: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
  },
  filterButtonDark: {
    backgroundColor: '#333333',
  },
  filterButtonLight: {
    backgroundColor: '#f0f0f0',
  },
  filterIcon: {
    marginRight: 6,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  templateList: {
    paddingBottom: 30,
  },
  templateCard: {
    borderRadius: 12,
    marginBottom: 20,
    padding: 16,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  templateTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  templateIcon: {
    marginRight: 12,
  },
  templateTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  templateType: {
    fontSize: 14,
    marginTop: 2,
  },
  intensityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  intensityBeginner: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  intensityIntermediate: {
    backgroundColor: 'rgba(33, 150, 243, 0.2)',
  },
  intensityAdvanced: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
  },
  intensityText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
  templateDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  templateDetails: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  templateDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  templateDetailText: {
    fontSize: 14,
    marginLeft: 6,
  },
  templateFeatures: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  featureIcon: {
    marginRight: 6,
  },
  featureText: {
    fontSize: 14,
  },
  useTemplateButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  useTemplateButtonText: {
    fontSize: 16,
    fontWeight: '600',
  }
}); 