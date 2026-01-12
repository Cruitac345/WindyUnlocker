(function() {
    'use strict';
    
    if (!location.hostname.includes('windy.com')) {
        alert('⚠️ Откройте windy.com и запустите снова!');
        return;
    }
    
    if (window.__windyBypassActive) {
        console.log('⚠️ Bypass already active');
        return;
    }
    window.__windyBypassActive = true;
    
    console.log('Windy Premium Bypass v1.0 Starting...');
    
    function setupRequestBlocking() {
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            const url = args[0];
            
            if (typeof url === 'string') {
                if (url.includes('detail2') || url.includes('12do-detail2') || 
                    url.includes('forecast') || url.includes('weather') ||
                    url.includes('node') || url.includes('tile')) {
                    console.log('✅ Data request allowed:', url.substring(0, 60));
                    return originalFetch.apply(this, args);
                }
                
                const blocked = [
                    'paddle.com', 'stripe.com', 'paypal.com',
                    'analytics', 'subscription', 'premium-check',
                    'google-analytics', 'gtm', 'hotjar',
                    'facebook', 'doubleclick', 'googlesyndication',
                    'adservice', 'tracking'
                ];
                
                if (blocked.some(p => url.toLowerCase().includes(p))) {
                    console.log('🚫 Blocked:', url.substring(0, 50));
                    return Promise.resolve(new Response(
                        JSON.stringify({success: true, premium: true, status: 'active'}),
                        {status: 200, headers: {'Content-Type': 'application/json'}}
                    ));
                }
            }
            return originalFetch.apply(this, args);
        };
        
        const originalOpen = XMLHttpRequest.prototype.open;
        const originalSend = XMLHttpRequest.prototype.send;
        
        XMLHttpRequest.prototype.open = function(method, url, ...rest) {
            this._url = url;
            return originalOpen.apply(this, [method, url, ...rest]);
        };
        
        XMLHttpRequest.prototype.send = function(...args) {
            if (this._url && typeof this._url === 'string') {
                const blockedPatterns = ['subscription', 'premium-status', 'payment', 'analytics'];
                if (blockedPatterns.some(p => this._url.includes(p))) {
                    console.log('🚫 XHR Blocked:', this._url.substring(0, 50));
                    Object.defineProperty(this, 'responseText', {
                        value: JSON.stringify({premium: true, status: 'active'})
                    });
                    Object.defineProperty(this, 'status', {value: 200});
                    return;
                }
            }
            return originalSend.apply(this, args);
        };
        
        console.log('✅ Request blocking active');
    }
    
    function hackSubscriptionSystem() {
        const storeObjects = [window.wt, window.W?.store, window.store, window.W?.wt];
        
        for (let store of storeObjects) {
            if (store && typeof store.get === 'function') {
                const originalGet = store.get.bind(store);
                store.get = function(key) {
                    const premiumKeys = ['subscription', 'premium', 'subscriptionInfo', 
                                        'isPremium', 'userType', 'tier', 'plan',
                                        'account', 'user'];
                    
                    if (premiumKeys.some(k => key.toLowerCase().includes(k.toLowerCase()))) {
                        console.log('Premium key intercepted:', key);
                        
                        if (key === 'subscriptionInfo' || key === 'subscription') {
                            return {
                                isSubscription: true,
                                isPremium: true,
                                tier: 'premium',
                                state: 'active',
                                status: 'active',
                                plan: 'premium',
                                validUntil: new Date(2099, 11, 31).toISOString(),
                                expiresAt: new Date(2099, 11, 31).toISOString()
                            };
                        }
                        if (key === 'isPremium' || key === 'premium') {
                            return true;
                        }
                        return 'premium';
                    }
                    return originalGet(key);
                };
                
                if (typeof store.set === 'function') {
                    const originalSet = store.set.bind(store);
                    store.set = function(key, value) {
                        if (key.includes('premium') || key.includes('subscription')) {
                            console.log('Prevented premium reset:', key);
                            return;
                        }
                        return originalSet(key, value);
                    };
                }
                
                if (typeof store.on === 'function') {
                    const originalOn = store.on.bind(store);
                    store.on = function(event, callback) {
                        if (event.includes('premium') || event.includes('subscription')) {
                            return originalOn(event, () => callback({premium: true, status: 'active'}));
                        }
                        return originalOn(event, callback);
                    };
                }
                
                console.log('✅ Store hijacked');
                break;
            }
        }
        
        if (!window.wt) {
            window.wt = {
                get: (key) => {
                    if (key.includes('premium') || key.includes('subscription')) {
                        return key.includes('Info') ? {isPremium: true, status: 'active'} : 'premium';
                    }
                    return null;
                },
                set: () => true,
                on: () => {},
                off: () => {},
                emit: () => {}
            };
        }
        
        window.isPremium = true;
        window.isSubscribed = true;
        window.premiumUser = true;
        window.hasPremium = true;
        
        if (window.W) {
            window.W.isPremium = true;
            window.W.premium = true;
            window.W.hasPremium = true;
        }
        
        const checkFunctions = ['Dr', 'Mr', 'Pr', 'Lr', 'Kr', 'isPremium', 'checkPremium', 
                                'validateSubscription', 'isSubscribed', 'getPremiumStatus'];
        checkFunctions.forEach(fn => {
            if (typeof window[fn] === 'function') {
                const orig = window[fn];
                window[fn] = function(...args) {
                    const result = orig.apply(this, args);
                    if (result === false || result === null || result === undefined) {
                        return true;
                    }
                    return result;
                };
                console.log('✅ Bypassed check function:', fn);
            }
        });
        
        console.log('✅ Subscription system hacked');
    }
    
    function unlockMapLayers() {
        const style = document.createElement('style');
        style.id = 'windy-bypass-styles';
        style.textContent = `
            canvas, 
            .leaflet-layer, 
            .leaflet-tile-pane,
            .wind-layer, 
            .temp-layer, 
            .rain-layer, 
            .cloud-layer, 
            .weather-layer,
            .particle-layer,
            [class*="layer"], 
            [class*="overlay"],
            [class*="tile"] {
                visibility: visible !important;
                opacity: 1 !important;
                display: block !important;
            }
            
            .premium-overlay, 
            .gray-overlay, 
            .locked-overlay,
            .subscription-required, 
            .paywall, 
            .premium-block,
            .premium-blur, 
            .upgrade-prompt, 
            .premium-modal,
            .subscription-modal,
            [class*="premium-lock"],
            [class*="subscribe"], 
            [class*="paywall"],
            [class*="upgrade-"],
            [class*="upsell"],
            .premium-banner,
            .pro-feature-locked {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
                height: 0 !important;
                overflow: hidden !important;
            }
            
            .blurred, 
            [class*="blur"]:not(.blur-backdrop) {
                filter: none !important;
                -webkit-filter: none !important;
            }
            
            .locked, 
            .disabled:not([disabled]),
            .premium-only {
                pointer-events: auto !important;
                opacity: 1 !important;
                cursor: pointer !important;
            }
            
            .rhpane__top-icons__login::after {
                content: " ✓" !important;
                color: #4CAF50 !important;
                font-weight: bold !important;
            }
            
            .day.premium, 
            .day.locked,
            [class*="calendar"] .premium,
            [class*="calendar"] .locked,
            .timeline-day.premium,
            .timeline-day.locked {
                opacity: 1 !important;
                pointer-events: auto !important;
                filter: none !important;
                cursor: pointer !important;
            }
            
            .day.premium::before,
            .day.locked::before,
            .day.premium::after,
            .day.locked::after {
                display: none !important;
            }
            
            .lock-icon,
            [class*="lock-icon"],
            .premium-icon-lock {
                display: none !important;
            }
        `;
        
        const oldStyle = document.getElementById('windy-bypass-styles');
        if (oldStyle) oldStyle.remove();
        
        document.head.appendChild(style);
        
        const activateLayers = () => {
            document.querySelectorAll('canvas, [class*="layer"]').forEach(el => {
                if (el.style) {
                    el.style.visibility = 'visible';
                    el.style.opacity = '1';
                    el.style.display = '';
                }
            });
            
            const blockers = [
                '.premium-overlay', 
                '.paywall', 
                '[class*="premium-lock"]',
                '.subscription-required',
                '.upgrade-prompt',
                '.premium-modal',
                '.pro-feature-locked'
            ];
            
            blockers.forEach(selector => {
                document.querySelectorAll(selector).forEach(el => {
                    el.remove();
                });
            });
        };
        
        activateLayers();
        
        const observer = new MutationObserver((mutations) => {
            let shouldUpdate = false;
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length > 0) {
                    shouldUpdate = true;
                }
            });
            if (shouldUpdate) {
                activateLayers();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('✅ Map layers unlocked');
    }
    
    function hackCalendarSystem() {
        const calendarClasses = [window.Mn, window.Ln, window.Kn, window.Calendar, 
                                 window.W?.Calendar, window.DaySelector, window.TimelineCalendar];
        
        for (let CalClass of calendarClasses) {
            if (CalClass && typeof CalClass === 'function') {
                try {
                    const Original = CalClass;
                    
                    const Patched = function(...args) {
                        const instance = new Original(...args);
                        
                        if (instance) {
                            Object.defineProperties(instance, {
                                premiumStartDay: { value: 999, writable: true, configurable: true },
                                premiumStart: { value: null, writable: true, configurable: true },
                                maxDays: { value: 14, writable: true, configurable: true },
                                freeDays: { value: 14, writable: true, configurable: true },
                                isPremium: { value: true, writable: true, configurable: true },
                                hasPremium: { value: true, writable: true, configurable: true }
                            });
                            
                            if (instance.days && Array.isArray(instance.days)) {
                                instance.days = instance.days.map(day => ({
                                    ...day,
                                    premium: false,
                                    locked: false,
                                    hasForecast: true,
                                    available: true,
                                    disabled: false
                                }));
                            }
                            
                            if (typeof instance.isPremiumDay === 'function') {
                                instance.isPremiumDay = () => false;
                            }
                            if (typeof instance.isLocked === 'function') {
                                instance.isLocked = () => false;
                            }
                            if (typeof instance.canSelect === 'function') {
                                instance.canSelect = () => true;
                            }
                        }
                        
                        return instance;
                    };
                    
                    Patched.prototype = Original.prototype;
                    Object.assign(Patched, Original);
                    Object.setPrototypeOf(Patched, Original);
                    
                    if (window.Mn === CalClass) window.Mn = Patched;
                    if (window.Ln === CalClass) window.Ln = Patched;
                    if (window.Kn === CalClass) window.Kn = Patched;
                    if (window.W?.Calendar === CalClass) window.W.Calendar = Patched;
                    
                    console.log('✅ Calendar class hacked');
                } catch (e) {
                    console.log('⚠️ Calendar class patch failed:', e);
                }
                break;
            }
        }
        
        function unlockCalendarDays() {
            const daySelectors = [
                '.day.premium',
                '.day.locked', 
                '.day.disabled',
                '[class*="day"][class*="premium"]',
                '[class*="day"][class*="locked"]',
                '.timeline-day.premium',
                '.timeline-day.locked',
                '.calendar-day.premium',
                '.calendar-day.locked'
            ];
            
            daySelectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(day => {
                    day.classList.remove('premium', 'locked', 'disabled', 'unavailable');
                    day.style.opacity = '1';
                    day.style.pointerEvents = 'auto';
                    day.style.cursor = 'pointer';
                    day.style.filter = 'none';
                    day.removeAttribute('disabled');
                    
                    day.querySelectorAll('.lock-icon, [class*="lock"]').forEach(lock => lock.remove());
                });
            });
        }
        
        unlockCalendarDays();
        setInterval(unlockCalendarDays, 2000);
        
        console.log('✅ Calendar system hacked');
    }
    
    function enableHourlyForecast() {
        const activateHourly = () => {
            const hourlyButtons = document.querySelectorAll(`
                [data-hourly], 
                .hourly-button, 
                .timelapse-1h,
                [data-mode="hourly"], 
                .timelapse-button:first-child,
                [title*="hourly"], 
                [title*="1h"],
                [title*="1 hour"],
                .mode-hourly,
                [data-step="1h"]
            `);
            
            hourlyButtons.forEach(btn => {
                if (btn && !btn.classList.contains('active')) {
                    btn.click();
                    btn.classList.add('active');
                    console.log('⏰ Hourly button clicked');
                }
            });
            
            const timelapse = window.W?.timelapse || window.timelapse || window.W?.timeline;
            if (timelapse) {
                timelapse._mode = 'hourly';
                timelapse._isPremium = true;
                timelapse.hourlyEnabled = true;
                timelapse.mode = 'hourly';
                timelapse.step = 1;
                timelapse.hourly = true;
                
                if (typeof timelapse.setMode === 'function') {
                    try {
                        timelapse.setMode('hourly');
                    } catch(e) {}
                }
                if (typeof timelapse.setStep === 'function') {
                    try {
                        timelapse.setStep(1);
                    } catch(e) {}
                }
                if (typeof timelapse._update === 'function') {
                    try {
                        timelapse._update();
                    } catch(e) {}
                }
                if (typeof timelapse.update === 'function') {
                    try {
                        timelapse.update();
                    } catch(e) {}
                }
            }
            
            const store = window.wt || window.W?.store;
            if (store && typeof store.set === 'function') {
                try {
                    store.set('hourlyMode', true);
                    store.set('timelapseMode', 'hourly');
                    store.set('forecastStep', 1);
                } catch(e) {}
            }
        };
        
        const timelapseObjects = [window.W?.timelapse, window.timelapse, window.W?.timeline];
        timelapseObjects.forEach(timelapse => {
            if (timelapse && typeof timelapse.setMode === 'function') {
                const original = timelapse.setMode.bind(timelapse);
                timelapse.setMode = function(mode) {
                    this._isPremium = true;
                    this.hourlyEnabled = true;
                    console.log('setMode called:', mode);
                    return original(mode);
                };
            }
        });
        
        setTimeout(activateHourly, 1000);
        setTimeout(activateHourly, 3000);
        setTimeout(activateHourly, 5000);
        setTimeout(activateHourly, 10000);
        
        console.log('✅ Hourly forecast enabled');
    }
    
    function modifyUI() {
        const loginSelectors = [
            '.premium-button', 
            '.rhpane__top-icons__login', 
            '[class*="login-btn"]',
            '[class*="premium-btn"]',
            '.user-button',
            '#login-button'
        ];
        
        loginSelectors.forEach(selector => {
            const btn = document.querySelector(selector);
            if (btn && !btn.dataset.bypassed) {
                btn.dataset.bypassed = 'true';
                btn.innerHTML = '✓ Premium';
                btn.style.cssText = `
                    background: linear-gradient(135deg, #4CAF50, #45a049) !important;
                    color: white !important;
                    border: none !important;
                    border-radius: 5px !important;
                    padding: 5px 10px !important;
                `;
                btn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    showNotification('Premium аккаунт активен!');
                };
            }
        });
        
        const premiumIcons = [
            '#desktop-premium-icon', 
            '[class*="premium-icon"]',
            '.premium-badge',
            '.pro-badge'
        ];
        
        premiumIcons.forEach(selector => {
            const icon = document.querySelector(selector);
            if (icon && !icon.dataset.bypassed) {
                icon.dataset.bypassed = 'true';
                icon.style.cssText = `
                    background: linear-gradient(135deg, #4CAF50, #45a049) !important;
                    border-radius: 5px !important;
                `;
                icon.title = 'Premium Activated ✓';
            }
        });
        
        // Скрываем рекламу и промо
        const hideSelectors = [
            '[class*="upgrade"]',
            '[class*="upsell"]', 
            '[class*="promo"]',
            '[class*="advertisement"]',
            '[class*="ad-"]',
            '.premium-promo',
            '.upgrade-banner',
            '.subscription-prompt'
        ];
        
        hideSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                if (!el.closest('nav') && !el.closest('header')) {
                    el.style.display = 'none';
                }
            });
        });
        
        console.log('✅ UI modified');
    }
    
    function refreshMap() {
        try {
            // Поиск объекта карты
            const mapObjects = [
                window.W?.map,
                window.W?.leafletMap,
                window.leafletMap,
                window.map,
                window.L?.map
            ];
            
            for (let map of mapObjects) {
                if (map) {
                    if (typeof map.invalidateSize === 'function') {
                        map.invalidateSize();
                        console.log('✅ Map invalidateSize called');
                    }
                    
                    if (typeof map._onResize === 'function') {
                        map._onResize();
                    }
                    
                    if (map.eachLayer && typeof map.eachLayer === 'function') {
                        map.eachLayer(layer => {
                            if (layer.redraw && typeof layer.redraw === 'function') {
                                layer.redraw();
                            }
                        });
                    }
                    
                    break;
                }
            }
        
            const animObjects = [window.W?.animation, window.animation, window.W?.particles];
            animObjects.forEach(anim => {
                if (anim) {
                    if (typeof anim.start === 'function') {
                        try { anim.start(); } catch(e) {}
                    }
                    if (typeof anim.resume === 'function') {
                        try { anim.resume(); } catch(e) {}
                    }
                }
            });
            
            console.log('✅ Map refreshed');
        } catch (e) {
            console.log('⚠️ Map refresh error:', e);
        }
    }
    
    function unlockPremiumLayers() {
        const products = window.W?.products || window.products;
        
        if (products && typeof products === 'object') {
            Object.keys(products).forEach(key => {
                const product = products[key];
                if (product && typeof product === 'object') {
                    product.premium = false;
                    product.isPremium = false;
                    product.locked = false;
                    product.available = true;
                    product.enabled = true;
                }
            });
            console.log('✅ Premium layers unlocked');
        }
        
        const overlays = window.W?.overlays || window.overlays;
        if (overlays && typeof overlays === 'object') {
            Object.keys(overlays).forEach(key => {
                const overlay = overlays[key];
                if (overlay && typeof overlay === 'object') {
                    overlay.premium = false;
                    overlay.isPremium = false;
                    overlay.locked = false;
                }
            });
            console.log('✅ Overlays unlocked');
        }
    }
    
    function enableExtendedData() {
        const config = window.W?.config || window.config;
        if (config) {
            config.maxForecastDays = 14;
            config.hourlyEnabled = true;
            config.premiumFeatures = true;
            config.extendedForecast = true;
        }
        
        const detail = window.W?.detail || window.detail;
        if (detail) {
            detail._isPremium = true;
            detail.maxDays = 14;
            detail.hourly = true;
        }
        
        console.log('✅ Extended data enabled');
    }
    
    function showNotification(message, duration = 4000) {
        const existing = document.getElementById('windy-bypass-notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.id = 'windy-bypass-notification';
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 28px;">🌪️</span>
                <div>
                    <div style="font-weight: bold; font-size: 15px;">Windy Premium Bypass</div>
                    <div style="font-size: 13px; opacity: 0.9; margin-top: 2px;">${message}</div>
                </div>
            </div>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            padding: 16px 22px;
            border-radius: 14px;
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            font-size: 14px;
            box-shadow: 0 6px 25px rgba(0, 0, 0, 0.35);
            animation: windySlideIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            border: 1px solid rgba(255,255,255,0.2);
        `;
        
        if (!document.getElementById('windy-bypass-animations')) {
            const styleEl = document.createElement('style');
            styleEl.id = 'windy-bypass-animations';
            styleEl.textContent = `
                @keyframes windySlideIn {
                    from { 
                        transform: translateX(120%); 
                        opacity: 0; 
                    }
                    to { 
                        transform: translateX(0); 
                        opacity: 1; 
                    }
                }
                @keyframes windySlideOut {
                    from { 
                        transform: translateX(0); 
                        opacity: 1; 
                    }
                    to { 
                        transform: translateX(120%); 
                        opacity: 0; 
                    }
                }
            `;
            document.head.appendChild(styleEl);
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'windySlideOut 0.4s ease forwards';
            setTimeout(() => notification.remove(), 400);
        }, duration);
    }
    
    function setupMonitoring() {
        let checkCount = 0;
        const maxChecks = 60;
        
        const monitor = setInterval(() => {
            checkCount++;
            
            if (!window.__windyBypassActive) {
                window.__windyBypassActive = true;
            }
            
            if (checkCount % 3 === 0) {
                unlockMapLayers();
            }
            if (checkCount % 5 === 0) {
                hackCalendarSystem();
            }
            if (checkCount % 10 === 0) {
                modifyUI();
                refreshMap();
            }
            
            if (checkCount >= maxChecks) {
                clearInterval(monitor);
                console.log('✅ Monitoring completed');
            }
        }, 5000);
        
        console.log('✅ Monitoring started');
    }
    
    function executeBypass() {
        console.log('Executing Windy Premium Bypass...');
        
        try {
            setupRequestBlocking();
            hackSubscriptionSystem();
            unlockMapLayers();
            hackCalendarSystem();
            enableHourlyForecast();
            unlockPremiumLayers();
            enableExtendedData();
            
            setTimeout(() => {
                modifyUI();
                refreshMap();
            }, 1500);
            
            setTimeout(() => {
                modifyUI();
                refreshMap();
                unlockPremiumLayers();
            }, 4000);
            
            setupMonitoring();
            
            showNotification('Все премиум функции активированы! ✓', 5000);
            
            console.log(`
╔══════════════════════════════════════════════╗
║      WINDY PREMIUM BYPASS v1.0 ACTIVE        ║
╠══════════════════════════════════════════════╣
║                                              ║
║  ✓ 10-дневный прогноз погоды                ║
║  ✓ Почасовой детальный прогноз              ║
║  ✓ Все слои карты разблокированы            ║
║  ✓ Расширенные метеоданные                  ║
║  ✓ Без рекламы и промо                      ║
║  ✓ Полный доступ к функциям                 ║
║                                              ║
╠══════════════════════════════════════════════╣
║  Bypass работает! Наслаждайтесь погодой! 🌤️  ║
╚══════════════════════════════════════════════╝
            `);
            
        } catch (error) {
            console.error('❌ Bypass error:', error);
            showNotification('Ошибка активации. Попробуйте обновить страницу.', 5000);
        }
    }
    
    function waitForWindy() {
        let attempts = 0;
        const maxAttempts = 30;
        
        const check = () => {
            attempts++;
            
            const windyLoaded = !!(
                window.W || 
                window.wt || 
                document.querySelector('.leaflet-container') ||
                document.querySelector('#map-container') ||
                document.querySelector('canvas')
            );
            
            if (windyLoaded) {
                console.log('✅ Windy detected after', attempts, 'attempts');
                setTimeout(executeBypass, 500);
                return;
            }
            
            if (attempts < maxAttempts) {
                setTimeout(check, 300);
            } else {
                console.log('⚠️ Windy detection timeout, forcing bypass...');
                executeBypass();
            }
        };
        
        check();
    }
    
    if (document.readyState === 'complete') {
        waitForWindy();
    } else {
        window.addEventListener('load', () => {
            setTimeout(waitForWindy, 500);
        });
    }
    
})();
