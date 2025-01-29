document.addEventListener('DOMContentLoaded', function() {
  const exportButton = document.getElementById('exportButton');
  const statusDiv = document.getElementById('status');

  function showStatus(message, isError = false) {
    statusDiv.textContent = message;
    statusDiv.style.display = 'block';
    statusDiv.className = `status ${isError ? 'error' : 'success'}`;
  }

  exportButton.addEventListener('click', async () => {
    try {
      // Query for the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url.includes('www2.my.commbank.com.au')) {
        showStatus('Please navigate to CommBank transaction page first', true);
        return;
      }

      // Inject the content script
      exportButton.disabled = true;
      showStatus('Extracting transactions...');

      // Send message to content script to extract transactions
      chrome.tabs.sendMessage(tab.id, { action: 'extractTransactions' }, response => {
        if (chrome.runtime.lastError) {
          showStatus('Error: Could not extract transactions', true);
          exportButton.disabled = false;
          return;
        }

        if (response.error) {
          showStatus(`Error: ${response.error}`, true);
          exportButton.disabled = false;
          return;
        }

        // Send transactions to background script for QFX generation and download
        chrome.runtime.sendMessage({
          action: 'generateAndDownloadQFX',
          transactions: response.transactions,
        }, response => {
          if (chrome.runtime.lastError || response.error) {
            showStatus('Error saving file', true);
          } else {
            showStatus('Transactions exported successfully!');
          }
          exportButton.disabled = false;
        });
      });
    } catch (error) {
      showStatus(`Error: ${error.message}`, true);
      exportButton.disabled = false;
    }
  });
}); 