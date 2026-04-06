/* =========================================
   SITE NAVIGATION — Hamburger + Dropdown
   Works on all pages that include this script.
   ========================================= */
(function () {
    'use strict';

    const mobileBtn = document.getElementById('mobile-menu-btn');
    const menu      = document.getElementById('main-menu');
    const dropItems = Array.from(document.querySelectorAll('.nav-item--has-dropdown'));

    if (!mobileBtn || !menu) return;

    /* ── Hamburger toggle ── */
    mobileBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        const isOpen = menu.classList.toggle('is-open');
        /* body.nav-open activates the CSS scrim on mobile */
        document.body.classList.toggle('nav-open', isOpen);
        mobileBtn.setAttribute('aria-expanded', String(isOpen));
        mobileBtn.querySelector('.material-symbols-outlined').textContent =
            isOpen ? 'close' : 'menu';
    });

    /* ── Dropdown / Accordion toggle ── */
    dropItems.forEach(function (item) {
        const trigger = item.querySelector('.nav-dropdown-trigger');

        trigger.addEventListener('click', function (e) {
            e.stopPropagation();
            const isOpen = item.getAttribute('data-open') === 'true';

            /* close other open dropdowns first */
            dropItems.forEach(function (other) {
                if (other !== item) {
                    other.removeAttribute('data-open');
                    other.querySelector('.nav-dropdown-trigger')
                         .setAttribute('aria-expanded', 'false');
                }
            });

            if (isOpen) {
                item.removeAttribute('data-open');
                trigger.setAttribute('aria-expanded', 'false');
            } else {
                item.setAttribute('data-open', 'true');
                trigger.setAttribute('aria-expanded', 'true');
            }
        });
    });

    /* ── Close on outside click / scrim tap ── */
    document.addEventListener('click', function (e) {
        /* Scrim is body::before — clicks on it bubble to body */
        if (!e.target.closest('#main-menu') && !e.target.closest('#mobile-menu-btn')) {
            closeAll();
        }
    });

    /* ── Close on Escape ── */
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeAll();
    });

    function closeAll() {
        dropItems.forEach(function (item) {
            item.removeAttribute('data-open');
            item.querySelector('.nav-dropdown-trigger')
                .setAttribute('aria-expanded', 'false');
        });
        menu.classList.remove('is-open');
        document.body.classList.remove('nav-open');
        mobileBtn.setAttribute('aria-expanded', 'false');
        mobileBtn.querySelector('.material-symbols-outlined').textContent = 'menu';
    }
})();

/* ── M3 Collapsing Top Bar Logic ── */
(function initM3Scroll() {
    const topBar = document.querySelector('.m3-top-bar');
    if (!topBar) return;

    window.addEventListener('scroll', function () {
        requestAnimationFrame(function () {
            if (window.scrollY > 124) {
                topBar.classList.add('scrolled');
            } else {
                topBar.classList.remove('scrolled');
            }
        });
    });
})();
