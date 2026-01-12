const bypassCodeForDisplay = `
// Вставьте в консоль (F12) на windy.com

(function(){
    const s = document.createElement('script');
    s.src = 'https://cruitac345.github.io/WindyUnlocker/bypass.js?' + Date.now();
    document.head.appendChild(s);
    console.log('Loading Windy Bypass...');
})();`;

document.addEventListener('DOMContentLoaded', () => {
    const codeElement = document.getElementById('console-code');
    if (codeElement) {
        codeElement.textContent = bypassCodeForDisplay;
    }
    updateBookmarklet();
});

function copyCode() {
    navigator.clipboard.writeText(bypassCodeForDisplay).then(() => {
        showToast('✅ Код скопирован! Вставьте в консоль на windy.com');
    }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = bypassCodeForDisplay;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('✅ Код скопирован!');
    });
}

function downloadUserscript() {
    fetch('bypass.js?t=' + Date.now())
        .then(r => r.text())
        .then(bypassCode => {
            const userscript = `// ==UserScript==
// @name         Windy Premium Bypass
// @namespace    windy-bypass
// @version      1.0
// @description  Активация премиум функций Windy.com
// @author       Cruitac345
// @match        https://www.windy.com/*
// @match        https://*.windy.com/*
// @exclude      https://community.windy.com/*
// @exclude      https://account.windy.com/*
// @run-at       document-idle
// @grant        unsafeWindow
// @grant        GM_info
// @noframes
// ==/UserScript==

(function() {
    'use strict';
    
    const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
    
    console.log('[Tampermonkey] Windy Bypass initializing...');
    
    let attempts = 0;
    const maxAttempts = 40;
    
    function waitAndExecute() {
        attempts++;
        
        const ready = !!(
            win.W || 
            win.wt || 
            document.querySelector('.leaflet-container') ||
            document.querySelector('canvas')
        );
        
        if (ready || attempts >= maxAttempts) {
            console.log('[Tampermonkey] Windy ready, executing bypass...');
            
            const script = document.createElement('script');
            script.textContent = \`${bypassCode.replace(/`/g, '\\`').replace(/\${/g, '\\${')}\`;
            document.head.appendChild(script);
            
            setTimeout(() => script.remove(), 100);
        } else {
            setTimeout(waitAndExecute, 300);
        }
    }
    
    if (document.readyState === 'complete') {
        setTimeout(waitAndExecute, 500);
    } else {
        window.addEventListener('load', () => setTimeout(waitAndExecute, 1000));
    }
})();`;

            const blob = new Blob([userscript], {type: 'text/javascript'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'windy-premium-bypass.user.js';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showToast('Userscript скачан! Откройте файл для установки в Tampermonkey');
        })
        .catch(err => {
            console.error('Failed to load bypass.js:', err);
            showToast('❌ Ошибка загрузки. Попробуйте позже.');
        });
}

function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function updateBookmarklet() {
    const baseURL = window.location.origin + window.location.pathname.replace(/[^/]*$/, '');
    const bookmarkletCode = `javascript:(function(){if(!location.hostname.includes('windy.com')){alert('Откройте windy.com!');return;}var s=document.createElement('script');s.src='${baseURL}bypass.js?'+Date.now();document.head.appendChild(s);})();`;
    
    const bookmarkletLink = document.querySelector('.bookmarklet-btn');
    if (bookmarkletLink) {
        bookmarkletLink.href = bookmarkletCode;
    }
}

