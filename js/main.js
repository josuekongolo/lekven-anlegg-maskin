/* ========================================
   LEKVEN ANLEGG & MASKIN - Main JavaScript
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initMobileMenu();
    initSmoothScroll();
    initHeaderScroll();
    initContactForm();
    initScrollAnimations();
    initClickToCall();
});

/* ========================================
   MOBILE MENU
   ======================================== */

function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            mainNav.classList.toggle('active');

            // Toggle aria-expanded for accessibility
            const isExpanded = mainNav.classList.contains('active');
            this.setAttribute('aria-expanded', isExpanded);
        });

        // Close menu when clicking a link
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                menuToggle.classList.remove('active');
                mainNav.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!mainNav.contains(e.target) && !menuToggle.contains(e.target)) {
                menuToggle.classList.remove('active');
                mainNav.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }
}

/* ========================================
   SMOOTH SCROLL
   ======================================== */

function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            if (href === '#') return;

            const target = document.querySelector(href);

            if (target) {
                e.preventDefault();

                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ========================================
   HEADER SCROLL EFFECT
   ======================================== */

function initHeaderScroll() {
    const header = document.querySelector('header');
    const topBar = document.querySelector('.top-bar');
    let lastScroll = 0;

    if (header) {
        window.addEventListener('scroll', function() {
            const currentScroll = window.pageYOffset;

            // Add shadow when scrolled
            if (currentScroll > 50) {
                header.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            } else {
                header.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            }

            // Hide/show top bar on scroll (desktop only)
            if (topBar && window.innerWidth > 767) {
                if (currentScroll > lastScroll && currentScroll > 100) {
                    topBar.style.transform = 'translateY(-100%)';
                    topBar.style.transition = 'transform 0.3s ease';
                } else {
                    topBar.style.transform = 'translateY(0)';
                }
            }

            lastScroll = currentScroll;
        });
    }
}

/* ========================================
   CONTACT FORM
   ======================================== */

function initContactForm() {
    const form = document.getElementById('contact-form');

    if (form) {
        form.addEventListener('submit', handleFormSubmit);

        // Real-time validation
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });

            input.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    validateField(this);
                }
            });
        });
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const formMessage = document.getElementById('form-message');

    // Validate all fields
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });

    if (!isValid) {
        showFormMessage('Vennligst fyll ut alle obligatoriske felt.', 'error');
        return;
    }

    // Disable submit button and show loading
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Sender...';

    // Collect form data
    const formData = {
        name: form.querySelector('#name').value.trim(),
        email: form.querySelector('#email').value.trim(),
        phone: form.querySelector('#phone').value.trim(),
        address: form.querySelector('#address')?.value.trim() || '',
        projectType: form.querySelector('#project-type').value,
        description: form.querySelector('#description').value.trim(),
        wantSiteVisit: form.querySelector('#site-visit')?.checked || false,
        timestamp: new Date().toISOString()
    };

    try {
        // Simulate API call (replace with actual Resend API integration)
        await simulateFormSubmission(formData);

        // Success
        showFormMessage(
            'Takk for din henvendelse! Vi har mottatt meldingen din og tar kontakt så snart som mulig - vanligvis innen én arbeidsdag.',
            'success'
        );

        // Reset form
        form.reset();

        // Scroll to message
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

    } catch (error) {
        console.error('Form submission error:', error);
        showFormMessage(
            'Beklager, noe gikk galt. Vennligst prøv igjen eller ring oss direkte.',
            'error'
        );
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

function validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const name = field.name;
    let isValid = true;
    let errorMessage = '';

    // Remove existing error
    removeFieldError(field);

    // Required check
    if (field.required && !value) {
        isValid = false;
        errorMessage = 'Dette feltet er påkrevd';
    }

    // Email validation
    else if (type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Vennligst oppgi en gyldig e-postadresse';
        }
    }

    // Phone validation (Norwegian format)
    else if (name === 'phone' && value) {
        const phoneRegex = /^(\+47|0047)?[\s]?[2-9]\d{7}$/;
        const cleanPhone = value.replace(/\s/g, '');
        if (!phoneRegex.test(cleanPhone) && value.length < 8) {
            isValid = false;
            errorMessage = 'Vennligst oppgi et gyldig telefonnummer';
        }
    }

    // Show error if invalid
    if (!isValid) {
        showFieldError(field, errorMessage);
    }

    return isValid;
}

function showFieldError(field, message) {
    field.classList.add('error');
    field.style.borderColor = '#DC3545';

    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.color = '#DC3545';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '4px';

    field.parentNode.appendChild(errorDiv);
}

function removeFieldError(field) {
    field.classList.remove('error');
    field.style.borderColor = '';

    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

function showFormMessage(message, type) {
    const formMessage = document.getElementById('form-message');

    if (formMessage) {
        formMessage.textContent = message;
        formMessage.className = 'form-message ' + type;
        formMessage.style.display = 'block';
    }
}

// Simulate form submission (replace with actual API call)
function simulateFormSubmission(data) {
    return new Promise((resolve, reject) => {
        console.log('Form data:', data);

        // Simulate network delay
        setTimeout(() => {
            // Simulate 95% success rate
            if (Math.random() > 0.05) {
                resolve({ success: true });
            } else {
                reject(new Error('Simulated error'));
            }
        }, 1500);
    });
}

/* ========================================
   RESEND API INTEGRATION
   ======================================== */

// Uncomment and configure when ready to use Resend API
/*
async function sendEmailWithResend(formData) {
    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer YOUR_RESEND_API_KEY',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: 'noreply@lekvenanlegg.no',
            to: 'post@lekvenanlegg.no',
            subject: `Ny henvendelse fra ${formData.name} - ${formData.projectType}`,
            html: `
                <h2>Ny henvendelse fra nettsiden</h2>
                <p><strong>Navn:</strong> ${formData.name}</p>
                <p><strong>E-post:</strong> ${formData.email}</p>
                <p><strong>Telefon:</strong> ${formData.phone}</p>
                <p><strong>Adresse:</strong> ${formData.address || 'Ikke oppgitt'}</p>
                <p><strong>Type prosjekt:</strong> ${formData.projectType}</p>
                <p><strong>Ønsker befaring:</strong> ${formData.wantSiteVisit ? 'Ja' : 'Nei'}</p>
                <hr>
                <p><strong>Beskrivelse:</strong></p>
                <p>${formData.description}</p>
                <hr>
                <p><small>Sendt: ${new Date().toLocaleString('no-NO')}</small></p>
            `
        })
    });

    if (!response.ok) {
        throw new Error('Failed to send email');
    }

    return response.json();
}
*/

/* ========================================
   SCROLL ANIMATIONS
   ======================================== */

function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements that should animate on scroll
    const animateElements = document.querySelectorAll(
        '.service-card, .why-us-item, .value-card, .project-card'
    );

    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

/* ========================================
   CLICK TO CALL (Mobile)
   ======================================== */

function initClickToCall() {
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');

    phoneLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Track phone clicks (if analytics is set up)
            if (typeof gtag !== 'undefined') {
                gtag('event', 'click', {
                    event_category: 'Contact',
                    event_label: 'Phone Call',
                    value: 1
                });
            }
        });
    });
}

/* ========================================
   UTILITY FUNCTIONS
   ======================================== */

// Debounce function for scroll events
function debounce(func, wait = 20, immediate = true) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// Format phone number for display
function formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 8) {
        return cleaned.replace(/(\d{3})(\d{2})(\d{3})/, '$1 $2 $3');
    }
    return phone;
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/* ========================================
   SERVICE WORKER REGISTRATION (PWA Ready)
   ======================================== */

// Uncomment to enable service worker
/*
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered:', registration);
            })
            .catch(error => {
                console.log('SW registration failed:', error);
            });
    });
}
*/

/* ========================================
   GOOGLE MAPS INITIALIZATION
   ======================================== */

// Initialize Google Maps (if API key is provided)
function initMap() {
    const mapContainer = document.getElementById('google-map');

    if (mapContainer && typeof google !== 'undefined') {
        const location = { lat: 59.42, lng: 9.07 }; // Bø i Telemark coordinates

        const map = new google.maps.Map(mapContainer, {
            zoom: 12,
            center: location,
            styles: [
                {
                    featureType: 'all',
                    elementType: 'geometry.fill',
                    stylers: [{ saturation: -30 }]
                }
            ]
        });

        const marker = new google.maps.Marker({
            position: location,
            map: map,
            title: 'Lekven Anlegg & Maskin'
        });

        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="padding: 10px;">
                    <strong>Lekven Anlegg & Maskin</strong><br>
                    Folkestadvegen 340<br>
                    3804 Bø i Telemark
                </div>
            `
        });

        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
    }
}

// Make initMap available globally for Google Maps callback
window.initMap = initMap;
