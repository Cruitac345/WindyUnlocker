// Полный код bypass.js для копирования
const bypassCode = `// === WINDY PREMIUM BYPASS ===
// Скопируйте этот код и вставьте в консоль браузера (F12) на windy.com

(function() {
    'use strict';
    
    if (!window.location.hostname.includes('windy.com')) {
        alert('Откройте windy.com и запустите снова!');
        return;
    }
    
    console.log('🌪️ Windy Bypass Loading...');
    
    // Request blocking
    const origFetch = window.fetch;
    window.fetch = function(...args) {
        const url = args[0];
        if (typeof url === 'string') {
            if (['paddle', 'stripe', 'analytics', 'subscription'].some(p => url.includes(p))) {
                return Promise.resolve(new Response(JSON.stringify({premium: true})));
            }
        }
        return origFetch.apply(this, args);
    };
    
    // Subscription hack
    const stores = [window.wt, window.W?.store];
    stores.forEach(store => {
        if (store?.get) {
            const orig = store.get;
            store.get = function(k) {
                if (k.includes('premium') || k.includes('subscription')) return 'premium';
                return orig.call(this, k);
            };
        }
    });
    
    // CSS unlock
    const style = document.createElement('style');
    style.textContent = \`
        .premium-overlay, .paywall, [class*="premium-lock"] { display: none !important; }
        canvas, [class*="layer"] { visibility: visible !important; opacity: 1 !important; }
        .day.premium, .day.locked { opacity: 1 !important; pointer-events: auto !important; }
    \`;
    document.head.appendChild(style);
    
    // Calendar hack
    setInterval(() => {
        document.querySelectorAll('.day.premium, .day.locked').forEach(d => {
            d.classList.remove('premium', 'locked');
        });
    }, 2000);
    
    // Notification
    const n = document.createElement('div');
    n.innerHTML = '🌪️ Premium Activated!';
    n.style.cssText = 'position:fixed;top:20px;right:20px;background:#4CAF50;color:#fff;padding:15px 25px;border-radius:10px;z-index:99999;font-family:Arial;font-weight:bold;box-shadow:0 4px 15px rgba(0,0,0,0.3);';
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 4000);
    
    console.log('✅ Windy Premium Bypass Active!');
})();`;

// Показываем код на странице
document.addEventListener('DOMContentLoaded', () => {
    const codeElement = document.getElementById('console-code');
    if (codeElement) {
        codeElement.textContent = bypassCode;
    }
});

// Копирование кода
function copyCode() {
    navigator.clipboard.writeText(bypassCode).then(() => {
        showToast('✅ Код скопирован!');
    }).catch(err => {
        // Fallback для старых браузеров
        const textarea = document.createElement('textarea');
        textarea.value = bypassCode;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('✅ Код скопирован!');
    });
}

// Скачивание userscript
function downloadUserscript() {
    const userscript = `// ==UserScript==
// @name         Windy Premium Bypass
// @namespace    https://github.com/YOUR_USERNAME/windy-bypass
// @version      2.0
// @description  Активация премиум функций Windy.com
// @author       Your Name
// @match        https://www.windy.com/*
// @match        https://windy.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

${bypassCode}`;

    const blob = new Blob([userscript], {type: 'text/javascript'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'windy-premium-bypass.user.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('📥 Userscript скачан! Установите в Tampermonkey');
}

// Toast уведомление
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

// Обновляем букмарклет с правильным URL
function updateBookmarklet() {
    const currentURL = window.location.origin + window.location.pathname.replace('index.html', '');
    const bookmarkletLink = document.querySelector('.bookmarklet-btn');
    if (bookmarkletLink) {
        bookmarkletLink.href = `javascript:(function(){const s=document.createElement('script');s.src='${currentURL}bypass.js?t='+Date.now();document.head.appendChild(s);})();`;
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', updateBookmarklet);