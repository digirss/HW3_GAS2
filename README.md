# Email to PDF Converter (GAS)

自動將帶有 `+vibe` 後綴的 email 轉換為 PDF 並儲存到 Google Drive。

## 功能特色

- 🔍 **智能監聽** - 自動檢測帶有 `+vibe` 後綴的郵件
- 📄 **PDF 轉換** - 將郵件內容轉換為格式化的 PDF 文件
- 💾 **自動儲存** - 儲存到 Google Drive 的專用資料夾
- 🏷️ **智能命名** - 檔案名稱包含主旨和時間戳記

## 使用場景

- 📧 整理特定重要郵件
- 🧾 收據自動歸檔
- 🎫 發票、中獎通知整理
- 📋 任何需要長期保存的郵件

## 部署步驟

### 1. 建立 Google Apps Script 專案

1. 前往 [Google Apps Script 控制台](https://script.google.com/)
2. 點擊「新增專案」
3. 將專案命名為 `Email-to-PDF-Converter`

### 2. 上傳程式碼

1. **上傳 Code.gs**
   - 刪除預設的 `Code.gs` 內容
   - 複製本專案的 `Code.gs` 內容並貼上
   - 儲存檔案

2. **新增 appsscript.json**
   - 在編輯器中點擊「檔案」→「專案設定」
   - 勾選「在編輯器中顯示 appsscript.json 資訊清單檔案」
   - 複製本專案的 `appsscript.json` 內容並貼上
   - 儲存檔案

### 3. 設定權限

1. 第一次執行函數時會要求授權
2. 點擊「授權」並選擇你的 Google 帳戶
3. 允許存取 Gmail 和 Google Drive 權限

### 4. 建立觸發器

**方法一：自動建立**
```javascript
// 執行這個函數來自動建立觸發器
onInstall()
```

**方法二：手動建立**
1. 在左側選單點擊「觸發器」
2. 點擊「新增觸發器」
3. 設定如下：
   - 選擇要執行的函數：`processGmailMessages`
   - 選擇活動來源：`Gmail`
   - 選擇活動類型：`新郵件`

### 5. 測試功能

1. **執行測試函數**
   ```javascript
   testFunction()
   ```

2. **寄送測試郵件**
   - 寄送郵件到：`yourname+vibe@gmail.com`
   - 檢查是否觸發處理程序

## 使用方式

### 基本使用

只要在任何 email 地址後面加上 `+vibe` 即可觸發：

```
demo+vibe@gmail.com
myname+vibe@gmail.com
work+vibe@company.com
```

### 檔案儲存

- **儲存位置**：Google Drive 根目錄 → `Vibe_Emails` 資料夾
- **檔案命名**：`[Vibe]_郵件主旨_日期時間.pdf`
- **檔案格式**：PDF，包含完整郵件資訊

### 郵件格式

轉換的 PDF 包含：
- 郵件主旨
- 寄件者資訊
- 收件者資訊
- 寄送日期時間
- 完整郵件內容

## 常見問題

### Q: 觸發器沒有反應？
A: 檢查觸發器是否正確設定，並確認郵件地址確實包含 `+vibe`

### Q: 權限被拒絕？
A: 重新執行授權流程，確保允許 Gmail 和 Drive 存取權限

### Q: PDF 格式異常？
A: 檢查郵件內容是否包含特殊字符，系統會自動處理大部分格式問題

### Q: 檔案沒有儲存到 Drive？
A: 確認 Google Drive 空間足夠，且帳戶有建立資料夾的權限

## 技術細節

- **Runtime**: Google Apps Script V8
- **API**: Gmail API v1, Drive API v3
- **觸發器**: Gmail 新郵件觸發器
- **檔案格式**: HTML → PDF 轉換

## 開發與修改

如需修改功能，主要函數說明：

- `processGmailMessages()` - 主要郵件處理函數
- `shouldProcessEmail()` - 郵件過濾邏輯
- `createPdfFromEmail()` - PDF 轉換功能
- `savePdfToDrive()` - Drive 儲存功能

## 授權聲明

此專案使用 Google Apps Script 平台，需要以下權限：
- Gmail 讀取權限
- Google Drive 檔案建立權限
- 觸發器建立權限

---

💡 **提示**: 建議定期檢查 `Vibe_Emails` 資料夾，整理不需要的檔案以節省 Drive 空間。