chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'startTimer') {
      startTimer();
    }
  });
  
  function startTimer() {
    chrome.storage.sync.get(['task', 'endTime'], (result) => {
      const intervalId = setInterval(() => {
        const currentTime = Date.now();
        if (currentTime >= result.endTime) {
          clearInterval(intervalId);
          alert('Time is up for your task: ' + result.task);
          chrome.storage.sync.remove(['task', 'endTime']);
        }
      }, 1000);
    });
  }
  
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
      chrome.storage.sync.get(['blockedSites'], (result) => {
        const blockedSites = result.blockedSites || [];
        for (const site of blockedSites) {
          if (changeInfo.url.includes(site)) {
            alert('You are accessing a blocked site! Timer stopped.');
            chrome.storage.sync.remove(['task', 'endTime']);
            break;
          }
        }
      });
    }
  });
  