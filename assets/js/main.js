(() => {
  "use strict";

  const header = document.querySelector(".site-header");
  const nav = document.querySelector(".site-nav");
  const menuToggle = document.querySelector(".menu-toggle");
  const navAnchors = Array.from(document.querySelectorAll(".site-nav a"));
  const navLinks = Array.from(document.querySelectorAll(".site-nav .nav-link"));
  const sections = Array.from(document.querySelectorAll("main section[id]"));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileQuery = window.matchMedia("(max-width: 960px)");

  /* Mobile navigation */
  const setMenuState = (open, returnFocus = false) => {
    if (!nav || !menuToggle) return;

    nav.classList.toggle("is-open", open);
    menuToggle.classList.toggle("is-active", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");

    if (!open && returnFocus) {
      menuToggle.focus();
    }
  };

  if (nav && menuToggle) {
    menuToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      setMenuState(!nav.classList.contains("is-open"));
    });

    navAnchors.forEach((link) => {
      link.addEventListener("click", () => {
        if (mobileQuery.matches) setMenuState(false);
      });
    });

    document.addEventListener("click", (event) => {
      if (!nav.classList.contains("is-open")) return;
      if (!nav.contains(event.target) && !menuToggle.contains(event.target)) {
        setMenuState(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        setMenuState(false, true);
      }
    });

    const closeMenuOnDesktop = (event) => {
      if (!event.matches) setMenuState(false);
    };

    if (typeof mobileQuery.addEventListener === "function") {
      mobileQuery.addEventListener("change", closeMenuOnDesktop);
    } else {
      mobileQuery.addListener(closeMenuOnDesktop);
    }
  }

  /* Sticky header and active section state */
  const updatePageState = () => {
    if (header) {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    }

    if (!sections.length || !navLinks.length) return;

    const marker = window.scrollY + (header ? header.offsetHeight : 88) + 92;
    let activeId = sections[0].id;

    sections.forEach((section) => {
      if (section.offsetTop <= marker) activeId = section.id;
    });

    const atPageEnd =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 2;

    if (atPageEnd) activeId = "contact";

    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${activeId}`;
      link.classList.toggle("is-active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  let scrollTicking = false;

  const requestPageStateUpdate = () => {
    if (scrollTicking) return;
    scrollTicking = true;

    window.requestAnimationFrame(() => {
      updatePageState();
      scrollTicking = false;
    });
  };

  window.addEventListener("scroll", requestPageStateUpdate, { passive: true });
  window.addEventListener("resize", requestPageStateUpdate);
  updatePageState();

  /* Gentle on-scroll reveals */
  const revealItems = Array.from(document.querySelectorAll(".reveal"));

  if (revealItems.length) {
    const showItem = (item) => item.classList.add("is-visible");

    if ("IntersectionObserver" in window && !reducedMotion.matches) {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            showItem(entry.target);
            observer.unobserve(entry.target);
          });
        },
        {
          threshold: 0.1,
          rootMargin: "0px 0px -8% 0px"
        }
      );

      revealItems.forEach((item) => revealObserver.observe(item));
    } else {
      revealItems.forEach(showItem);
    }
  }

  /* Gallery lightbox */
  const lightbox = document.getElementById("gallery-lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxTitle = document.getElementById("lightbox-title");
  const lightboxDescription = document.getElementById("lightbox-description");
  const lightboxClose = document.querySelector(".lightbox__close");
  const lightboxTriggers = Array.from(document.querySelectorAll("[data-lightbox]"));

  if (lightbox && lightboxImage && typeof lightbox.showModal === "function") {
    const closeLightbox = () => {
      if (lightbox.open) lightbox.close();
    };

    const openLightbox = (trigger) => {
      const card = trigger.closest(".collection-card");
      const image = card ? card.querySelector(".collection-card__media img") : null;

      if (!card || !image) return;

      lightboxImage.src = image.currentSrc || image.src;
      lightboxImage.alt = image.alt;
      lightboxTitle.textContent = card.dataset.title || "Collection";
      lightboxDescription.textContent = card.dataset.description || "";
      lightbox.showModal();
      document.body.classList.add("lightbox-open");
    };

    lightboxTriggers.forEach((trigger) => {
      trigger.addEventListener("click", () => openLightbox(trigger));
    });

    if (lightboxClose) {
      lightboxClose.addEventListener("click", closeLightbox);
    }

    document.querySelectorAll("[data-close-lightbox]").forEach((control) => {
      control.addEventListener("click", closeLightbox);
    });

    lightbox.addEventListener("click", (event) => {
      const bounds = lightbox.getBoundingClientRect();
      const insideDialog =
        event.clientX >= bounds.left &&
        event.clientX <= bounds.right &&
        event.clientY >= bounds.top &&
        event.clientY <= bounds.bottom;

      if (!insideDialog) closeLightbox();
    });

    lightbox.addEventListener("close", () => {
      document.body.classList.remove("lightbox-open");
    });
  } else {
    lightboxTriggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const card = trigger.closest(".collection-card");
        const image = card ? card.querySelector(".collection-card__media img") : null;

        if (image) {
          window.open(image.currentSrc || image.src, "_blank", "noopener");
        }
      });
    });
  }

  /* Footer year */
  const year = document.getElementById("current-year");
  if (year) year.textContent = new Date().getFullYear();
})();
