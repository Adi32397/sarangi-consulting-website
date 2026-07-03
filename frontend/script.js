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
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Basic HTML5 validation trigger
            if (!contactForm.checkValidity()) {
                contactForm.reportValidity();
                return;
            }

            const btnText = contactSubmitBtn.querySelector('.btn-text');
            const btnLoader = contactSubmitBtn.querySelector('.btn-loader');
            
            contactSubmitBtn.disabled = true;
            btnText.classList.add('hidden');
            btnLoader.classList.remove('hidden');

            const selectedMethod = document.querySelector('input[name="contactMethod"]:checked');
            const methodVal = selectedMethod ? selectedMethod.value : 'Email';

            const userMessage = document.getElementById('contactDetails').value;
            const extraDetails = `Project Type: ${document.getElementById('contactProjectType').value}\nBudget: ${document.getElementById('contactBudget').value}\nTimeline: ${document.getElementById('contactTimeline').value}\nPreferred Contact: ${methodVal}\nBest Time: ${document.getElementById('contactTime').value}`;

            // Construct payload mapping to our Lead Schema
            const payload = {
                customerName: document.getElementById('contactName').value,
                company: document.getElementById('contactCompany').value,
                email: document.getElementById('contactEmail').value,
                phone: document.getElementById('contactPhone').value,
                serviceInterested: document.getElementById('contactService').value,
                leadSource: document.getElementById('contactSource').value || 'Website',
                priority: 'Medium',
                status: 'New',
                message: userMessage + '\n\n---\n' + extraDetails
            };

            try {
                const res = await fetch('http://localhost:5000/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                const json = await res.json();
                if (json.success) {
                    if (successPopup) {
                        successPopup.classList.add('show');
                    }
                    contactForm.reset();
                    floatingInputs.forEach(input => checkValue(input));
                    if(fileNameDisplay) fileNameDisplay.textContent = "";
                } else {
                    alert('Failed to submit form: ' + (json.message || JSON.stringify(json.errors)));
                }
            } catch (err) {
                console.error('Contact form submission error:', err);
                alert('An error occurred while submitting your request. Please try again.');
            } finally {
                contactSubmitBtn.disabled = false;
                btnText.classList.remove('hidden');
                btnLoader.classList.add('hidden');
            }
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

    // 8. Dynamic Banner Rendering
    async function renderDynamicBanners(isManual = false) {
        try {
            const res = await fetch('http://localhost:5000/api/banners?status=Active');
            const data = await res.json();
            
            if (data.success && data.data && data.data.length > 0) {
                // Determine current page context
                const currentPage = window.location.pathname.split('/').pop() || 'index.html';
                // Map page to display_position
                let position = 'Other';
                if (currentPage === 'index.html' || currentPage === '') position = 'Homepage';
                else if (currentPage.includes('about')) position = 'About';
                else if (currentPage.includes('service')) position = 'Services';
                else if (currentPage.includes('login') || currentPage.includes('contact')) position = 'Sidebar';
                
                // Filter banners for the current position
                let pageBanners = data.data.filter(b => b.display_position === position);
                
                if (isManual && pageBanners.length === 0) {
                    pageBanners = data.data; // Fallback to all active banners if triggered manually
                }
                
                if (pageBanners.length > 0) {
                    // Sort by priority (lower number = higher priority)
                    pageBanners.sort((a, b) => a.priority - b.priority);
                    const banner = pageBanners[0];
                    
                    // Construct Banner HTML as a Popup Modal
                    const bannerImgSrc = banner.image.startsWith('http') ? banner.image : `http://localhost:5000${banner.image.startsWith('/') ? '' : '/'}${banner.image}`;
                    
                    // Remove existing popup if it exists
                    const existingPopup = document.getElementById('dynamic-banner-popup');
                    if (existingPopup) existingPopup.remove();
                    
                    const bannerHtml = `
                        <div id="dynamic-banner-popup" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 9999; backdrop-filter: blur(4px);">
                            <div id="dynamic-banner-content" style="background: white; border-radius: 12px; padding: 24px; max-width: 500px; width: 90%; text-align: center; position: relative; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); animation: popupIn 0.3s ease-out forwards; cursor: pointer;">
                                <button id="dynamic-banner-close" onclick="document.getElementById('dynamic-banner-popup').remove()" style="position: absolute; right: 16px; top: 16px; background: #f1f5f9; border: none; color: #64748b; cursor: pointer; width: 32px; height: 32px; border-radius: 50%; font-size: 18px; display: flex; justify-content: center; align-items: center; transition: 0.2s; z-index: 2;">&times;</button>
                                
                                ${banner.image && !banner.image.includes('via.placeholder.com') ? `<img src="${bannerImgSrc}" style="width: 100%; max-height: 200px; border-radius: 8px; object-fit: cover; margin-bottom: 20px; pointer-events: none;">` : ''}
                                
                                <h3 style="margin: 0 0 12px 0; font-family: 'Montserrat', sans-serif; font-size: 22px; font-weight: 700; color: #1e293b; pointer-events: none;">${banner.title}</h3>
                                ${banner.subtitle ? `<p style="margin: 0 0 20px 0; font-size: 15px; color: #64748b; line-height: 1.5; pointer-events: none;">${banner.subtitle}</p>` : ''}
                                
                                ${banner.button_text && banner.button_url ? `
                                <a href="${banner.button_url}" id="dynamic-banner-btn" class="btn btn-primary" style="display: inline-block; width: 100%; text-decoration: none; position: relative; z-index: 2;">${banner.button_text}</a>
                                ` : ''}
                            </div>
                        </div>
                        <style>
                            @keyframes popupIn {
                                from { opacity: 0; transform: scale(0.9) translateY(20px); }
                                to { opacity: 1; transform: scale(1) translateY(0); }
                            }
                        </style>
                    `;
                    
                    // Insert dynamic banner popup into the body
                    document.body.insertAdjacentHTML('beforeend', bannerHtml);
                    
                    // Track View
                    fetch(`http://localhost:5000/api/banners/${banner.id}/view`, { method: 'PUT' }).catch(console.error);
                    
                    // Track Click on entire content
                    const bannerContent = document.getElementById('dynamic-banner-content');
                    if (bannerContent) {
                        bannerContent.addEventListener('click', (e) => {
                            // Don't track if they clicked the close button
                            if (e.target.closest('#dynamic-banner-close')) return;
                            
                            // Prevent tracking twice if they click the button explicitly
                            if (e.target.closest('#dynamic-banner-btn')) {
                                e.preventDefault();
                            }
                            
                            fetch(`http://localhost:5000/api/banners/${banner.id}/click`, { method: 'PUT' })
                                .catch(console.error)
                                .finally(() => {
                                    if (banner.button_url) {
                                        window.location.href = banner.button_url;
                                    }
                                });
                        });
                    }
                }
            }
        } catch (err) {
            console.error('Error fetching dynamic banners:', err);
        }
    }
    
    // Call the function
    renderDynamicBanners(false);
    
    // Expose for manual triggering
    window.showAnnouncementBanners = () => renderDynamicBanners(true);

});
