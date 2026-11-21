/* =========================================================
   Portfolio interactivity
   1. Header shadow on scroll
   2. Highlight the current section in the nav
   3. Fade sections in as they scroll into view
   4. Contact form validation
   5. Project filter
   6. Hamburger menu
   ========================================================= */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 1. Header shadow on scroll ---------- */
const header = document.querySelector('.site-header');

function updateHeaderShadow() {
    header.classList.toggle('is-scrolled', window.scrollY > 0);
}

window.addEventListener('scroll', updateHeaderShadow, { passive: true });
updateHeaderShadow();

/* ---------- 2. Highlight the current section in the nav ---------- */
const navLinks = document.querySelectorAll('.nav-list a');
const sections = document.querySelectorAll('main .section');

function setActiveLink(id) {
    navLinks.forEach((link) => {
        if (link.getAttribute('href') === `#${id}`) {
            link.setAttribute('aria-current', 'true');
        } else {
            link.removeAttribute('aria-current');
        }
    });
}

// A section counts as "current" when it crosses the middle of the screen
const navObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) setActiveLink(entry.target.id);
        });
    },
    { rootMargin: '-50% 0px -50% 0px' }
);

sections.forEach((section) => navObserver.observe(section));

/* ---------- 3. Fade sections in as they scroll into view ---------- */
// The .reveal class is added here, not in the HTML, so content
// stays visible if JavaScript doesn't load.
if (!prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 }
    );

    sections.forEach((section) => {
        // The intro is already on screen, so it has its own CSS load animation
        if (section.classList.contains('hero')) return;
        section.classList.add('reveal');
        revealObserver.observe(section);
    });
}

/* ---------- 4. Contact form validation ---------- */
const form = document.getElementById('contact-form');

if (form) {
    // Turn off the browser's built-in pop-ups; we show our own messages.
    // Without JavaScript, the HTML "required" attributes still work.
    form.setAttribute('novalidate', '');

    const submitButton = form.querySelector('button[type="submit"]');
    const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    // Rules for each field: return an error message, or '' if valid
    const rules = {
        name(value) {
            if (!value) return 'Please enter your name.';
            if (value.length < 2) return 'Name must be at least 2 characters.';
            return '';
        },
        email(value) {
            if (!value) return 'Please enter your email address.';
            if (!EMAIL_PATTERN.test(value)) return 'Please enter a valid email, like name@example.com.';
            return '';
        },
        subject(value) {
            if (value.length > 100) return 'Subject must be 100 characters or fewer.';
            return '';
        },
        message(value) {
            if (!value) return 'Please enter a message.';
            if (value.length < 10) return 'Message must be at least 10 characters.';
            if (value.length > 1000) return 'Message must be 1000 characters or fewer.';
            return '';
        },
    };

    const fields = Object.keys(rules).map((name) => form.elements[name]);

    // Add an error message element under each field and link it
    // to the field so screen readers read the error aloud
    fields.forEach((field) => {
        const error = document.createElement('p');
        error.className = 'error-message';
        error.id = `${field.id}-error`;
        field.insertAdjacentElement('afterend', error);
        field.setAttribute('aria-describedby', error.id);
    });

    // Character counter for the message
    const message = form.elements.message;
    const counter = document.createElement('p');
    counter.className = 'char-count';
    counter.setAttribute('aria-live', 'polite');
    message.parentElement.appendChild(counter);

    function updateCounter() {
        const length = message.value.length;
        counter.textContent = `${length} / 1000`;
        counter.classList.toggle('is-over', length > 1000);
    }
    updateCounter();

    // Status message shown after submitting
    const status = document.createElement('p');
    status.className = 'form-status';
    status.setAttribute('role', 'status');
    form.appendChild(status);

    function validateField(field) {
        const error = document.getElementById(`${field.id}-error`);
        const errorText = rules[field.name](field.value.trim());

        error.textContent = errorText;
        field.classList.toggle('is-invalid', Boolean(errorText));
        field.setAttribute('aria-invalid', errorText ? 'true' : 'false');

        return !errorText;
    }

    fields.forEach((field) => {
        // Check a field when the user leaves it...
        field.addEventListener('blur', () => {
            if (field.value.trim() || field.dataset.touched) {
                field.dataset.touched = 'true';
                validateField(field);
            }
        });

        // ...then re-check as they type, so the error clears as soon as it's fixed
        field.addEventListener('input', () => {
            if (field.dataset.touched) validateField(field);
            status.textContent = '';
        });
    });

    message.addEventListener('input', updateCounter);

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        status.className = 'form-status';
        status.textContent = '';

        fields.forEach((field) => (field.dataset.touched = 'true'));
        const results = fields.map(validateField);
        const firstInvalid = fields[results.indexOf(false)];

        if (firstInvalid) {
            firstInvalid.focus();
            status.classList.add('is-error');
            status.textContent = 'Please fix the highlighted fields.';
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';

        try {
            // TODO: replace this with a real request to your form service, e.g.
            // await fetch('https://formspree.io/f/YOUR_ID', {
            //     method: 'POST',
            //     body: new FormData(form),
            //     headers: { Accept: 'application/json' },
            // });
            await new Promise((resolve) => setTimeout(resolve, 800));

            const name = form.elements.name.value.trim();
            form.reset();
            fields.forEach((field) => {
                delete field.dataset.touched;
                field.classList.remove('is-invalid');
                field.removeAttribute('aria-invalid');
            });
            updateCounter();

            status.classList.add('is-success');
            status.textContent = `Thanks, ${name}! Your message has been sent.`;
        } catch {
            status.classList.add('is-error');
            status.textContent = 'Something went wrong. Please try again.';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Send Message';
        }
    });
}

/* ---------- 5. Project filter ---------- */
const filterBar = document.querySelector('.project-filters');
const filterStatus = document.querySelector('.filter-status');
const projects = Array.from(document.querySelectorAll('.project'));

if (filterBar && projects.length) {
    // Read each project's tags, e.g. data-tags="HTML, CSS" -> ['HTML', 'CSS']
    projects.forEach((project) => {
        project.tags = (project.dataset.tags || '')
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean);

        // Show the tags on the card as small labels
        if (project.tags.length) {
            const tagList = document.createElement('ul');
            tagList.className = 'project-tags';
            tagList.setAttribute('aria-label', 'Technologies');
            project.tags.forEach((tag) => {
                const item = document.createElement('li');
                item.textContent = tag;
                tagList.appendChild(item);
            });
            project.appendChild(tagList);
        }
    });

    // One button for "All", then one per unique tag in the order they first appear
    const allTags = [...new Set(projects.flatMap((project) => project.tags))];
    const filters = ['All', ...allTags];

    const buttons = filters.map((filter) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'filter-button';
        button.textContent = filter;
        button.dataset.filter = filter;
        button.setAttribute('aria-pressed', filter === 'All' ? 'true' : 'false');
        filterBar.appendChild(button);
        return button;
    });

    function applyFilter(filter) {
        let visibleCount = 0;

        projects.forEach((project) => {
            const matches = filter === 'All' || project.tags.includes(filter);
            const wasHidden = project.hidden;
            project.hidden = !matches;

            if (matches) {
                visibleCount++;
                // Replay the fade-in on cards that were hidden
                if (wasHidden && !prefersReducedMotion) {
                    project.classList.remove('is-entering');
                    void project.offsetWidth; // restarts the CSS animation
                    project.classList.add('is-entering');
                }
            }
        });

        buttons.forEach((button) => {
            button.setAttribute('aria-pressed', button.dataset.filter === filter ? 'true' : 'false');
        });

        const label = visibleCount === 1 ? 'project' : 'projects';
        filterStatus.textContent =
            filter === 'All'
                ? `Showing all ${projects.length} projects`
                : `Showing ${visibleCount} ${label} using ${filter}`;
    }

    filterBar.addEventListener('click', (event) => {
        const button = event.target.closest('.filter-button');
        if (button) applyFilter(button.dataset.filter);
    });

    applyFilter('All');
}

/* ---------- 6. Hamburger menu ---------- */
const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.getElementById('site-nav');

if (menuToggle && siteNav) {
    // Must match the tablet breakpoint in style.css
    const desktopQuery = window.matchMedia('(min-width: 600px)');

    function isMenuOpen() {
        return menuToggle.getAttribute('aria-expanded') === 'true';
    }

    function openMenu() {
        menuToggle.setAttribute('aria-expanded', 'true');
        siteNav.classList.add('is-open');
    }

    function closeMenu({ returnFocus = false } = {}) {
        menuToggle.setAttribute('aria-expanded', 'false');
        siteNav.classList.remove('is-open');
        if (returnFocus) menuToggle.focus();
    }

    menuToggle.addEventListener('click', () => {
        if (isMenuOpen()) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    // Close after choosing a link
    siteNav.addEventListener('click', (event) => {
        if (event.target.closest('a')) closeMenu();
    });

    // Close with the Escape key and put focus back on the button
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && isMenuOpen()) closeMenu({ returnFocus: true });
    });

    // Close when clicking anywhere outside the header
    document.addEventListener('click', (event) => {
        if (isMenuOpen() && !header.contains(event.target)) closeMenu();
    });

    // Close if the screen gets wide enough to show the full nav
    desktopQuery.addEventListener('change', (event) => {
        if (event.matches) closeMenu();
    });
}
