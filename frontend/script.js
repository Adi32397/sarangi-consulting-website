document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Mobile Navigation Toggle
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    
    if (mobileMenuToggle && mobileNav) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileNav.classList.toggle('active');
            const icon = mobileMenuToggle.querySelector('i');
            if (mobileNav.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // Close mobile menu when a link is clicked
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.remove('active');
                mobileMenuToggle.querySelector('i').classList.remove('fa-times');
                mobileMenuToggle.querySelector('i').classList.add('fa-bars');
            });
        });
    }

    // 2. Sticky Header Effect
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 3. Scroll Reveal Animations
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
    
    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: Stop observing once revealed
                // observer.unobserve(entry.target); 
            }
        });
    };
    
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };
    
    const revealObserver = new IntersectionObserver(revealCallback, revealOptions);
    
    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // 4. Counter Animation for Statistics
    const counters = document.querySelectorAll('.counter');
    let hasCounted = false;

    const countUp = () => {
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // 60fps
            
            let current = 0;
            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.innerText = Math.ceil(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.innerText = target;
                }
            };
            
            updateCounter();
        });
    };

    // Trigger counter when stats section is in view
    const statsSection = document.querySelector('.social-proof');
    
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !hasCounted) {
                countUp();
                hasCounted = true;
            }
        }, { threshold: 0.5 });
        
        statsObserver.observe(statsSection);
    }

        // 5. Page Load Logic
    const loader = document.getElementById('page-loader');
    const counter = document.getElementById('loader-count');
    const laser = document.getElementById('loader-laser');
    
    // Make all sections visible since we are in MPA mode
    document.querySelectorAll('.page-section').forEach(sec => {
        sec.classList.add('active-page');
    });

    if (loader && counter) {
        loader.classList.add('active'); // show loader
        
        let count = 1;
        counter.innerText = count;
        if (laser) laser.style.width = '10%';
        
        const countInterval = setInterval(() => {
            count += 1;
            counter.innerText = count;
            if (laser) laser.style.width = (count * 10) + '%';
            
            if (count >= 10) {
                clearInterval(countInterval);
                
                // Hide loader
                setTimeout(() => {
                    loader.classList.remove('active');
                    
                    // Reset animations then trigger them
                    document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => el.classList.remove('active'));
                    setTimeout(() => {
                        document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => el.classList.add('active'));
                    }, 100);
                }, 200);
            }
        }, 120);
    } else {
        document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => el.classList.add('active'));
    }

    // Set active link in nav based on current URL
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .mobile-nav-links a').forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href.includes(currentPage) && currentPage !== '') {
            link.classList.add('active');
        } else if ((currentPage === '' || currentPage === 'index.html') && (href === '../index.html' || href === 'index.html')) {
            link.classList.add('active');
        }
    });

    // 6. Contact Form Logic
    const contactForm = document.getElementById('mainContactForm');
    const contactSubmitBtn = document.getElementById('contactSubmitBtn');
    const successPopup = document.getElementById('successPopup');
    const closePopupBtn = document.getElementById('closePopupBtn');
    const fileInput = document.getElementById('contactFile');
    const fileNameDisplay = document.getElementById('fileNameDisplay');

    if (contactForm) {
        // Floating label value check
        const floatingInputs = document.querySelectorAll('.floating-group .form-control');
        
        const checkValue = (input) => {
            if (input.value.trim() !== '') {
                input.classList.add('has-value');
            } else {
                input.classList.remove('has-value');
            }
        };

        floatingInputs.forEach(input => {
            // Initial check
            checkValue(input);
            // On input
            input.addEventListener('input', () => checkValue(input));
            // On blur (for autocomplete cases)
            input.addEventListener('blur', () => checkValue(input));
        });

        // File upload display
        if (fileInput && fileNameDisplay) {
            fileInput.addEventListener('change', function() {
                if (this.files && this.files.length > 0) {
                    fileNameDisplay.textContent = "Selected: " + this.files[0].name;
                } else {
                    fileNameDisplay.textContent = "";
                }
            });
        }

        // Form Submission
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Basic HTML5 validation trigger
            if (!contactForm.checkValidity()) {
                contactForm.reportValidity();
                return;
            }

            // Simulate loading
            const btnText = contactSubmitBtn.querySelector('.btn-text');
            const btnLoader = contactSubmitBtn.querySelector('.btn-loader');
            
            contactSubmitBtn.disabled = true;
            btnText.classList.add('hidden');
            btnLoader.classList.remove('hidden');

            setTimeout(() => {
                // Reset button
                contactSubmitBtn.disabled = false;
                btnText.classList.remove('hidden');
                btnLoader.classList.add('hidden');
                
                // Show success popup
                if (successPopup) {
                    successPopup.classList.add('show');
                }
                
                // Reset form
                contactForm.reset();
                floatingInputs.forEach(input => checkValue(input));
                if(fileNameDisplay) fileNameDisplay.textContent = "";
                
            }, 1500); // 1.5s simulated network request
        });
    }

    if (closePopupBtn && successPopup) {
        closePopupBtn.addEventListener('click', () => {
            successPopup.classList.remove('show');
        });
    }

    // 7. Daily Countdown Timer Logic (Multiple Timers)
    function updateTimers() {
        const now = new Date();
        // Calculate time until 23:59:59 tonight
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        const diff = endOfDay - now;

        if (diff <= 0) return;

        // Format numbers to always have two digits (e.g., '09' instead of '9')
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
        const mins = Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, '0');
        const secs = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');

        // Find all countdown wrappers and update them
        const wrappers = document.querySelectorAll('.countdown-wrapper');
        wrappers.forEach(wrapper => {
            const hSpan = wrapper.querySelector('.t-hours');
            const mSpan = wrapper.querySelector('.t-mins');
            const sSpan = wrapper.querySelector('.t-secs');

            if (hSpan) hSpan.textContent = hours;
            if (mSpan) mSpan.textContent = mins;
            if (sSpan) sSpan.textContent = secs;
        });
    }

    // Initialize immediately, then update every second
    updateTimers();
    setInterval(updateTimers, 1000);

});
