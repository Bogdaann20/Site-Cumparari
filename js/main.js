// Google Ads placeholders: înlocuiește valorile cu cele primite din Google Ads.
const GOOGLE_ADS_ID = "AW-XXXXXXXXX";
const GOOGLE_ADS_CONVERSIONS = {
  phone: "PHONE_CONVERSION_LABEL",
  whatsapp: "WHATSAPP_CONVERSION_LABEL",
  floatingWhatsapp: "FLOATING_WHATSAPP_CONVERSION_LABEL",
  formWhatsapp: "FORM_WHATSAPP_CONVERSION_LABEL"
};

const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector(".primary-nav");
const navLinks = document.querySelectorAll(".primary-nav a");
const contactForm = document.querySelector(".contact-form");
const formStatus = document.querySelector(".form-status");
const contactSection = document.querySelector(".contact");
const faqSection = document.querySelector(".faq");
const faqQuestions = document.querySelectorAll(".faq-question");
const WHATSAPP_NUMBER = "40735371779";
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isLocalDevelopment = ["localhost", "127.0.0.1", ""].includes(window.location.hostname);

function isGoogleAdsConfigured(label) {
  return (
    typeof label === "string" &&
    label.length > 0 &&
    !GOOGLE_ADS_ID.includes("X") &&
    !label.includes("CONVERSION_LABEL")
  );
}

function trackGoogleAdsConversion(label, eventName) {
  if (typeof window.gtag !== "function" || !isGoogleAdsConfigured(label)) {
    if (isLocalDevelopment) {
      console.log("[Google Ads tracking skipped]", eventName, {
        reason: typeof window.gtag === "function" ? "placeholder_config" : "gtag_unavailable"
      });
    }
    return;
  }

  window.gtag("event", "conversion", {
    send_to: `${GOOGLE_ADS_ID}/${label}`
  });

  if (isLocalDevelopment) {
    console.log("[Google Ads conversion]", eventName);
  }
}

// Pentru Consent Mode: când adaugi un cookie banner, actualizează consent-ul aici după accept.
function updateGoogleConsentMode(consentGranted) {
  if (typeof window.gtag !== "function") return;

  window.gtag("consent", "update", {
    ad_storage: consentGranted ? "granted" : "denied",
    ad_user_data: consentGranted ? "granted" : "denied",
    ad_personalization: consentGranted ? "granted" : "denied",
    analytics_storage: consentGranted ? "granted" : "denied"
  });
}

function closeMenu() {
  if (!menuToggle || !primaryNav) return;
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Deschide meniul");
  primaryNav.classList.remove("is-open");
  document.body.classList.remove("nav-open");
}

if (menuToggle && primaryNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Deschide meniul" : "Închide meniul");
    primaryNav.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("nav-open", !isOpen);
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.querySelectorAll('a[href="#acasa"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    closeMenu();
    history.pushState(null, "", "#acasa");
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

document.querySelectorAll('a[href^="tel:"]').forEach((link) => {
  link.addEventListener("click", () => {
    trackGoogleAdsConversion(GOOGLE_ADS_CONVERSIONS.phone, "phone_click");
  });
});

document.querySelectorAll('[data-track="whatsapp"]').forEach((link) => {
  link.addEventListener("click", () => {
    trackGoogleAdsConversion(GOOGLE_ADS_CONVERSIONS.whatsapp, "whatsapp_click");
  });
});

document.querySelectorAll('[data-track="floating-whatsapp"]').forEach((link) => {
  link.addEventListener("click", () => {
    trackGoogleAdsConversion(GOOGLE_ADS_CONVERSIONS.floatingWhatsapp, "floating_whatsapp_click");
  });
});

if (contactSection && "IntersectionObserver" in window) {
  const contactObserver = new IntersectionObserver(
    (entries) => {
      document.body.classList.toggle("contact-in-view", entries[0].isIntersecting);
    },
    { threshold: 0.18 }
  );

  contactObserver.observe(contactSection);
}

if (faqSection && "IntersectionObserver" in window) {
  const faqObserver = new IntersectionObserver(
    (entries) => {
      document.body.classList.toggle("faq-in-view", entries[0].isIntersecting);
    },
    { threshold: 0.18 }
  );

  faqObserver.observe(faqSection);
}

faqQuestions.forEach((question) => {
  question.addEventListener("click", () => {
    const answer = document.getElementById(question.getAttribute("aria-controls"));
    const item = question.closest(".faq-item");
    const isOpen = question.getAttribute("aria-expanded") === "true";

    question.setAttribute("aria-expanded", String(!isOpen));
    item?.classList.toggle("is-open", !isOpen);

    if (answer) {
      answer.hidden = isOpen;
    }
  });
});

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const carModel = String(formData.get("car-model") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const missingFields = [];

    if (!name) missingFields.push("Nume");
    if (!phone) missingFields.push("Telefon");
    if (!carModel) missingFields.push("Model mașină");

    formStatus.classList.remove("is-error");
    formStatus.textContent = "";

    if (missingFields.length) {
      formStatus.classList.add("is-error");
      formStatus.textContent = `Completează câmpurile obligatorii: ${missingFields.join(", ")}.`;
      return;
    }

    const whatsappMessage = [
      "Salut, vreau să vând o mașină rulată.",
      "",
      `Nume: ${name}`,
      `Telefon: ${phone}`,
      `Model mașină: ${carModel}`,
      `Mesaj: ${message}`,
      "",
      "Vreau o evaluare pentru autoturism."
    ].join("\n");

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

    formStatus.textContent = "Se deschide WhatsApp cu mesajul completat.";
    trackGoogleAdsConversion(GOOGLE_ADS_CONVERSIONS.formWhatsapp, "whatsapp_form_submit");
    window.open(whatsappUrl, "_blank", "noopener");
  });
}
