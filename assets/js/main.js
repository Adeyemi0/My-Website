/**
 * Optimized Main JS - Performance Enhanced
 * Improvements: Batched DOM operations, RAF for scroll, reduced reflows
 */
(function() {
  "use strict";

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all)
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener))
      } else {
        selectEl.addEventListener(type, listener)
      }
    }
  }

  /**
   * Throttle function for performance
   */
  const throttle = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  /**
   * RequestAnimationFrame-based scroll handler
   */
  let rafId = null;
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        listener();
        rafId = null;
      });
    });
  }

  /**
   * Navbar links active state on scroll - Optimized with batching
   */
  let navbarlinks = select('#navbar .scrollto', true)
  const navbarlinksActive = () => {
    if (!navbarlinks.length) return;
    
    let position = window.scrollY + 200;
    
    // Batch DOM reads
    const sections = navbarlinks.map(navbarlink => {
      if (!navbarlink.hash) return null;
      let section = select(navbarlink.hash);
      if (!section) return null;
      return {
        link: navbarlink,
        top: section.offsetTop,
        height: section.offsetHeight
      };
    }).filter(Boolean);
    
    // Batch DOM writes
    sections.forEach(({link, top, height}) => {
      if (position >= top && position <= (top + height)) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  window.addEventListener('load', navbarlinksActive)
  onscroll(document, navbarlinksActive)

  /**
   * Scrolls to an element with header offset
   */
  const scrollto = (el) => {
    let header = select('#header')
    if (!header) return;
    
    let offset = header.offsetHeight

    if (!header.classList.contains('header-scrolled')) {
      offset -= 16
    }

    let elementPos = select(el).offsetTop
    window.scrollTo({
      top: elementPos - offset,
      behavior: 'smooth'
    })
  }

  /**
   * Header fixed top on scroll - Optimized
   */
  let selectHeader = select('#header')
  if (selectHeader) {
    let headerOffset = selectHeader.offsetTop
    let nextElement = selectHeader.nextElementSibling
    
    const headerFixed = throttle(() => {
      const shouldBeFixed = (headerOffset - window.scrollY) <= 0;
      
      // Batch class changes
      if (shouldBeFixed) {
        selectHeader.classList.add('fixed-top');
        if (nextElement) nextElement.classList.add('scrolled-offset');
      } else {
        selectHeader.classList.remove('fixed-top');
        if (nextElement) nextElement.classList.remove('scrolled-offset');
      }
    }, 50);
    
    window.addEventListener('load', headerFixed)
    onscroll(document, headerFixed)
  }

  /**
   * Back to top button - Optimized
   */
  let backtotop = select('.back-to-top')
  if (backtotop) {
    const toggleBacktotop = throttle(() => {
      if (window.scrollY > 100) {
        backtotop.classList.add('active')
      } else {
        backtotop.classList.remove('active')
      }
    }, 100);
    
    window.addEventListener('load', toggleBacktotop)
    onscroll(document, toggleBacktotop)
  }

  /**
   * Mobile nav toggle
   */
  on('click', '.mobile-nav-toggle', function(e) {
    let navbar = select('#navbar');
    if (!navbar) return;
    
    navbar.classList.toggle('navbar-mobile')
    this.classList.toggle('bi-list')
    this.classList.toggle('bi-x')
  })

  /**
   * Scroll with offset on links with a class name .scrollto
   */
  on('click', '.scrollto', function(e) {
    if (select(this.hash)) {
      e.preventDefault()

      let navbar = select('#navbar')
      if (navbar && navbar.classList.contains('navbar-mobile')) {
        navbar.classList.remove('navbar-mobile')
        let navbarToggle = select('.mobile-nav-toggle')
        if (navbarToggle) {
          navbarToggle.classList.toggle('bi-list')
          navbarToggle.classList.toggle('bi-x')
        }
      }
      scrollto(this.hash)
    }
  }, true)

  /**
   * Scroll with offset on page load with hash links in the url
   */
  window.addEventListener('load', () => {
    if (window.location.hash) {
      if (select(window.location.hash)) {
        scrollto(window.location.hash)
      }
    }
  });

  /**
   * Preloader
   */
  let preloader = select('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove()
    });
  }

  /**
   * Initiate glightbox - Only if GLightbox is loaded
   */
  window.addEventListener('load', () => {
    if (typeof GLightbox !== 'undefined') {
      const glightbox = GLightbox({
        selector: '.glightbox'
      });
    }
  });

  /**
   * Portfolio isotope and filter - Only if Isotope is loaded
   * Optimized to prevent layout thrashing
   */
  window.addEventListener('load', () => {
    let portfolioContainer = select('.portfolio-container');
    if (portfolioContainer && typeof Isotope !== 'undefined') {
      // Use requestAnimationFrame to batch Isotope operations
      requestAnimationFrame(() => {
        let portfolioIsotope = new Isotope(portfolioContainer, {
          itemSelector: '.portfolio-item',
          layoutMode: 'fitRows',
          transitionDuration: '0.3s'
        });

        let portfolioFilters = select('#portfolio-flters li', true);

        on('click', '#portfolio-flters li', function(e) {
          e.preventDefault();
          
          // Batch DOM writes
          requestAnimationFrame(() => {
            portfolioFilters.forEach(function(el) {
              el.classList.remove('filter-active');
            });
            this.classList.add('filter-active');

            portfolioIsotope.arrange({
              filter: this.getAttribute('data-filter')
            });
            
            // Refresh AOS if available - only once after arrangement
            if (typeof AOS !== 'undefined') {
              portfolioIsotope.once('arrangeComplete', function() {
                AOS.refresh()
              });
            }
          });
        }, true);
      });
    }
  });

  /**
   * Animation on scroll - Only if AOS is loaded
   * Configured for optimal performance
   */
  window.addEventListener('load', () => {
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        mirror: false,
        offset: 100,
        disable: 'mobile' // Disable on mobile for better performance
      })
    }
  });

})()
