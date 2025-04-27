# 運動科學平台 (Sports Science Platform)

一個全面的運動科學和健身管理移動應用程序，為健身愛好者、運動員和專業人士提供多種計算工具和追踪功能。

## 功能概述

該應用程序包含多個專業模塊，幫助用戶更科學地規劃和追踪訓練：

### 力量訓練工具
- **RM計算器**：計算一次最大重量(1RM)和基於百分比的訓練重量
- **RPE計算器**：基於主觀疲勞度(RPE)計算訓練負荷
- **速度依循訓練計算器(VBT)**：根據動作速度優化訓練重量和強度

### 有氧訓練工具
- **有氧能力計算**：計算VO2Max和心率區間，優化有氧訓練效果

### 營養和健康追踪
- **營養素換算**：在熱量和宏量營養素之間轉換，食物營養分析
- **健康記錄**：跟踪體重、體脂等關鍵健康指標，查看進度圖表

### 訓練計劃
- **訓練計劃生成**：根據不同訓練目標創建專業訓練計劃
- **計劃管理**：查看、編輯和跟踪訓練計劃進度
- **預設模板**：提供馬拉松、鐵人三項、增肌、減脂等多種目標的訓練模板

## 技術架構

### 前端技術
- **React Native**：跨平台移動應用開發框架
- **Expo**：簡化React Native開發的工具和服務
- **React Navigation**：應用程序導航管理

### 數據管理
- **AsyncStorage**：本地數據存儲
- **Context API**：全局狀態管理（如主題、語言設置）

### 用戶界面
- **自適應設計**：支持淺色和深色模式
- **多語言支持**：支持中文和英文，基於i18n-js實現
- **自定義組件**：模塊化UI組件設計

## 數據結構

### 核心數據模型

#### 用戶設置
```javascript
{
  language: 'zh' | 'en',  // 語言設置
  isDarkMode: boolean,    // 深色模式
  useSystemTheme: boolean // 是否跟隨系統主題
}
```

#### 模塊定義
```javascript
{
  key: string,            // 模塊唯一標識符
  title: string,          // 模塊標題（支持多語言）
  icon: string,           // 圖標名稱
  iconType: string        // 圖標類型
}
```

#### 訓練計劃
```javascript
{
  id: string,             // 計劃唯一ID
  name: string,           // 計劃名稱
  goalType: string,       // 訓練目標類型
  duration: number,       // 持續週數
  frequency: number,      // 每週訓練次數
  intensityLevel: string, // 強度級別
  useCycles: boolean,     // 是否使用週期
  description: string,    // 計劃描述
  createdAt: string,      // 創建時間
  features: string[]      // 計劃特點
}
```

#### 健康記錄
```javascript
{
  id: string,               // 記錄ID
  date: string,             // 日期
  weight: number,           // 體重
  bodyFatPercentage: number, // 體脂百分比
  note: string               // 備注
}
```

## 安裝和運行

### 前提條件
- Node.js (>= 12.x)
- npm 或 yarn
- Expo CLI
- iOS/Android模擬器或實體設備

### 安裝步驟
1. 克隆倉庫
   ```bash
   git clone [倉庫URL]
   cd SportsScienceApp
   ```

2. 安裝依賴
   ```bash
   npm install
   # 或
   yarn install
   ```

3. 啟動應用
   ```bash
   npm start
   # 或
   yarn start
   ```

4. 使用Expo Go應用掃描二維碼或在模擬器中運行

## 設計理念

該應用程序旨在將專業運動科學知識轉化為實用工具，幫助各級運動愛好者：

1. **科學化訓練**：基於科學原理和研究成果設計計算公式
2. **個性化體驗**：根據用戶目標和數據提供定制建議
3. **直觀易用**：通過清晰的UI和數據可視化簡化複雜概念
4. **全面整合**：整合訓練、營養和健康追踪功能於一體

## 未來開發計劃

- 雲同步功能：支持跨設備數據同步
- 社交功能：與朋友分享訓練成果
- 訓練AI助手：基於用戶數據提供個性化建議
- 與健身設備連接：支持藍牙連接智能健身設備

## 貢獻指南

我們歡迎社區貢獻！如果您想參與開發，請：

1. Fork倉庫
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 創建Pull Request

## 許可證

本項目采用MIT許可證 - 詳情見LICENSE文件

## 聯繫與支持

如有問題或建議，請通過以下方式聯繫我們：
- Email: [support@sportsscienceapp.com](mailto:support@sportsscienceapp.com)
- 官方網站: [www.sportsscienceapp.com](http://www.sportsscienceapp.com) 