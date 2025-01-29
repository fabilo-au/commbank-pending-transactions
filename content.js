// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractTransactions') {
    try {
      // Check if we're on the right page
      if (!window.location.href.includes('TransactionHistory')) {
        throw new Error('Please navigate to the Transaction History page');
      }

      // Wait for table to be available
      const tableBody = document.getElementById('transactionsTableBody');
      if (!tableBody) {
        throw new Error('Transaction table not found - Please ensure you are on the transaction history page');
      }

      const transactions = extractTransactions();
      sendResponse({ transactions });
    } catch (error) {
      console.error('Transaction extraction error:', error);
      sendResponse({ error: error.message });
    }
  }
  return true; // Keep the message channel open for async response
});

function extractTransactions() {
  // Find the transaction table body
  const tableBody = document.getElementById('transactionsTableBody');
  if (!tableBody) {
    console.error('Table body not found');
    throw new Error('Transaction table not found');
  }

  // Get all pending transaction rows (excluding the header)
  const pendingRows = tableBody.querySelectorAll('tr:not(.pending_header)');
  if (!pendingRows.length) {
    throw new Error('No pending transactions found - Please check if you have any pending transactions');
  }

  return Array.from(pendingRows).map((row, index) => {
    try {
      // Extract date
      const dateCell = row.querySelector('td.date');
      if (!dateCell) throw new Error('Date cell not found');
      
      const dateMatch = dateCell.textContent.match(/(\d{1,2}\s+[A-Za-z]+\s+\d{4})/);
      if (!dateMatch) throw new Error('Invalid date format');
      const date = dateMatch[1].trim();

      // Extract description
      const descriptionElement = row.querySelector('td.arrow .merchant');
      if (!descriptionElement) throw new Error('Description element not found');
      
      const rawDescription = descriptionElement.textContent.trim();
      const description = rawDescription
        .replace(/Open transaction details/, '')
        .replace(/^PENDING\s*-\s*/, '')
        .trim();

      // Extract amount
      const amountElement = row.querySelector('td.amount .currencyUI');
      if (!amountElement) throw new Error('Amount element not found');
      
      // Get the text content of the amount, including any nested elements
      const amountText = Array.from(amountElement.childNodes)
        .map(node => node.textContent || '')
        .join('')
        .trim();
      
      // Clean up the amount text
      const cleanAmount = amountText
        .replace(/[,$\s]/g, '') // Remove currency symbol, commas, and spaces
        .replace(/^(-?).*?(\d+\.\d{2}).*$/, '$1$2'); // Extract amount with sign
      
      const amount = parseFloat(cleanAmount || '0');
      if (isNaN(amount)) throw new Error('Invalid amount format');

      // Determine transaction type
      const isDebit = amount < 0 || (row.querySelector('td.debit') && row.querySelector('td.debit').textContent.trim() !== '');

      return {
        date,
        description,
        amount: Math.abs(amount),
        type: isDebit ? 'DEBIT' : 'CREDIT'
      };
    } catch (error) {
      console.log(`Error processing row ${index + 1}:`, error);
      return null;
    }
  });
} 
