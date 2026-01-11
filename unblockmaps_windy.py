import webbrowser
import time
import threading
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import sys

def setup_driver():
    """Настраивает Chrome драйвер"""
    chrome_options = Options()
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1200,800")
    
    try:
        driver = webdriver.Chrome(options=chrome_options)
        return driver
    except Exception as e:
        print(f"❌ Ошибка ChromeDriver: {e}")
        return None

def inject_smart_windy_bypass(driver):
    """Умный обход который адаптируется к структуре Windy"""
    bypass_code = """
    // === УМНЫЙ АДАПТИВНЫЙ ОБХОД WINDY ===
    console.log('🎯 Starting smart Windy bypass...');
    
    let bypassActive = false;
    
    // 1. УНИВЕРСАЛЬНАЯ БЛОКИРОВКА ЗАПРОСОВ
        function setupSmartRequestBlocking() {
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            const url = args[0];
            
            if (typeof url === 'string') {
                // ВАЖНО: РАЗРЕШАЕМ запросы с данными для почасового прогноза
                if (url.includes('detail2') || url.includes('12do-detail2')) {
                    console.log('✅ Allowing DATA request:', url);
                    return originalFetch.apply(this, args);
                }
                
                // Блокируем только аналитику и платежи
                const blockedPatterns = [
                    'paddle.com', 'stripe.com', 'paypal.com',
                    'analytics', 'subscription'
                ];
                
                if (blockedPatterns.some(pattern => url.includes(pattern))) {
                    console.log('🚫 Blocked analytics:', url);
                    return Promise.resolve(new Response(
                        JSON.stringify({success: true, premium: true}),
                        {status: 200, headers: {'Content-Type': 'application/json'}}
                    ));
                }
            }
            return originalFetch.apply(this, args);
        };
        
        // Также перехватываем XMLHttpRequest
        const originalXHROpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url, ...rest) {
            if (typeof url === 'string' && 
                (url.includes('detail2') || url.includes('12do-detail2'))) {
                console.log('✅ Allowing XHR data:', url);
                return originalXHROpen.apply(this, [method, url, ...rest]);
            }
            return originalXHROpen.apply(this, [method, url, ...rest]);
        };
        
        console.log('✅ Smart request blocking setup');
    }
    
    // 2. УМНАЯ СИСТЕМА ПОДПИСКИ
    function setupSmartSubscription() {
        // Ищем объект store разными способами
        let store = window.wt || window.W?.store || window.store;
        
        if (store && typeof store.get === 'function') {
            const originalGet = store.get;
            store.get = function(key) {
                switch(key) {
                    case 'subscription':
                    case 'premium':
                        return 'premium';
                    case 'subscriptionInfo':
                        return {
                            isSubscription: true,
                            tier: 'premium',
                            state: 'active',
                            status: 'active'
                        };
                    case 'user':
                        return {premium: true, subscription: 'premium'};
                    default:
                        return originalGet.call(this, key);
                }
            };
            console.log('✅ Store subscription hacked');
        }
        
        // Перехватываем глобальные функции
        if (typeof window.Dr === 'function') window.Dr = () => true;
        if (typeof window.Mr === 'function') window.Mr = () => null;
        
        // Создаем фейковую подписку если ничего не найдено
        if (!store) {
            window.wt = {
                get: (key) => key.includes('subscription') || key.includes('premium') ? 'premium' : null,
                set: () => true
            };
            console.log('✅ Fake store created');
        }
    }
    
    // 3. АКТИВАЦИЯ СЛОЕВ БЕЗ ЛОМКИ КАРТЫ
    function activateLayersSafely() {
        try {
            // Ищем все возможные канвасы и слои
            const elements = document.querySelectorAll(`
                canvas, 
                [class*="layer"], 
                [class*="overlay"],
                .leaflet-layer,
                .wind-layer, .temp-layer, .rain-layer, .cloud-layer,
                .weather-layer, .map-layer
            `);
            
            elements.forEach(element => {
                // Безопасно активируем
                if (element.style) {
                    if (element.style.display === 'none') element.style.display = 'block';
                    if (element.style.visibility === 'hidden') element.style.visibility = 'visible';
                    if (element.style.opacity === '0' || element.style.opacity === '0.5') {
                        element.style.opacity = '1';
                    }
                }
            });
            
            // Убираем блокировки
            const blockers = document.querySelectorAll(`
                .premium-overlay, .gray-overlay, .locked-overlay,
                .subscription-required, .paywall, .premium-block
            `);
            
            blockers.forEach(blocker => {
                blocker.style.display = 'none';
                blocker.style.visibility = 'hidden';
            });
            
            console.log('✅ Layers activated safely');
            
        } catch (error) {
            console.log('⚠️ Safe activation error:', error);
        }
    }
    
    // 4. УМНОЕ ОБНОВЛЕНИЕ КАРТЫ
    function refreshMapSafely() {
        try {
            // Пробуем разные варианты обновления карты
            const mapObjects = [
                window.W?.map,
                window.W?.leafletMap, 
                window.leafletMap,
                window.map,
                document.querySelector('.leaflet-container')?._leaflet_map
            ];
            
            for (let mapObj of mapObjects) {
                if (mapObj && typeof mapObj.invalidateSize === 'function') {
                    mapObj.invalidateSize();
                    console.log('✅ Map refreshed');
                    break;
                }
            }
            
            // Пробуем запустить анимации
            const animObjects = [
                window.W?.animation,
                window.animation,
                window.W?.anim
            ];
            
            for (let animObj of animObjects) {
                if (animObj && typeof animObj.start === 'function') {
                    animObj.start();
                    console.log('✅ Animation started');
                    break;
                }
            }
            
        } catch (error) {
            // Игнорируем ошибки обновления карты - это не критично
        }
    }
    
    // 5. ОБХОД СИСТЕМЫ КАЛЕНДАРЯ
    function hackCalendarSystem() {
        // Ищем Calendar класс разными именами
        const calendarClasses = [window.Mn, window.Calendar, window.W?.Calendar];
        
        for (let CalendarClass of calendarClasses) {
            if (CalendarClass && typeof CalendarClass === 'function') {
                const OriginalCalendar = CalendarClass;
                window.Mn = function(config) {
                    const instance = new OriginalCalendar(config);
                    
                    // Убираем премиум ограничения
                    if (instance.premiumStartDay !== undefined) instance.premiumStartDay = 999;
                    if (instance.premiumStart !== undefined) instance.premiumStart = null;
                    if (instance.days) {
                        instance.days = instance.days.map(day => ({
                            ...day,
                            premium: false,
                            hasForecast: true
                        }));
                    }
                    
                    return instance;
                };
                console.log('✅ Calendar system hacked');
                break;
            }
        }
    }

    // 6. МОДИФИКАЦИЯ ИНТЕРФЕЙСА
    function modifyInterface() {
        // Изменяем кнопку входа
        const loginButton = document.querySelector('.premium-button.rhpane__top-icons__login');
        if (loginButton) {
            loginButton.textContent = 'Tester';
            loginButton.onclick = function(e) {
                e.preventDefault();
                showStatusMessage('Аккаунт активирован');
            };
            console.log('✅ Login button modified');
        }

        // Изменяем кнопку премиум
        const premiumButton = document.querySelector('#desktop-premium-icon');
        if (premiumButton) {
            premiumButton.textContent = 'Премиум активирован';
            premiumButton.style.backgroundColor = '#4CAF50'; // Зеленый цвет
            console.log('✅ Premium button modified');
        }
    }

    // ОБХОД ДЛЯ ПОЧАСОВОГО ПРОГНОЗА
        function fixHourlyForecast() {
        console.log('🎯 Setting up hourly forecast fix...');
        
        function forceHourlyMode() {
            const hourlySelectors = [
                '[data-hourly]',
                '.hourly-button', 
                '.timelapse-1h',
                '[data-mode="hourly"]',
                '.timelapse-button:nth-child(1)',
                '.timelapse-selector button:first-child'
            ];
            
            for (let selector of hourlySelectors) {
                const btn = document.querySelector(selector);
                if (btn) {
                    console.log('🔄 Clicking hourly button:', selector);
                    btn.click();
                    
                    // Форсируем внутреннее состояние
                    if (window.W?.timelapse) {
                        setTimeout(() => {
                            window.W.timelapse._mode = 'hourly';
                            window.W.timelapse._isPremium = true;
                            if (window.W.timelapse._update) {
                                window.W.timelapse._update();
                            }
                            console.log('✅ Hourly mode forced');
                        }, 300);
                    }
                    return true;
                }
            }
            return false;
        }
        
        // Перехватываем систему таймлапса
        if (window.W?.timelapse && window.W.timelapse.setMode) {
            const originalSetMode = window.W.timelapse.setMode;
            window.W.timelapse.setMode = function(mode) {
                console.log('⏰ Timelapse mode change to:', mode);
                
                if (mode === 'hourly') {
                    this._mode = 'hourly';
                    this._isPremium = true;
                    if (this._update) this._update();
                    return true;
                }
                return originalSetMode.call(this, mode);
            };
            console.log('✅ Timelapse system hijacked');
        }
        
        // Периодически активируем почасовой режим
        let attempts = 0;
        const interval = setInterval(() => {
            const success = forceHourlyMode();
            attempts++;
            
            if (success || attempts >= 8) {
                clearInterval(interval);
                console.log('✅ Hourly forecast activated');
            }
        }, 1000);
    }
    
    // 7. ГЛАВНАЯ ФУНКЦИЯ
    function executeSmartBypass() {
        if (bypassActive) return;
        bypassActive = true;
        
        console.log('🎯 Executing smart Windy bypass...');
        
        setupSmartRequestBlocking();
        setupSmartSubscription();
        hackCalendarSystem();
        modifyInterface();
        activateLayersSafely();
        refreshMapSafely();
        
        // Плавное периодическое обновление
        let updateCount = 0;
        const updateInterval = setInterval(() => {
            activateLayersSafely();
            refreshMapSafely();
            
            updateCount++;
            if (updateCount >= 12) { // Останавливаем через минуту
                clearInterval(updateInterval);
                console.log('✅ Bypass maintenance complete');
            }
        }, 5000);
        
        console.log('✅ Smart Windy bypass COMPLETE!');
        
        // Показать статус
        showStatusMessage('Windy Premium активирован!');
    }
    
    function showStatusMessage(message) {
        // Создаем или обновляем статусное сообщение
        let statusEl = document.getElementById('windy-bypass-status');
        if (!statusEl) {
            statusEl = document.createElement('div');
            statusEl.id = 'windy-bypass-status';
            statusEl.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: #4CAF50;
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                z-index: 10000;
                font-family: Arial;
                font-size: 12px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            `;
            document.body.appendChild(statusEl);
        }
        statusEl.textContent = message;
        
        setTimeout(() => {
            if (statusEl.parentNode) {
                statusEl.style.opacity = '0';
                setTimeout(() => statusEl.parentNode.removeChild(statusEl), 1000);
            }
        }, 3000);
    }
    
    // Запускаем с задержкой чтобы Windy успел загрузиться
    setTimeout(executeSmartBypass, 2000);
    
    // Также запускаем при полной загрузке
    if (document.readyState === 'complete') {
        executeSmartBypass();
    } else {
        window.addEventListener('load', executeSmartBypass);
    }
    
    // Запускаем при любых изменениях DOM
    new MutationObserver(() => {
        setTimeout(activateLayersSafely, 100);
    }).observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true
    });
    
    console.log('✅ Smart bypass initialized');
    """
    
    try:
        driver.execute_script(bypass_code)
        print("✅ Умный обход внедрен")
        return True
    except Exception as e:
        print(f"❌ Ошибка внедрения: {e}")
        return False

def monitor_and_reinject(driver):
    """Мониторинг и перевнедрение"""
    def monitor():
        reinject_count = 0
        while reinject_count < 5:  # Максимум 5 перевнедрений
            time.sleep(10)
            try:
                if 'windy.com' in driver.current_url:
                    print("🔄 Повторное внедрение...")
                    inject_smart_windy_bypass(driver)
                    reinject_count += 1
            except:
                break
    
    thread = threading.Thread(target=monitor, daemon=True)
    thread.start()

def main():
    print("🚀 ЗАПУСК УМНОГО ОБХОДА WINDY")
    print("=" * 50)
    
    driver = setup_driver()
    if not driver:
        print("❌ Не удалось запустить браузер")
        return
    
    try:
        print("🌐 Открываем Windy.com...")
        driver.get("https://www.windy.com")
        
        print("⏳ Ожидаем полную загрузку (20 секунд)...")
        time.sleep(20)
        
        print("💉 Внедряем умный адаптивный обход...")
        success = inject_smart_windy_bypass(driver)
        
        if success:
            print("✅ Умный обход активирован!")
            print("🎯 Система адаптируется к структуре Windy")
            print("🛡️ Безопасная активация без ошибок")
            
            monitor_and_reinject(driver)
            
            print("\\n📌 Работает... Закройте браузер или Ctrl+C для выхода")
            try:
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                print("\\n🔒 Завершение...")
                
        else:
            print("❌ Не удалось активировать обход")
            
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        
    finally:
        if driver:
            driver.quit()
            print("🔒 Браузер закрыт")

if __name__ == "__main__":
    try:
        import selenium
    except ImportError:
        print("❌ Установите: pip install selenium")
        sys.exit(1)
    
    main()