/**
 * Optimized Main JS - Performance Enhanced with Embedded Portfolio & Auto Counting
 * Improvements: Batched DOM operations, RAF for scroll, reduced reflows, embedded demos, automatic counts
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
   * AUTOMATIC PORTFOLIO COUNT CALCULATION - NEW
   * Counts projects by category and updates filter buttons automatically
   */
  const updatePortfolioCounts = () => {
    const portfolioProjects = select('.portfolio-project', true);
    const filterButtons = select('.filter-btn', true);
    
    if (!portfolioProjects.length || !filterButtons.length) return;
    
    // Count projects by category
    const counts = {
      all: portfolioProjects.length,
      dashboards: 0,
      notebooks: 0,
      'deployed-model': 0
    };
    
    // Count each project's category
    portfolioProjects.forEach(project => {
      const category = project.getAttribute('data-category');
      if (category && counts.hasOwnProperty(category)) {
        counts[category]++;
      }
    });
    
    // Update filter button counts
    filterButtons.forEach(button => {
      const filter = button.getAttribute('data-filter');
      const countElement = button.querySelector('.filter-count');
      
      if (countElement && counts.hasOwnProperty(filter)) {
        countElement.textContent = counts[filter];
      }
    });
  };

  /**
   * Portfolio Filter System - ENHANCED FOR EMBEDDED DEMOS WITH AUTO COUNTING
   * Filters portfolio projects by category: All, Live Demos, Case Studies
   */
  document.addEventListener('DOMContentLoaded', function() {
    // Update counts first
    updatePortfolioCounts();
    
    // Get all filter buttons and portfolio projects
    const filterButtons = select('.filter-btn', true);
    const portfolioProjects = select('.portfolio-project', true);
    
    if (!filterButtons.length || !portfolioProjects.length) return;
    
    /**
     * Filter portfolio projects based on category
     * @param {string} category - The category to filter by ('all', 'dashboards', 'notebooks', 'deployed-model')
     */
    const filterProjects = (category) => {
      // Use requestAnimationFrame for smooth animation
      requestAnimationFrame(() => {
        portfolioProjects.forEach(project => {
          const projectCategory = project.getAttribute('data-category');
          
          if (category === 'all') {
            // Show all projects
            project.classList.remove('filter-hidden');
            
            // Resume iframes for visible projects (performance optimization)
            const iframe = project.querySelector('iframe');
            if (iframe && iframe.dataset.src && !iframe.src) {
              iframe.src = iframe.dataset.src;
            }
          } else {
            // Show only matching projects
            if (projectCategory === category || (projectCategory && projectCategory.includes(category))) {
              project.classList.remove('filter-hidden');
              
              // Resume iframes for visible projects
              const iframe = project.querySelector('iframe');
              if (iframe && iframe.dataset.src && !iframe.src) {
                iframe.src = iframe.dataset.src;
              }
            } else {
              project.classList.add('filter-hidden');
            }
          }
        });
        
        // Refresh AOS animations if available
        setTimeout(() => {
          if (typeof AOS !== 'undefined') {
            AOS.refresh();
          }
        }, 100);
      });
    };
    
    // Add click event listeners to filter buttons
    filterButtons.forEach(button => {
      button.addEventListener('click', function() {
        const filterValue = this.getAttribute('data-filter');
        
        // Remove active class from all buttons (batch DOM writes)
        requestAnimationFrame(() => {
          filterButtons.forEach(btn => btn.classList.remove('active'));
          
          // Add active class to clicked button
          this.classList.add('active');
          
          // Filter projects
          filterProjects(filterValue);
          
          // Smooth scroll to portfolio on mobile for better UX
          if (window.innerWidth < 768) {
            const portfolioShowcase = select('.portfolio-showcase');
            if (portfolioShowcase) {
              setTimeout(() => {
                portfolioShowcase.scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'nearest' 
                });
              }, 150);
            }
          }
        });
      });
    });
    
    // Initialize: Show all projects on page load
    filterProjects('all');
  });

  /**
   * FULLSCREEN DEMO FUNCTIONALITY
   * Allows users to expand embedded demos to fullscreen
   */
  window.expandDemo = function(button) {
    const projectEmbed = button.closest('.project-embed');
    const iframe = projectEmbed.querySelector('iframe');
    const iframeSrc = iframe.src;
    const iframeTitle = iframe.title || 'Demo';
    
    // Create fullscreen modal
    const modal = document.createElement('div');
    modal.className = 'fullscreen-modal active';
    modal.innerHTML = `
      <div class="fullscreen-content">
        <button class="close-fullscreen" onclick="closeFullscreen(this)">
          <i class="bi bi-x-lg"></i>
        </button>
        <iframe 
          src="${iframeSrc}" 
          frameborder="0" 
          allowFullScreen="true"
          title="${iframeTitle}">
        </iframe>
      </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Close on ESC key
    document.addEventListener('keydown', handleEscKey);
    
    // Close on clicking outside
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        window.closeFullscreen(modal.querySelector('.close-fullscreen'));
      }
    });
  };

  /**
   * Close fullscreen modal
   */
  window.closeFullscreen = function(button) {
    const modal = button.closest('.fullscreen-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', handleEscKey);
    
    // Small delay before removing to allow fade animation
    setTimeout(() => {
      modal.remove();
    }, 300);
  };

  /**
   * Handle ESC key for closing fullscreen
   */
  function handleEscKey(e) {
    if (e.key === 'Escape') {
      const modal = select('.fullscreen-modal');
      if (modal) {
        window.closeFullscreen(modal.querySelector('.close-fullscreen'));
      }
    }
  }

  /**
   * LAZY LOADING FOR EMBEDDED IFRAMES
   * Performance optimization: Load iframes only when they come into view
   */
  document.addEventListener('DOMContentLoaded', function() {
    const iframes = select('.project-embed iframe', true);
    
    if (!iframes.length) return;
    
    // Check if IntersectionObserver is supported
    if ('IntersectionObserver' in window) {
      const iframeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const iframe = entry.target;
            
            // Load iframe source if not already loaded
            if (iframe.dataset.src && !iframe.src) {
              iframe.src = iframe.dataset.src;
              iframe.removeAttribute('data-src');
            }
            
            // Stop observing once loaded
            iframeObserver.unobserve(iframe);
          }
        });
      }, {
        rootMargin: '200px' // Start loading 200px before viewport
      });
      
      // Observe all iframes
      iframes.forEach(iframe => {
        // If iframe has data-src, use lazy loading
        if (iframe.dataset.src) {
          iframeObserver.observe(iframe);
        }
      });
    } else {
      // Fallback: Load all iframes immediately if IntersectionObserver not supported
      iframes.forEach(iframe => {
        if (iframe.dataset.src && !iframe.src) {
          iframe.src = iframe.dataset.src;
          iframe.removeAttribute('data-src');
        }
      });
    }
  });

  /**
   * IFRAME LOADING INDICATORS
   * Show loading state while iframes are loading
   */
  document.addEventListener('DOMContentLoaded', function() {
    const projectEmbeds = select('.project-embed', true);
    
    projectEmbeds.forEach(embed => {
      const iframe = embed.querySelector('iframe');
      if (iframe) {
        // Add loading class
        embed.classList.add('iframe-loading');
        
        // Remove loading class when iframe loads
        iframe.addEventListener('load', function() {
          embed.classList.remove('iframe-loading');
        });
        
        // Timeout fallback (in case load event doesn't fire)
        setTimeout(() => {
          embed.classList.remove('iframe-loading');
        }, 10000); // 10 seconds timeout
      }
    });
  });

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
        disable: false
      })
    }
  });

  /**
   * Simple collapse functionality (replaces Bootstrap JS)
   */
  document.addEventListener('DOMContentLoaded', () => {
    const toggleElements = document.querySelectorAll('[data-bs-toggle="collapse"]');
    
    toggleElements.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = toggle.getAttribute('href');
        const target = document.querySelector(targetId);
        
        if (target) {
          const isShown = target.classList.contains('show');
          
          // Close all other collapses in the same parent
          const parent = toggle.closest('.faq-list');
          if (parent) {
            parent.querySelectorAll('.collapse.show').forEach(openCollapse => {
              if (openCollapse !== target) {
                openCollapse.classList.remove('show');
              }
            });
          }
          
          // Toggle current collapse
          if (isShown) {
            target.classList.remove('show');
          } else {
            target.classList.add('show');
          }
        }
      });
    });
  });

  /**
   * CONTACT FORM HANDLING - Enhanced with better feedback
   */
  document.addEventListener('DOMContentLoaded', () => {
    const contactForm = select('.php-email-form');
    
    if (contactForm) {
      contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const loadingEl = this.querySelector('.loading');
        const errorEl = this.querySelector('.error-message');
        const sentEl = this.querySelector('.sent-message');
        
        // Show loading
        if (loadingEl) loadingEl.style.display = 'block';
        if (errorEl) errorEl.style.display = 'none';
        if (sentEl) sentEl.style.display = 'none';
        
        // Submit form
        fetch(this.action, {
          method: 'POST',
          body: new FormData(this),
          headers: {
            'Accept': 'application/json'
          }
        })
        .then(response => {
          if (loadingEl) loadingEl.style.display = 'none';
          
          if (response.ok) {
            if (sentEl) sentEl.style.display = 'block';
            this.reset();
            
            // Auto-hide success message after 5 seconds
            setTimeout(() => {
              if (sentEl) sentEl.style.display = 'none';
            }, 5000);
          } else {
            if (errorEl) {
              errorEl.textContent = 'Oops! Something went wrong. Please try again.';
              errorEl.style.display = 'block';
            }
          }
        })
        .catch(error => {
          if (loadingEl) loadingEl.style.display = 'none';
          if (errorEl) {
            errorEl.textContent = 'Network error. Please check your connection.';
            errorEl.style.display = 'block';
          }
        });
      });
    }
  });

  /**
   * PERFORMANCE MONITORING - Optional (for development)
   * Remove this in production if not needed
   */
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.addEventListener('load', () => {
      if ('performance' in window) {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('Page Load Time:', perfData.loadEventEnd - perfData.fetchStart, 'ms');
        console.log('Portfolio counts updated automatically');
      }
    });
  }

})()
