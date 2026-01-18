window.addEventListener("load", () => {
    // --- CONFIGURATION ---
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzej-nFg1KXUm6I6peJe3HE4pNsZlpTvaXqRUPQScMxgxAa9rYN__iPaJz4vFUgymkzFQ/exec";

    // --- OBSERVERS & INITIALIZERS ---
    // --- INITIALIZE ALL PAGE FUNCTIONS ---
    initModal();
    initVideoModal();
    initSmoothScroll();
    initFooter();
    initBackToTopButton();

    // Hide preloader
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.classList.add('loaded');

    function initModal() {
        const modal = document.getElementById('contact-modal');
        if (!modal) return;

        const form = document.getElementById('contact-form');
        const openButtons = document.querySelectorAll('.open-modal-btn');
        const closeButton = document.querySelector('.modal-close-btn');
        const selectedPlanEl = document.getElementById('selected-plan-name');
        const planSelect = document.getElementById('plan');
        const meetingTimeInput = document.getElementById('meeting-time');
        const focusableElements = 'button, [href], input, [tabindex]:not([tabindex="-1"])';

        openButtons.forEach(button => {
            button.addEventListener('click', () => {
                const planName = button.dataset.plan;
                selectedPlanEl.textContent = planName;
                planSelect.value = planName;

                // Set min attribute for datetime-local input to the current time
                const now = new Date();
                // Adjust for timezone offset
                now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                // Format to 'YYYY-MM-DDTHH:mm'
                const yyyy = now.getFullYear();
                const mm = String(now.getMonth() + 1).padStart(2, '0');
                const dd = String(now.getDate()).padStart(2, '0');
                const hh = String(now.getHours()).padStart(2, '0');
                const min = String(now.getMinutes()).padStart(2, '0');
                meetingTimeInput.min = `${yyyy}-${mm}-${dd}T${hh}:${min}`;

                modal.removeAttribute('aria-hidden');
                // Focus the first focusable element in the modal
                document.addEventListener('keydown', handleModalKeys);
                modal.querySelector(focusableElements).focus();
            });
        });

        const closeModal = () => {
            modal.setAttribute('aria-hidden', 'true');
            form.reset();
            document.removeEventListener('keydown', handleModalKeys);
            document.querySelector('.form-status').innerHTML = '';
        };

        // Keyboard accessibility
        const handleModalKeys = (e) => {
            if (e.key === 'Tab') {
                const modalFocusables = Array.from(modal.querySelectorAll(focusableElements));
                const firstElement = modalFocusables[0];
                const lastElement = modalFocusables[modalFocusables.length - 1];

                if (e.shiftKey) { // Shift + Tab
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else { // Tab
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            } else if (e.key === 'Escape') {
                closeModal();
            }
        };

        // Consolidated close events
        [closeButton, modal].forEach(el => el.addEventListener('click', (e) => {
            if (e.target === modal || e.target === closeButton) closeModal();
        }));

        form.addEventListener('submit', handleFormSubmit);
    }

    function initVideoModal() {
        const videoModal = document.getElementById('video-modal');
        if (!videoModal) return;

        const openButtons = document.querySelectorAll('.open-video-btn');
        const closeButton = videoModal.querySelector('.modal-close-btn');
        const iframe = videoModal.querySelector('iframe');

        openButtons.forEach(button => {
            button.addEventListener('click', () => {
                const videoSrc = button.dataset.videoSrc;
                if (videoSrc) {
                    iframe.src = videoSrc;
                    videoModal.removeAttribute('aria-hidden');
                }
            });
        });

        const closeVideoModal = () => {
            videoModal.setAttribute('aria-hidden', 'true');
            iframe.src = ""; // Stop the video from playing in the background
        };

        // Consolidated close events
        [closeButton, videoModal].forEach(el => el.addEventListener('click', (e) => {
            if (e.target === videoModal || e.target === closeButton) closeVideoModal();
        }));
    }

    function initSmoothScroll() {
        const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    function initBackToTopButton() {
        const backToTopButton = document.getElementById('back-to-top');
        if (!backToTopButton) return;

        // Show or hide the button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) { // Show button after scrolling 300px
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        });

        // Smooth scroll to top on click
        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    function initFooter() {
        const yearSpan = document.getElementById('copyright-year');
        if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    }

    // --- FORM HANDLING ---
    function handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const statusEl = form.querySelector('.form-status');
        const formData = new FormData(form);

        statusEl.textContent = 'Submitting...';
        statusEl.className = 'form-status';
        submitBtn.disabled = true;

        fetch(SCRIPT_URL, {
                method: 'POST',
                body: formData
            })
            .then(response => {
                // Google Apps Script redirects on success, so we check for a redirect response.
                // A type of 'opaque' also indicates a successful 'no-cors' submission if you stick with that.
                if (response.ok || response.type === 'opaque' || (response.status === 0 && response.type === 'cors')) {
                    return response; // Or a resolved promise
                }
                // If the server returns an error, we can catch it here.
                throw new Error('Network response was not ok.');
            })
            .then(() => {
                statusEl.textContent = 'Success! We will be in touch shortly.';
                statusEl.classList.add('success');
                form.reset();
            })
            .catch(error => {
                statusEl.textContent = 'An error occurred. Please try again.';
                statusEl.classList.add('error');
                console.error('Error!', error.message);
            })
            .finally(() => {
                submitBtn.disabled = false;
            });
    }

});