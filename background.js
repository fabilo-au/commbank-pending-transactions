chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'generateAndDownloadQFX') {
    try {
      if (!request.transactions || !Array.isArray(request.transactions)) {
        throw new Error('Invalid transaction data received');
      }

      const qfxContent = generateQFX(request.transactions);
      
      // Convert QFX content to a data URL
      const dataUrl = 'data:application/x-ofx;base64,' + btoa(unescape(encodeURIComponent(qfxContent)));
      
      // Download the file
      chrome.downloads.download({
        url: dataUrl,
        filename: 'transactions.ofx',
        saveAs: true
      }, (downloadId) => {
        const lastError = chrome.runtime.lastError;
        if (lastError) {
          console.error('Download error:', lastError);
          sendResponse({ error: lastError.message });
        } else {
          sendResponse({ success: true });
        }
      });
      
      return true; // Keep the message channel open for async response
    } catch (error) {
      console.error('Error in background script:', error);
      sendResponse({ error: error.message });
    }
  }
});

function generateQFX(transactions) {
  const currentDate = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
  const currentDateShort = currentDate.substring(0, 8); // YYYYMMDD format
  
  const header = `OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
ENCODING:USASCII
CHARSET:1252
COMPRESSION:NONE
OLDFILEUID:NONE
NEWFILEUID:NONE
<OFX>
<SIGNONMSGSRSV1>
<SONRS>
<STATUS>
<CODE>0
<SEVERITY>INFO
</STATUS>
<DTSERVER>${currentDate}
<LANGUAGE>ENG
</SONRS>
</SIGNONMSGSRSV1>
<CREDITCARDMSGSRSV1>
<CCSTMTTRNRS>
<TRNUID>1
<STATUS>
<CODE>0
<SEVERITY>INFO
</STATUS>
<CCSTMTRS>
<CURDEF>AUD
<CCACCTFROM>
<ACCTID>PENDING
</CCACCTFROM>
<BANKTRANLIST>
<DTSTART>${currentDateShort}
<DTEND>${currentDateShort}`;

  const transactionsQFX = transactions.map(transaction => {
    if (!transaction) return '';
    
    // Parse the date string to create a proper date object
    const dateParts = transaction.date.split(' ');
    const monthMap = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
      'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };
    
    const day = dateParts[0].padStart(2, '0');
    const month = monthMap[dateParts[1]];
    const year = dateParts[2];
    const formattedDate = `${year}${month}${day}`;
    
    return `
<STMTTRN>
<TRNTYPE>${transaction.type}
<DTPOSTED>${formattedDate}
<DTUSER>${formattedDate}
<TRNAMT>${transaction.type === 'DEBIT' ? '-' : ''}${transaction.amount.toFixed(2)}
<FITID>
<MEMO>${escapeXML(transaction.description)}
</STMTTRN>`;
  }).join('');

  const footer = `
</BANKTRANLIST>
<LEDGERBAL>
<BALAMT>0.00
<DTASOF>${currentDate}
</LEDGERBAL>
<AVAILBAL>
<BALAMT>0.00
<DTASOF>${currentDate}
</AVAILBAL>
</CCSTMTRS>
</CCSTMTTRNRS>
</CREDITCARDMSGSRSV1>
</OFX>`;

  return header + transactionsQFX + footer;
}

function escapeXML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
} 
