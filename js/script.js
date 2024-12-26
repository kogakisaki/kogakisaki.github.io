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

// Smooth theme transition
function toggleTheme() {
  // Add transitioning class
  document.body.classList.add("theme-switching");

  // Toggle dark mode
  document.body.classList.toggle("dark-mode");

  // Update icon with animation
  const icon = document.querySelector(".theme-toggle i");
  icon.style.transform = "rotate(360deg)";

  if (document.body.classList.contains("dark-mode")) {
    icon.classList.replace("fa-moon", "fa-sun");
  } else {
    icon.classList.replace("fa-sun", "fa-moon");
  }

  // Save theme preference
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark-mode") ? "dark" : "light"
  );

  // Remove transitioning class after animation
  setTimeout(() => {
    document.body.classList.remove("theme-switching");
    icon.style.transform = "";
  }, 500);
}

// Update section based on hash
function updateSection(hash) {
  const section = hash === "#tos" ? "tos" : hash === "#pp" ? "privacy" : "home";

  const menuItems = document.querySelectorAll(".menu-item");
  const contentSections = document.querySelectorAll(".content-section");
  const currentSection = document.querySelector("#currentSection");
  const targetMenuItem = document.querySelector(`[data-section="${section}"]`);

  // Update menu items
  menuItems.forEach((item) => item.classList.remove("active"));
  targetMenuItem.classList.add("active");

  // Prepare for transition
  contentSections.forEach((sect) => {
    sect.style.display = "none";
    sect.classList.remove("active");
  });

  // Update menu trigger content
  const icons = {
    home: "fa-home",
    privacy: "fa-shield-alt",
    tos: "fa-file-contract",
  };
  const titles = {
    home: "Home",
    privacy: "Privacy Policy",
    tos: "Terms of Service",
  };

  currentSection.querySelector(".trigger-text").textContent = titles[section];
  currentSection.querySelector(
    "i:first-child"
  ).className = `fas ${icons[section]}`;

  // Animate new section
  const targetSection = document.getElementById(section);
  targetSection.style.display = "block";

  // Force reflow
  void targetSection.offsetWidth;

  // Add active class to trigger animation
  targetSection.classList.add("active");
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

    // Handle initial hash
    updateSection(window.location.hash || "#home");
  }
}

// Setup event listeners
function setupEventListeners() {
  // Theme toggle with animation
  const themeToggle = document.querySelector(".theme-toggle");
  themeToggle.addEventListener("click", toggleTheme);

  // Handle hash changes with animation
  window.addEventListener("hashchange", (e) => {
    e.preventDefault();
    updateSection(window.location.hash);
  });

  // Welcome card links
  document.querySelectorAll(".welcome-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      const hash = e.currentTarget.getAttribute("href");
      updateSection(hash);
    });
  });

  // Check system theme preference
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme) {
    // Use saved theme preference
    if (savedTheme === "dark") {
      document.body.classList.add("dark-mode");
      themeToggle.querySelector("i").classList.replace("fa-moon", "fa-sun");
    }
  } else if (prefersDark.matches) {
    // Use system preference if no saved preference
    document.body.classList.add("dark-mode");
    themeToggle.querySelector("i").classList.replace("fa-moon", "fa-sun");
  }

  // Listen for system theme changes
  prefersDark.addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) {
      // Only react if no manual preference is set
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

// Initialize when document is loaded
document.addEventListener("DOMContentLoaded", () => {
  initializeContent();
  setupEventListeners();
});
