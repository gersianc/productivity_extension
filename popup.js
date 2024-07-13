document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task');
    const timeInput = document.getElementById('time');
    const startTimerButton = document.getElementById('startTimer');
    const blockedSiteInput = document.getElementById('blockedSite');
    const addBlockedSiteButton = document.getElementById('addBlockedSite');
    const blockList = document.getElementById('blockList');
    const remainingTimeDisplay = document.getElementById('remainingTime');
  
    // Load blocked sites from storage
    chrome.storage.sync.get(['blockedSites'], (result) => {
      if (result.blockedSites) {
        result.blockedSites.forEach(site => {
          addBlockedSiteToList(site);
        });
      }
    });
  
    // Load and display remaining time
    chrome.storage.sync.get(['task', 'endTime'], (result) => {
      if (result.task) {
        taskInput.value = result.task;
      }
      if (result.endTime) {
        updateRemainingTime(result.endTime);
        setInterval(() => {
          updateRemainingTime(result.endTime);
        }, 1000);
      }
    });
  
    startTimerButton.addEventListener('click', () => {
      const task = taskInput.value;
      const time = parseInt(timeInput.value);
  
      if (task && time) {
        const endTime = Date.now() + time * 60 * 1000;
        chrome.storage.sync.set({ task, endTime });
        updateRemainingTime(endTime);
        setInterval(() => {
          updateRemainingTime(endTime);
        }, 1000);
        window.close();
      }
    });
  
    addBlockedSiteButton.addEventListener('click', () => {
      const site = blockedSiteInput.value;
      if (site) {
        chrome.storage.sync.get(['blockedSites'], (result) => {
          const blockedSites = result.blockedSites || [];
          if (!blockedSites.includes(site)) {
            blockedSites.push(site);
            chrome.storage.sync.set({ blockedSites });
            addBlockedSiteToList(site);
            blockedSiteInput.value = '';
          }
        });
      }
    });
  
    function addBlockedSiteToList(site) {
      const li = document.createElement('li');
      li.textContent = site;
      blockList.appendChild(li);
    }
  
    function updateRemainingTime(endTime) {
      const currentTime = Date.now();
      const remainingTime = Math.max(0, endTime - currentTime);
      const minutes = Math.floor(remainingTime / 1000 / 60);
      const seconds = Math.floor((remainingTime / 1000) % 60);
      remainingTimeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      if (remainingTime <= 0) {
        clearInterval();
        chrome.storage.sync.remove(['task', 'endTime']);
      }
    }
  });
  