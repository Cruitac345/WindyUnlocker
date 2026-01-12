// === WINDY PREMIUM BYPASS v1.0 ===

(function() {
    'use strict';
    
    console.log('🌪️ Windy Premium Bypass v2.0 Starting...');
    
    let bypassActive = false;
    
    // ==========================================
    // 1. БЛОКИРОВКА РЕКЛАМЫ И АНАЛИТИКИ
    // ==========================================
    function setupRequestBlocking() {
        // Перехват Fetch
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            const url = args[0];
            
            if (typeof url === 'string') {
                // Разрешаем запросы данных прогноза
                if (url.includes('detail2') || url.includes('12do-detail2') || 
                    url.includes('forecast') || url.includes('weather')) {
                    console.log('✅ Data request allowed:', url.substring(0, 60));
                    return originalFetch.apply(this, args);
                }
                
                // Блокируем платежи и аналитику
                const blocked = ['paddle.com', 'stripe.com', 'paypal.com', 
                                'analytics', 'subscription', 'premium-check',
                                'google-analytics', 'gtm', 'hotjar'];
                
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
        
        // Перехват XMLHttpRequest
        const originalOpen = XMLHttpRequest.prototype.open;
        const originalSend = XMLHttpRequest.prototype.send;
        
        XMLHttpRequest.prototype.open = function(method, url, ...rest) {
            this._url = url;
            return originalOpen.apply(this, [method, url, ...rest]);
        };
        
        XMLHttpRequest.prototype.send = function(...args) {
            if (this._url && typeof this._url === 'string') {
                const blockedPatterns = ['subscription', 'premium-status', 'payment'];
                if (blockedPatterns.some(p => this._url.includes(p))) {
                    console.log('🚫 XHR Blocked:', this._url.substring(0, 50));
                    return;
                }
            }
            return originalSend.apply(this, args);
        };
        
        console.log('✅ Request blocking active');
    }
    
    // ==========================================
    // 2. ПОДМЕНА СИСТЕМЫ ПОДПИСКИ
    // ==========================================
    function hackSubscriptionSystem() {
        // Поиск store объекта
        const storeObjects = [window.wt, window.W?.store, window.store, window.W?.wt];
        
        for (let store of storeObjects) {
            if (store && typeof store.get === 'function') {
                const originalGet = store.get;
                store.get = function(key) {
                    const premiumKeys = ['subscription', 'premium', 'subscriptionInfo', 
                                        'isPremium', 'userType', 'tier'];
                    
                    if (premiumKeys.some(k => key.toLowerCase().includes(k.toLowerCase()))) {
                        console.log('🔓 Premium key intercepted:', key);
                        
                        if (key === 'subscriptionInfo' || key === 'subscription') {
                            return {
                                isSubscription: true,
                                isPremium: true,
                                tier: 'premium',
                                state: 'active',
                                status: 'active',
                                validUntil: new Date(2099, 11, 31).toISOString()
                            };
                        }
                        return 'premium';
                    }
                    return originalGet.call(this, key);
                };
                
                // Также перехватываем set
                if (typeof store.set === 'function') {
                    const originalSet = store.set;
                    store.set = function(key, value) {
                        if (key.includes('premium') || key.includes('subscription')) {
                            console.log('🔒 Prevented premium reset:', key);
                            return; // Блокируем сброс премиума
                        }
                        return originalSet.call(this, key, value);
                    };
                }
                
                console.log('✅ Store hijacked');
                break;
            }
        }
        
        // Создаем фейковый store если не найден
        if (!window.wt) {
            window.wt = {
                get: (key) => key.includes('premium') || key.includes('subscription') ? 'premium' : null,
                set: () => true,
                on: () => {},
                off: () => {}
            };
        }
        
        // Глобальные флаги
        window.isPremium = true;
        window.isSubscribed = true;
        window.premiumUser = true;
        
        // Перехват проверочных функций (minified names)
        const checkFunctions = ['Dr', 'Mr', 'Pr', 'isPremium', 'checkPremium', 'validateSubscription'];
        checkFunctions.forEach(fn => {
            if (typeof window[fn] === 'function') {
                window[fn] = () => true;
                console.log('✅ Bypassed check function:', fn);
            }
        });
    }
    
    // ==========================================
    // 3. РАЗБЛОКИРОВКА СЛОЁВ КАРТЫ
    // ==========================================
    function unlockMapLayers() {
        // CSS для принудительного отображения
        const style = document.createElement('style');
        style.textContent = `
            /* Показываем скрытые слои */
            canvas, .leaflet-layer, .wind-layer, .temp-layer, 
            .rain-layer, .cloud-layer, .weather-layer, 
            [class*="layer"], [class*="overlay"] {
                visibility: visible !important;
                opacity: 1 !important;
                display: block !important;
            }
            
            /* Скрываем премиум блокировки */
            .premium-overlay, .gray-overlay, .locked-overlay,
            .subscription-required, .paywall, .premium-block,
            .premium-blur, .upgrade-prompt, [class*="premium-lock"],
            [class*="subscribe"], [class*="paywall"] {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
            }
            
            /* Убираем размытие */
            .blurred, [class*="blur"] {
                filter: none !important;
                -webkit-filter: none !important;
            }
            
            /* Разблокируем интерактивность */
            .locked, .disabled, [disabled] {
                pointer-events: auto !important;
                opacity: 1 !important;
            }
            
            /* Премиум индикатор */
            .rhpane__top-icons__login::after {
                content: " ✓ Premium" !important;
                color: #4CAF50 !important;
            }
        `;
        document.head.appendChild(style);
        
        // Принудительное включение слоёв через JS
        const activateLayers = () => {
            document.querySelectorAll('canvas, [class*="layer"]').forEach(el => {
                if (el.style) {
                    el.style.visibility = 'visible';
                    el.style.opacity = '1';
                    el.style.display = '';
                }
            });
            
            // Удаляем блокирующие элементы
            document.querySelectorAll('.premium-overlay, .paywall, [class*="premium-lock"]').forEach(el => {
                el.remove();
            });
        };
        
        activateLayers();
        
        // Повторяем при изменениях DOM
        new MutationObserver(activateLayers).observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('✅ Map layers unlocked');
    }
    
    // ==========================================
    // 4. РАЗБЛОКИРОВКА КАЛЕНДАРЯ
    // ==========================================
    function hackCalendarSystem() {
        // Перехват класса Calendar
        const calendarClasses = [window.Mn, window.Calendar, window.W?.Calendar, window.DaySelector];
        
        for (let CalClass of calendarClasses) {
            if (CalClass && typeof CalClass === 'function') {
                const Original = CalClass;
                
                const Patched = function(...args) {
                    const instance = new Original(...args);
                    
                    // Убираем премиум ограничения
                    Object.defineProperties(instance, {
                        premiumStartDay: { value: 999, writable: true },
                        premiumStart: { value: null, writable: true },
                        maxDays: { value: 14, writable: true },
                        freeDays: { value: 14, writable: true }
                    });
                    
                    // Патчим массив дней
                    if (instance.days && Array.isArray(instance.days)) {
                        instance.days = instance.days.map(day => ({
                            ...day,
                            premium: false,
                            locked: false,
                            hasForecast: true,
                            available: true
                        }));
                    }
                    
                    return instance;
                };
                
                // Копируем прототип и статические методы
                Patched.prototype = Original.prototype;
                Object.assign(Patched, Original);
                
                window.Mn = Patched;
                if (window.W) window.W.Calendar = Patched;
                
                console.log('✅ Calendar system hacked');
                break;
            }
        }
        
        // Разблокировка дней в DOM
        setInterval(() => {
            document.querySelectorAll('.day.premium, .day.locked, [class*="day"][class*="premium"]').forEach(day => {
                day.classList.remove('premium', 'locked', 'disabled');
                day.style.opacity = '1';
                day.style.pointerEvents = 'auto';
            });
        }, 2000);
    }
    
    // ==========================================
    // 5. ПОЧАСОВОЙ ПРОГНОЗ
    // ==========================================
    function enableHourlyForecast() {
        // Активация почасового режима
        const activateHourly = () => {
            const hourlyButtons = document.querySelectorAll(`
                [data-hourly], .hourly-button, .timelapse-1h,
                [data-mode="hourly"], .timelapse-button:first-child,
                [title*="hourly"], [title*="1h"]
            `);
            
            hourlyButtons.forEach(btn => {
                if (btn && !btn.classList.contains('active')) {
                    btn.click();
                    console.log('⏰ Hourly mode activated');
                }
            });
            
            // Хак timelapse объекта
            const timelapse = window.W?.timelapse || window.timelapse;
            if (timelapse) {
                timelapse._mode = 'hourly';
                timelapse._isPremium = true;
                timelapse.hourlyEnabled = true;
                
                if (typeof timelapse.setMode === 'function') {
                    timelapse.setMode('hourly');
                }
                if (typeof timelapse._update === 'function') {
                    timelapse._update();
                }
            }
        };
        
        // Перехват setMode
        if (window.W?.timelapse) {
            const original = window.W.timelapse.setMode;
            window.W.timelapse.setMode = function(mode) {
                this._isPremium = true;
                if (mode === 'hourly') {
                    this._mode = 'hourly';
                    console.log('⏰ Hourly mode forced');
                }
                return original?.call(this, mode);
            };
        }
        
        // Активируем несколько раз
        setTimeout(activateHourly, 1000);
        setTimeout(activateHourly, 3000);
        setTimeout(activateHourly, 5000);
        
        console.log('✅ Hourly forecast enabled');
    }
    
    // ==========================================
    // 6. МОДИФИКАЦИЯ ИНТЕРФЕЙСА
    // ==========================================
    function modifyUI() {
        // Изменяем кнопку логина
        const loginBtn = document.querySelector('.premium-button, .rhpane__top-icons__login, [class*="login"]');
        if (loginBtn) {
            loginBtn.innerHTML = '✓ Premium Active';
            loginBtn.style.cssText = 'background: #4CAF50 !important; color: white !important;';
            loginBtn.onclick = (e) => {
                e.preventDefault();
                showNotification('Premium аккаунт активен!');
            };
        }
        
        // Изменяем премиум кнопку
        const premiumBtn = document.querySelector('#desktop-premium-icon, [class*="premium-icon"]');
        if (premiumBtn) {
            premiumBtn.style.cssText = 'background: #4CAF50 !important; border-radius: 5px;';
            premiumBtn.title = 'Premium Activated';
        }
        
        // Скрываем рекламу апгрейда
        document.querySelectorAll('[class*="upgrade"], [class*="upsell"], [class*="promo"]').forEach(el => {
            el.style.display = 'none';
        });
        
        console.log('✅ UI modified');
    }
    
    // ==========================================
    // 7. ОБНОВЛЕНИЕ КАРТЫ
    // ==========================================
    function refreshMap() {
        try {
            const mapObjects = [
                window.W?.map,
                window.W?.leafletMap,
                window.leafletMap,
                window.map
            ];
            
            for (let map of mapObjects) {
                if (map) {
                    if (typeof map.invalidateSize === 'function') {
                        map.invalidateSize();
                    }
                    if (typeof map._onResize === 'function') {
                        map._onResize();
                    }
                    console.log('✅ Map refreshed');
                    break;
                }
            }
            
            // Запуск анимации
            const anim = window.W?.animation || window.animation;
            if (anim && typeof anim.start === 'function') {
                anim.start();
            }
        } catch (e) {
            // Ignore
        }
    }
    
    // ==========================================
    // 8. УВЕДОМЛЕНИЯ
    // ==========================================
    function showNotification(message, duration = 4000) {
        // Удаляем предыдущее
        const existing = document.getElementById('windy-bypass-notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.id = 'windy-bypass-notification';
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 24px;">🌪️</span>
                <div>
                    <div style="font-weight: bold;">Windy Premium Bypass</div>
                    <div style="font-size: 12px; opacity: 0.9;">${message}</div>
                </div>
            </div>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 12px;
            z-index: 999999;
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 14px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            animation: slideIn 0.3s ease;
        `;
        
        // Добавляем анимацию
        const styleEl = document.createElement('style');
        styleEl.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(styleEl);
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
    
    // ==========================================
    // ГЛАВНАЯ ФУНКЦИЯ
    // ==========================================
    function executeBypass() {
        if (bypassActive) {
            console.log('⚠️ Bypass already active');
            return;
        }
        
        bypassActive = true;
        console.log('🚀 Executing Windy Premium Bypass...');
        
        // Выполняем все модули
        setupRequestBlocking();
        hackSubscriptionSystem();
        unlockMapLayers();
        hackCalendarSystem();
        enableHourlyForecast();
        
        // С задержкой для UI
        setTimeout(() => {
            modifyUI();
            refreshMap();
        }, 1000);
        
        // Периодическое обновление
        let updates = 0;
        const interval = setInterval(() => {
            unlockMapLayers();
            refreshMap();
            updates++;
            
            if (updates >= 10) {
                clearInterval(interval);
                console.log('✅ Bypass maintenance complete');
            }
        }, 5000);
        
        showNotification('Premium функции активированы! ✓');
        
        console.log(`
╔══════════════════════════════════════╗
║   🌪️ WINDY PREMIUM BYPASS ACTIVE    ║
╠══════════════════════════════════════╣
║ ✓ 10-дневный прогноз                ║
║ ✓ Почасовой прогноз                 ║
║ ✓ Все слои карты                    ║
║ ✓ Расширенные данные                ║
║ ✓ Без рекламы                       ║
╚══════════════════════════════════════╝
        `);
    }
    
    // ==========================================
    // ЗАПУСК
    // ==========================================
    
    // Проверяем что мы на Windy
    if (!window.location.hostname.includes('windy.com')) {
        alert('⚠️ Этот скрипт работает только на windy.com!\n\nПерейдите на https://www.windy.com и запустите снова.');
        return;
    }
    
    // Запускаем с задержкой
    if (document.readyState === 'complete') {
        setTimeout(executeBypass, 1000);
    } else {
        window.addEventListener('load', () => setTimeout(executeBypass, 2000));
    }
    
    // Также по DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => setTimeout(executeBypass, 1500));
    
    // Fallback
    setTimeout(executeBypass, 3000);
    
})();