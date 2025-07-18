function onInstall() {
  createEmailTrigger();
}

function createEmailTrigger() {
  // 刪除現有的 Gmail 觸發器
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getEventType() === ScriptApp.EventType.ON_FORM_SUBMIT) {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // 由於 Gmail 觸發器已被棄用，改用時間觸發器定期檢查
  const trigger = ScriptApp.newTrigger('processGmailMessages')
    .timeBased()
    .everyMinutes(5)
    .create();
  
  console.log('Time-based trigger created with ID:', trigger.getUniqueId());
  console.log('Will check for +vibe emails every 5 minutes');
}

function processGmailMessages(e) {
  try {
    const threads = GmailApp.getInboxThreads(0, 10);
    
    for (const thread of threads) {
      const messages = thread.getMessages();
      
      for (const message of messages) {
        if (message.isUnread() && shouldProcessEmail(message)) {
          processVibeEmail(message);
          message.markRead();
        }
      }
    }
  } catch (error) {
    console.error('處理郵件時發生錯誤:', error);
  }
}

function shouldProcessEmail(message) {
  const toAddress = message.getTo();
  const ccAddress = message.getCc();
  const bccAddress = message.getBcc();
  
  const allAddresses = [toAddress, ccAddress, bccAddress].join(' ');
  
  // 檢查是否包含任何標籤（+後面跟著字母）
  const tagRegex = /\+([a-zA-Z0-9]+)/g;
  const matches = allAddresses.match(tagRegex);
  
  return matches && matches.length > 0;
}

function getEmailTag(message) {
  const toAddress = message.getTo();
  const ccAddress = message.getCc();
  const bccAddress = message.getBcc();
  
  const allAddresses = [toAddress, ccAddress, bccAddress].join(' ');
  
  // 抓取第一個標籤
  const tagRegex = /\+([a-zA-Z0-9]+)/;
  const match = allAddresses.match(tagRegex);
  
  return match ? match[1] : 'default';
}

function processVibeEmail(message) {
  try {
    const tag = getEmailTag(message);
    console.log('處理標籤郵件:', tag, '主旨:', message.getSubject());
    
    const pdfBlob = createPdfFromEmail(message);
    
    savePdfToDrive(pdfBlob, message, tag);
    
    console.log('郵件處理完成');
  } catch (error) {
    console.error('處理標籤郵件時發生錯誤:', error);
  }
}

function createPdfFromEmail(message) {
  try {
    const subject = message.getSubject() || '無主題';
    const date = Utilities.formatDate(message.getDate(), 'Asia/Taipei', 'yyyy-MM-dd HH:mm:ss');
    const from = message.getFrom();
    const to = message.getTo();
    const body = message.getPlainBody() || message.getBody();
    
    const htmlContent = `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { border-bottom: 2px solid #ccc; padding-bottom: 10px; margin-bottom: 20px; }
            .field { margin: 5px 0; }
            .label { font-weight: bold; }
            .content { margin-top: 20px; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>郵件內容</h2>
          </div>
          <div class="field">
            <span class="label">主旨:</span> ${subject}
          </div>
          <div class="field">
            <span class="label">寄件者:</span> ${from}
          </div>
          <div class="field">
            <span class="label">收件者:</span> ${to}
          </div>
          <div class="field">
            <span class="label">日期:</span> ${date}
          </div>
          <div class="content">
            <div class="label">內容:</div>
            <div>${body.replace(/\n/g, '<br>')}</div>
          </div>
        </body>
      </html>
    `;
    
    const pdfBlob = Utilities.newBlob(htmlContent, 'text/html', 'email.html')
      .getAs('application/pdf');
    
    return pdfBlob;
  } catch (error) {
    console.error('建立 PDF 時發生錯誤:', error);
    throw error;
  }
}

function savePdfToDrive(pdfBlob, message, tag) {
  try {
    const subject = message.getSubject() || '無主題';
    const date = Utilities.formatDate(message.getDate(), 'Asia/Taipei', 'yyyy-MM-dd_HH-mm-ss');
    
    const fileName = `[${tag}]_${subject}_${date}.pdf`;
    
    const safeFileName = fileName.replace(/[\\/:*?"<>|]/g, '_');
    
    // 根據標籤建立不同的資料夾
    const folderName = `Email_${tag}`;
    let targetFolder;
    const folders = DriveApp.getFoldersByName(folderName);
    if (folders.hasNext()) {
      targetFolder = folders.next();
    } else {
      targetFolder = DriveApp.createFolder(folderName);
    }
    
    const file = targetFolder.createFile(pdfBlob.setName(safeFileName));
    
    console.log('PDF 已儲存:', file.getName());
    console.log('檔案 ID:', file.getId());
    console.log('資料夾:', targetFolder.getName());
    console.log('標籤:', tag);
    
    return file;
  } catch (error) {
    console.error('儲存到 Drive 時發生錯誤:', error);
    throw error;
  }
}


function testFunction() {
  console.log('測試函數 - 檢查最近的郵件');
  
  const threads = GmailApp.getInboxThreads(0, 5);
  console.log('找到', threads.length, '個對話');
  
  for (const thread of threads) {
    const messages = thread.getMessages();
    console.log('對話主題:', thread.getFirstMessageSubject());
    
    for (const message of messages) {
      const toAddress = message.getTo();
      console.log('收件者:', toAddress);
      
      if (shouldProcessEmail(message)) {
        const tag = getEmailTag(message);
        console.log('發現標籤:', tag);
        console.log('會儲存到資料夾:', `Email_${tag}`);
        console.log('郵件是否未讀:', message.isUnread());
        
        if (message.isUnread()) {
          console.log('✅ 符合處理條件');
        } else {
          console.log('❌ 郵件已讀，會被跳過');
        }
      } else {
        console.log('無標籤，跳過');
      }
    }
  }
}

function forceProcessTestEmail() {
  console.log('強制處理測試 - 處理已讀的 +vibe 郵件');
  
  const threads = GmailApp.getInboxThreads(0, 10);
  
  for (const thread of threads) {
    const messages = thread.getMessages();
    
    for (const message of messages) {
      if (shouldProcessEmail(message)) {
        const tag = getEmailTag(message);
        console.log('找到標籤郵件:', tag, message.getSubject());
        
        try {
          processVibeEmail(message);
          console.log('✅ 強制處理完成');
          return; // 只處理第一封找到的
        } catch (error) {
          console.error('處理失敗:', error);
        }
      }
    }
  }
  
  console.log('沒有找到標籤郵件');
}