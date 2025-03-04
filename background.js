
chrome.alarms.create('keep-alive', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener(() => {});

// Function to create offscreen document for audio playback
function createSoundHtml() {
  chrome.offscreen.createDocument({
    url: chrome.runtime.getURL('audio.html'),
    reasons: ['AUDIO_PLAYBACK'],
    justification: 'notification',
  });
}

// URL monitoring with trigger word check
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.status === 'complete' && tab.url) {
    chrome.storage.local.get(['triggerWords'], (result) => {
      const triggerWords = result.triggerWords || [];
      const currentUrl = tab.url.toLowerCase();
      
      triggerWords.forEach(word => {
        if (currentUrl.includes(word.toLowerCase())) {
          try {
            // Create notification
            chrome.notifications.create('trigger-word-notification', {
              type: 'basic',
              iconUrl: 'icon.png',
              title: 'Trigger Word Detected',
              message: `Trigger word detected: ${word}`
            }, (notificationId) => {
              if (chrome.runtime.lastError) {
                console.error('Notification failed:', chrome.runtime.lastError);
              } else {
                console.log('Notification shown with ID:', notificationId);
              }
            });

            // Play alarm sound 
            createSoundHtml();

            console.log('Trigger word detected:', word);
          } catch (error) {
            console.error('Notification failed:', error);
          }
        }
      });
    });
  }
});