// Load and parse config from YAML file
async function loadConfig() {
  try {
    const response = await fetch("config.yml");
    const yamlText = await response.text();
    return jsyaml.load(yamlText);
  } catch (error) {
    console.error("Error loading config:", error);
    return null;
  }
}

// Format content with icons and styling
function formatContent(content) {
  const lines = content.split("\n");
  let formattedHtml = "";
  let inList = false;

  lines.forEach((line) => {
    if (line.trim() === "") {
      formattedHtml += "<br>";
    } else if (line.match(/^\d+\./)) {
      if (inList) {
        formattedHtml += "</div>";
      }
      formattedHtml += `
        <div class="section-title">
          <i class="fas fa-bookmark"></i>
          ${line.trim()}
        </div>
        <div class="list-container">`;
      inList = true;
    } else if (line.trim().startsWith("-")) {
      const listContent = line.trim().substring(1).trim();
      formattedHtml += `
        <div class="list-item">
          <i class="fas fa-check-circle"></i>
          <span>${listContent}</span>
        </div>`;
    } else {
      formattedHtml += `<p class="content-text">${line.trim()}</p>`;
    }
  });

  if (inList) {
    formattedHtml += "</div>";
  }

  return formattedHtml;
}

// Format features content with search and filters
function formatFeatures(features) {
  let html = `
    <div class="features-controls">
      <div class="feature-search">
        <i class="fas fa-search"></i>
        <input type="text" placeholder="Search features..." id="featureSearch">
      </div>
      <div class="feature-filters">
        <button class="feature-filter active" data-filter="all">All</button>
        <button class="feature-filter" data-filter="moderation">Moderation</button>
        <button class="feature-filter" data-filter="automation">Automation</button>
        <button class="feature-filter" data-filter="premium">Premium</button>
      </div>
    </div>
    <div class="features-grid">`;

  features.forEach((feature) => {
    const tags = feature.tags
      ? feature.tags
          .map((tag) => `<span class="feature-tag">${tag}</span>`)
          .join("")
      : "";

    const premiumClass = feature.premium ? "premium" : "";
    const premiumBadge = feature.premium
      ? `<span class="feature-badge premium">Premium</span>`
      : "";

    html += `
      <div class="feature-card ${premiumClass}" 
           data-tags="${feature.tags?.join(" ")}"
           data-premium="${feature.premium ? "true" : "false"}">
        <div class="feature-icon">
          <i class="fas ${feature.icon}"></i>
        </div>
        <div class="feature-header">
          <h3 class="feature-title">${feature.title}</h3>
          ${premiumBadge}
        </div>
        <p class="feature-description">${feature.description}</p>
        <div class="feature-tags">
          ${tags}
        </div>
      </div>
    `;
  });

  html += "</div>";
  return html;
}

// Enhanced menu functionality
function setupMenu() {
  const menuTrigger = document.querySelector(".menu-trigger");
  const menuDropdown = document.querySelector(".menu-dropdown");
  let isMenuOpen = false;

  // Toggle menu on trigger click
  menuTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    isMenuOpen = !isMenuOpen;
    menuDropdown.classList.toggle("show");
    updateMenuIcon();
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav-menu") && isMenuOpen) {
      isMenuOpen = false;
      menuDropdown.classList.remove("show");
      updateMenuIcon();
    }
  });

  // Handle menu item clicks
  document.querySelectorAll(".menu-item").forEach((item) => {
    item.addEventListener("click", () => {
      isMenuOpen = false;
      menuDropdown.classList.remove("show");
      updateMenuIcon();
    });
  });

  // Update menu icon rotation
  function updateMenuIcon() {
    const icon = menuTrigger.querySelector("i:last-child");
    icon.style.transform = isMenuOpen ? "rotate(180deg)" : "rotate(0)";
  }
}

// Filter features based on search and filter
function filterFeatures(searchText, filterType = "all") {
  const cards = document.querySelectorAll(".feature-card");
  const searchLower = searchText.toLowerCase();

  cards.forEach((card) => {
    const title = card
      .querySelector(".feature-title")
      .textContent.toLowerCase();
    const description = card
      .querySelector(".feature-description")
      .textContent.toLowerCase();
    const tags = card.dataset.tags?.toLowerCase() || "";
    const isPremium = card.dataset.premium === "true";

    let matches =
      title.includes(searchLower) ||
      description.includes(searchLower) ||
      tags.includes(searchLower);

    if (filterType !== "all") {
      if (filterType === "premium") {
        matches = matches && isPremium;
      } else {
        matches = matches && tags.includes(filterType);
      }
    }

    // Apply smooth transition
    if (matches) {
      card.style.display = "flex";
      requestAnimationFrame(() => {
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      });
    } else {
      card.style.opacity = "0";
      card.style.transform = "translateY(20px)";
      setTimeout(() => {
        if (!matches) card.style.display = "none";
      }, 300);
    }
  });
}

// Setup feature filters with smooth transitions
function setupFeatureFilters() {
  const filterButtons = document.querySelectorAll(".feature-filter");
  const searchInput = document.getElementById("featureSearch");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      filterFeatures(searchInput.value, button.dataset.filter);
    });
  });

  // Debounced search input handler
  let searchTimeout;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const activeFilter = document.querySelector(".feature-filter.active");
      filterFeatures(e.target.value, activeFilter.dataset.filter);
    }, 300);
  });
}

// Update section with smooth transitions
function updateSection(hash) {
  const section =
    hash === "#tos"
      ? "tos"
      : hash === "#pp"
      ? "privacy"
      : hash === "#features"
      ? "features"
      : "home";

  const menuItems = document.querySelectorAll(".menu-item");
  const contentSections = document.querySelectorAll(".content-section");
  const currentSection = document.querySelector("#currentSection");
  const targetMenuItem = document.querySelector(`[data-section="${section}"]`);

  // Update menu items
  menuItems.forEach((item) => item.classList.remove("active"));
  targetMenuItem.classList.add("active");

  // Update sections with smooth transition
  contentSections.forEach((sect) => {
    sect.style.opacity = "0";
    setTimeout(() => {
      sect.style.display = "none";
      sect.classList.remove("active");
    }, 300);
  });

  // Update menu trigger content
  const icons = {
    home: "fa-home",
    privacy: "fa-shield-alt",
    tos: "fa-file-contract",
    features: "fa-star",
  };

  const titles = {
    home: "Home",
    privacy: "Privacy Policy",
    tos: "Terms of Service",
    features: "Features",
  };

  currentSection.querySelector(".trigger-text").textContent = titles[section];
  currentSection.querySelector(
    "i:first-child"
  ).className = `fas ${icons[section]}`;

  // Show new section
  const targetSection = document.getElementById(section);
  setTimeout(() => {
    targetSection.style.display = "block";
    requestAnimationFrame(() => {
      targetSection.style.opacity = "1";
      targetSection.classList.add("active");
    });
  }, 300);

  // Smooth scroll to top
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

// Initialize content
async function initializeContent() {
  const config = await loadConfig();
  if (config) {
    document.getElementById("privacy-content").innerHTML = formatContent(
      config.privacy.content
    );
    document.getElementById("tos-content").innerHTML = formatContent(
      config.tos.content
    );

    if (config.features) {
      document.getElementById("features-content").innerHTML = formatFeatures(
        config.features
      );
      setupFeatureFilters();
    }

    updateSection(window.location.hash || "#home");
  }
}

// Theme toggle with smooth transition
function toggleTheme() {
  document.body.classList.add("theme-switching");
  document.body.classList.toggle("dark-mode");

  const icon = document.querySelector(".theme-toggle i");
  icon.style.transform = "rotate(360deg)";

  if (document.body.classList.contains("dark-mode")) {
    icon.classList.replace("fa-moon", "fa-sun");
  } else {
    icon.classList.replace("fa-sun", "fa-moon");
  }

  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark-mode") ? "dark" : "light"
  );

  setTimeout(() => {
    document.body.classList.remove("theme-switching");
    icon.style.transform = "";
  }, 500);
}

// Setup all event listeners
function setupEventListeners() {
  const themeToggle = document.querySelector(".theme-toggle");
  themeToggle.addEventListener("click", toggleTheme);

  window.addEventListener("hashchange", (e) => {
    e.preventDefault();
    updateSection(window.location.hash);
  });

  document.querySelectorAll(".welcome-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      const hash = e.currentTarget.getAttribute("href");
      updateSection(hash);
    });
  });

  // Theme preference handling
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme) {
    if (savedTheme === "dark") {
      document.body.classList.add("dark-mode");
      themeToggle.querySelector("i").classList.replace("fa-moon", "fa-sun");
    }
  } else if (prefersDark.matches) {
    document.body.classList.add("dark-mode");
    themeToggle.querySelector("i").classList.replace("fa-moon", "fa-sun");
  }

  prefersDark.addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) {
      if (e.matches) {
        document.body.classList.add("dark-mode");
        themeToggle.querySelector("i").classList.replace("fa-moon", "fa-sun");
      } else {
        document.body.classList.remove("dark-mode");
        themeToggle.querySelector("i").classList.replace("fa-sun", "fa-moon");
      }
    }
  });
}

// Initialize everything when document is loaded
document.addEventListener("DOMContentLoaded", () => {
  initializeContent();
  setupEventListeners();
  setupMenu();
});
