function onInstall() {
  createEmailTrigger();
}

function createEmailTrigger() {
  const trigger = ScriptApp.newGmailTrigger().create();
  console.log('Gmail trigger created with ID:', trigger.getUniqueId());
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
  
  return allAddresses.includes('+vibe');
}

function processVibeEmail(message) {
  try {
    console.log('處理 +vibe 郵件:', message.getSubject());
    
    const pdfBlob = createPdfFromEmail(message);
    
    savePdfToDrive(pdfBlob, message);
    
    console.log('郵件處理完成');
  } catch (error) {
    console.error('處理 vibe 郵件時發生錯誤:', error);
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

function savePdfToDrive(pdfBlob, message) {
  try {
    const subject = message.getSubject() || '無主題';
    const date = Utilities.formatDate(message.getDate(), 'Asia/Taipei', 'yyyy-MM-dd_HH-mm-ss');
    
    const fileName = `[Vibe]_${subject}_${date}.pdf`;
    
    const safeFileName = fileName.replace(/[\\/:*?"<>|]/g, '_');
    
    let vibeFolder;
    const folders = DriveApp.getFoldersByName('Vibe_Emails');
    if (folders.hasNext()) {
      vibeFolder = folders.next();
    } else {
      vibeFolder = DriveApp.createFolder('Vibe_Emails');
    }
    
    const file = vibeFolder.createFile(pdfBlob.setName(safeFileName));
    
    console.log('PDF 已儲存:', file.getName());
    console.log('檔案 ID:', file.getId());
    console.log('資料夾:', vibeFolder.getName());
    
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
      console.log('是否包含 +vibe:', toAddress.includes('+vibe'));
    }
  }
}