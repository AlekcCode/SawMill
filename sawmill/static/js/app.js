document.addEventListener('DOMContentLoaded', function() {
    // Мобильное меню
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            const isOpen = navMenu.classList.contains('active');
            mobileMenuToggle.setAttribute('aria-expanded', isOpen);
            mobileMenuToggle.innerHTML = isOpen ? '✕' : '☰';
        });

        // Закрытие меню при клике на ссылку
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                mobileMenuToggle.innerHTML = '☰';
            });
        });
    }

    // Функция плавной прокрутки
    function smoothScrollTo(targetElement) {
        if (targetElement) {
            const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
            const targetPosition = targetElement.offsetTop - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    // Плавная прокрутка для якорных ссылок
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                smoothScrollTo(targetElement);
            }
        });
    });

    // Анимация при прокрутке (Intersection Observer)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    // Элементы для анимации
    const animateElements = document.querySelectorAll('.service-card, .stat-item, .product-item, .about__text, .about__image');
    animateElements.forEach(element => {
        observer.observe(element);
    });

    // Эффект параллакса для hero секции
    const heroBackground = document.querySelector('.hero__background');
    if (heroBackground) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            heroBackground.style.transform = `translateY(${rate}px)`;
        });
    }

    // Функция показа уведомлений
    function showNotification(message, type = 'info') {
        // Удаляем существующие уведомления
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notif => notif.remove());

        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;

        const bgColor = type === 'success' ? '#9ACD32' :
                       type === 'error' ? '#dc3545' :
                       type === 'info' ? '#17a2b8' : '#8B4513';

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 1000;
            max-width: 350px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            font-weight: 500;
            font-size: 14px;
            line-height: 1.4;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Показываем уведомление
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Скрываем уведомление через 4 секунды
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    // Обработка формы обратной связи
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const name = formData.get('name');
            const phone = formData.get('phone');
            const message = formData.get('message');

            // Простая валидация
            if (!name || !name.trim()) {
                showNotification('Пожалуйста, введите ваше имя', 'error');
                document.getElementById('name').focus();
                return;
            }

            if (!phone || !phone.trim()) {
                showNotification('Пожалуйста, введите номер телефона', 'error');
                document.getElementById('phone').focus();
                return;
            }

            // Имитация отправки формы
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;

            submitButton.disabled = true;
            submitButton.textContent = 'Отправляется...';
            submitButton.style.opacity = '0.7';

            // Симуляция отправки
            setTimeout(() => {
                showNotification('✅ Спасибо! Ваше сообщение успешно отправлено. Мы свяжемся с вами в ближайшее время.', 'success');
                this.reset();
                submitButton.disabled = false;
                submitButton.textContent = originalText;
                submitButton.style.opacity = '1';
            }, 1500);
        });
    }

    // Обработка кнопки "Получить консультацию"
    const heroCta = document.querySelector('.hero__cta');
    if (heroCta) {
        heroCta.addEventListener('click', function(e) {
            e.preventDefault();
            const contactsSection = document.getElementById('contacts');
            if (contactsSection) {
                smoothScrollTo(contactsSection);
                // Фокус на первое поле формы через небольшую задержку
                setTimeout(() => {
                    const nameField = document.getElementById('name');
                    if (nameField) {
                        nameField.focus();
                    }
                }, 500);
            }
        });
    }

    // Обработка остальных CTA кнопок
    const ctaButtons = document.querySelectorAll('.btn--primary, .btn--secondary');
    ctaButtons.forEach(button => {
        // Исключаем кнопки в формах и hero кнопку
        if (!button.closest('form') && !button.classList.contains('hero__cta')) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const buttonText = this.textContent.toLowerCase();

                if (buttonText.includes('каталог')) {
                    showNotification('📋 Каталог продукции скоро будет доступен! Свяжитесь с нами для получения подробной информации.', 'info');
                } else {
                    // Прокрутка к форме контактов для других кнопок
                    const contactsSection = document.getElementById('contacts');
                    if (contactsSection) {
                        smoothScrollTo(contactsSection);
                    }
                }
            });
        }
    });

    // Активная навигация при прокрутке
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');

    function updateActiveNav() {
        const scrollPos = window.scrollY + 150; // Учитываем высоту шапки

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // Добавляем стили для активной навигации
    const style = document.createElement('style');
    style.textContent = `
        .nav-menu a.active {
            background-color: rgba(255, 255, 255, 0.15) !important;
            color: #DAA520 !important;
            border-radius: 6px;
        }

        .notification {
            font-family: var(--font-family-base, system-ui, sans-serif);
        }
    `;
    document.head.appendChild(style);

    // Обновление активной навигации при прокрутке
    window.addEventListener('scroll', updateActiveNav);
    updateActiveNav(); // Вызываем сразу для установки начального состояния

    // Добавление интерактивности для статистики (анимация чисел)
    const statNumbers = document.querySelectorAll('.stat-item__number');

    const animateNumbers = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const text = target.textContent;
                const finalNumber = parseInt(text.replace(/\D/g, '')) || 0;
                const suffix = text.replace(/\d/g, '');

                let currentNumber = 0;
                const increment = Math.max(1, Math.ceil(finalNumber / 30));

                const timer = setInterval(() => {
                    currentNumber += increment;
                    if (currentNumber >= finalNumber) {
                        currentNumber = finalNumber;
                        clearInterval(timer);
                    }
                    target.textContent = currentNumber + suffix;
                }, 50);

                // Убираем элемент из наблюдения после анимации
                numberObserver.unobserve(target);
            }
        });
    };

    const numberObserver = new IntersectionObserver(animateNumbers, {
        threshold: 0.5
    });

    statNumbers.forEach(number => {
        numberObserver.observe(number);
    });

    // Добавляем эффект hover для карточек услуг
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Прелоадер для изображений
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });

        // Устанавливаем начальную прозрачность
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';

        // Если изображение уже загружено
        if (img.complete) {
            img.style.opacity = '1';
        }
    });

    // Добавляем эффект "печатной машинки" для заголовка hero
    const heroTitle = document.querySelector('.hero__title');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        heroTitle.textContent = '';
        heroTitle.style.borderRight = '2px solid #DAA520';

        let i = 0;
        const typeWriter = () => {
            if (i < originalText.length) {
                heroTitle.textContent += originalText.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            } else {
                // Убираем курсор после завершения печати
                setTimeout(() => {
                    heroTitle.style.borderRight = 'none';
                }, 500);
            }
        };

        // Запускаем эффект через небольшую задержку
        setTimeout(typeWriter, 1000);
    }

    // Обработка клавиатурной навигации
    document.addEventListener('keydown', function(e) {
        // Escape для закрытия мобильного меню
        if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            mobileMenuToggle.innerHTML = '☰';
        }
    });

    // Показываем приветственное сообщение через некоторое время
    setTimeout(() => {
        console.log('🌲 ЛесПилСтрой-НН: Добро пожаловать на наш сайт!');
        console.log('📞 Свяжитесь с нами: +7 (831) 123-45-67');
    }, 2000);
});