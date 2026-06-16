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

    // 5. SPA Routing Logic
    const handleRoute = () => {
        let hash = window.location.hash;
        if (!hash || hash === '#') {
            hash = '#home';
        }
        
        const pageId = hash.replace('#', '');
        const pageSections = document.querySelectorAll(`.page-section[data-page="${pageId}"]`);
        
        if (pageSections.length > 0) {
            // It's a top-level page route
            document.querySelectorAll('.page-section').forEach(sec => {
                sec.classList.remove('active-page');
            });
            
            pageSections.forEach(sec => {
                sec.classList.add('active-page');
                // Trigger reveal animations for newly shown sections
                setTimeout(() => {
                    sec.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => el.classList.add('active'));
                }, 100);
            });
            
            // Update active state in navigation
            document.querySelectorAll('.nav-links a, .mobile-nav-links a').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === hash) {
                    link.classList.add('active');
                }
            });
            
            // Scroll to top when changing pages
            window.scrollTo(0, 0);
            
        } else {
            // Might be an anchor link to a section inside a page (e.g. from a button)
            const targetElement = document.getElementById(pageId);
            if (targetElement) {
                // Find parent page
                const parentPage = targetElement.closest('.page-section');
                
                if (parentPage) {
                    const parentPageId = parentPage.getAttribute('data-page');
                    
                    // Switch to that page first
                    document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active-page'));
                    document.querySelectorAll(`.page-section[data-page="${parentPageId}"]`).forEach(sec => sec.classList.add('active-page'));
                    
                    // Update active nav link to the parent page
                    document.querySelectorAll('.nav-links a, .mobile-nav-links a').forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${parentPageId}`) {
                            link.classList.add('active');
                        }
                    });
                    
                    // Scroll to the specific section
                    setTimeout(() => {
                        const headerOffset = 80;
                        const elementPosition = targetElement.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    }, 50);
                }
            }
        }
    };

    // Initialize routing on load and on hash change
    window.addEventListener('hashchange', handleRoute);
    handleRoute();

});
