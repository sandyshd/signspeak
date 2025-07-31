// SignSpeak POC Application
console.log('SignSpeak POC Application Starting...');

// Initialize the application
function initApp() {
    console.log('Initializing SignSpeak POC');
    
    // Add any initialization logic here
    const appElement = document.getElementById('app');
    if (appElement) {
        console.log('App container found');
    }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
