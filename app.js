const bypassCode = `
// Вставьте в консоль (F12) на windy.com

(function() {
    'use strict';
    
    if (!location.hostname.includes('windy.com')) {
        alert('Откройте windy.com!');
        return;
    }
    
    console.log('🌪️ Windy Bypass Loading...');
    
    const origFetch = window.fetch;
    window.fetch = function(...args) {
        const url = String(args[0] || '');
        if (/paddle|stripe|analytics|subscription|premium-check/i.test(url)) {
            console.log('🚫 Blocked:', url.slice(0, 50));
            return Promise.resolve(new Response(JSON.stringify({premium: true, status: 'active'})));
        }
        return origFetch.apply(this, args);
    };
    
    const hackStore = (store) => {
        if (!store?.get) return;
        const origGet = store.get.bind(store);
        store.get = (key) => {
            if (/premium|subscription/i.test(key)) {
                return key.includes('Info') ? {isPremium: true, tier: 'premium', status: 'active'} : 'premium';
            }
            return origGet(key);
        };
    };
    
    [window.wt, window.W?.store, window.W?.wt].forEach(hackStore);
    
    const style = document.createElement('style');
    style.textContent = \\\`
        .premium-overlay, .paywall, [class*="premium-lock"], .subscription-required { display: none !important; }
        canvas, [class*="layer"] { visibility: visible !important; opacity: 1 !important; }
        .day.premium, .day.locked { opacity: 1 !important; pointer-events: auto !important; }
        .blurred { filter: none !important; }
    \\\`;
    document.head.appendChild(style);
    
    setInterval(() => {
        document.querySelectorAll('.day.premium, .day.locked').forEach(d => {
            d.classList.remove('premium', 'locked');
            d.style.opacity = '1';
            d.style.pointerEvents = 'auto';
        });
    }, 2000);
    
    const n = document.createElement('div');
    n.innerHTML = '🌪️ Premium Activated!';
    n.style.cssText = 'position:fixed;top:20px;right:20px;background:#4CAF50;color:#fff;padding:15px 25px;border-radius:10px;z-index:99999;font-weight:bold;box-shadow:0 4px 15px rgba(0,0,0,0.3);';
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
    updateBookmarklet();
});

function copyCode() {
    navigator.clipboard.writeText(bypassCode).then(() => {
        showToast('✅ Код скопирован!');
    }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = bypassCode;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('✅ Код скопирован!');
    });
}

function downloadUserscript() {
    const userscript = `// ==UserScript==
// @name         Windy Premium Bypass
// @namespace    windy-bypass
// @version      1.0
// @description  Активация премиум функций Windy.com
// @author       Cruitac345
// @match        https://www.windy.com/*
// @match        https://*.windy.com/*
// @run-at       document-idle
// @grant        unsafeWindow
// @noframes
// ==/UserScript==

(function() {
    'use strict';
    
    // Используем unsafeWindow для доступа к объектам сайта
    const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
    
    console.log('🌪️ Windy Bypass: Waiting for app...');
    
    let attempts = 0;
    const maxAttempts = 30;
    
    function waitForWindy() {
        attempts++;
        
        if (win.W || win.wt || document.querySelector('.leaflet-container')) {
            console.log('🌪️ Windy detected, activating bypass...');
            setTimeout(executeBypass, 1000);
            return;
        }
        
        if (attempts < maxAttempts) {
            setTimeout(waitForWindy, 500);
        } else {
            console.log('🌪️ Timeout, forcing bypass...');
            executeBypass();
        }
    }
    
    function executeBypass() {
        console.log('🚀 Executing Windy Premium Bypass...');
        
        const origFetch = win.fetch;
        win.fetch = function(...args) {
            const url = String(args[0] || '');
            const blocked = ['paddle', 'stripe', 'analytics', 'subscription', 'premium-check', 'paypal'];
            
            if (blocked.some(p => url.toLowerCase().includes(p))) {
                console.log('🚫 Blocked:', url.slice(0, 60));
                return Promise.resolve(new Response(
                    JSON.stringify({premium: true, status: 'active', success: true}),
                    {status: 200, headers: {'Content-Type': 'application/json'}}
                ));
            }
            return origFetch.apply(this, args);
        };
        
        function hackStore(store) {
            if (!store || typeof store.get !== 'function') return false;
            
            try {
                const origGet = store.get.bind(store);
                store.get = function(key) {
                    if (/premium|subscription|isPremium|userType|tier/i.test(key)) {
                        console.log('🔓 Premium key:', key);
                        if (/Info|subscription$/i.test(key)) {
                            return {
                                isSubscription: true,
                                isPremium: true,
                                tier: 'premium',
                                status: 'active',
                                state: 'active',
                                validUntil: '2099-12-31'
                            };
                        }
                        return 'premium';
                    }
                    return origGet(key);
                };
                
                if (typeof store.set === 'function') {
                    const origSet = store.set.bind(store);
                    store.set = function(key, value) {
                        if (/premium|subscription/i.test(key)) {
                            console.log('🛡️ Blocked set:', key);
                            return;
                        }
                        return origSet(key, value);
                    };
                }
                
                return true;
            } catch(e) {
                return false;
            }
        }
        
        const stores = [win.wt, win.W?.store, win.W?.wt, win.store];
        let hacked = false;
        stores.forEach(store => {
            if (hackStore(store)) {
                hacked = true;
                console.log('✅ Store hacked');
            }
        });
        
        win.isPremium = true;
        win.isSubscribed = true;
        if (win.W) {
            win.W.isPremium = true;
            win.W.premium = true;
        }
        
        const style = document.createElement('style');
        style.id = 'windy-bypass-styles';
        style.textContent = \`
            .premium-overlay, 
            .paywall, 
            [class*="premium-lock"],
            .subscription-required,
            .upgrade-prompt,
            [class*="subscribe-"],
            [class*="paywall"] {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
            }
            
            canvas, 
            .leaflet-layer, 
            [class*="layer"],
            [class*="overlay-layer"] {
                visibility: visible !important;
                opacity: 1 !important;
            }
            
            .day.premium, 
            .day.locked,
            [class*="day"][class*="premium"],
            [class*="day"][class*="locked"] {
                opacity: 1 !important;
                pointer-events: auto !important;
                filter: none !important;
            }
            
            .blurred, 
            [class*="blur"]:not(.blur-effect) {
                filter: none !important;
                -webkit-filter: none !important;
            }
            
            .locked, 
            .disabled:not(button[disabled]) {
                pointer-events: auto !important;
                opacity: 1 !important;
            }
        \`;
        document.head.appendChild(style);
        
        function unlockCalendar() {
            document.querySelectorAll('.day.premium, .day.locked, [class*="day"][class*="locked"]').forEach(day => {
                day.classList.remove('premium', 'locked', 'disabled');
                day.style.opacity = '1';
                day.style.pointerEvents = 'auto';
                day.removeAttribute('disabled');
            });
        }
        
        unlockCalendar();
        setInterval(unlockCalendar, 2000);
        
        function removeBlockers() {
            const selectors = [
                '.premium-overlay',
                '.paywall',
                '[class*="premium-lock"]',
                '.subscription-required',
                '.upgrade-modal',
                '[class*="subscribe-prompt"]'
            ];
            
            selectors.forEach(sel => {
                document.querySelectorAll(sel).forEach(el => el.remove());
            });
        }
        
        removeBlockers();
        
        const observer = new MutationObserver(() => {
            removeBlockers();
            unlockCalendar();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        setTimeout(() => {
            const timelapse = win.W?.timelapse || win.timelapse;
            if (timelapse) {
                timelapse._isPremium = true;
                timelapse.hourlyEnabled = true;
                if (typeof timelapse.setMode === 'function') {
                    try { timelapse.setMode('hourly'); } catch(e) {}
                }
            }
        }, 2000);
        
        const notification = document.createElement('div');
        notification.innerHTML = \`
            <div style="display:flex;align-items:center;gap:10px;">
                <span style="font-size:24px;"></span>
                <div>
                    <div style="font-weight:bold;">Windy Premium Bypass</div>
                    <div style="font-size:12px;opacity:0.9;">Все функции активированы!</div>
                </div>
            </div>
        \`;
        notification.style.cssText = \`
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            padding: 15px 20px;
            border-radius: 12px;
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        \`;
        
        const styleAnim = document.createElement('style');
        styleAnim.textContent = \`
            @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
        \`;
        document.head.appendChild(styleAnim);
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
        
        console.log(\`
╔══════════════════════════════════════╗
║   WINDY PREMIUM BYPASS ACTIVE        ║
╠══════════════════════════════════════╣
║ ✓ 10-дневный прогноз                ║
║ ✓ Почасовой режим                   ║
║ ✓ Все слои карты                    ║
║ ✓ Без рекламы                       ║
╚══════════════════════════════════════╝
        \`);
    }
    
    // Запуск
    if (document.readyState === 'complete') {
        waitForWindy();
    } else {
        window.addEventListener('load', waitForWindy);
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
    
    showToast('Userscript скачан! Установите в Tampermonkey');
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
    const bookmarkletCode = `javascript:(function(){if(!location.hostname.includes('windy.com')){alert('Откройте windy.com!');return;}const s=document.createElement('script');s.src='https://cruitac345.github.io/WindyUnlocker/bypass.js?'+Date.now();document.head.appendChild(s);})();`;
    
    const bookmarkletLink = document.querySelector('.bookmarklet-btn');
    if (bookmarkletLink) {
        bookmarkletLink.href = bookmarkletCode;
    }
}
