// Basic helpers
function qs(selector, scope = document) {
  return scope.querySelector(selector);
}

function qsa(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

// Initialization
document.addEventListener("DOMContentLoaded", () => {
  const form = qs("#resumeForm");

  // Buttons
  const addSkillBtn = qs("#addSkillBtn");
  const addExperienceBtn = qs("#addExperienceBtn");
  const addEducationBtn = qs("#addEducationBtn");
  const addProjectBtn = qs("#addProjectBtn");
  const addCertificationBtn = qs("#addCertificationBtn");
  const addLanguageBtn = qs("#addLanguageBtn");
  const clearBtn = qs("#clearBtn");
  const downloadBtn = qs("#downloadBtn");
  const themeToggleBtn = qs("#themeToggleBtn");

  // Lists / containers
  const skillsList = qs("#skillsList");
  const experienceList = qs("#experienceList");
  const educationList = qs("#educationList");
  const projectList = qs("#projectList");
  const certificationList = qs("#certificationList");
  const languageList = qs("#languageList");
  const resumePreview = qs("#resumePreview");
  const skillsError = qs("#skillsError");
  const experienceError = qs("#experienceError");
  const educationError = qs("#educationError");

  // Templates
  const experienceTemplate = qs("#experienceTemplate");
  const educationTemplate = qs("#educationTemplate");
  const projectTemplate = qs("#projectTemplate");
  const certificationTemplate = qs("#certificationTemplate");
  const languageTemplate = qs("#languageTemplate");

  const summary = qs("#summary");
  const summaryCounter = qs("#summaryCounter");
  const profilePhotoInput = qs("#profilePhoto");

  // --- Summary character counter ---
  summary.addEventListener("input", () => {
    const len = summary.value.length;
    summaryCounter.textContent = `${len} / 500`;
  });

  // --- Skills handling ---
  addSkillBtn.addEventListener("click", () => {
    const input = qs("#skillInput");
    const value = input.value.trim();
    if (!value) return;

    const badge = document.createElement("span");
    badge.className =
      "badge text-bg-primary resume-skill-badge d-inline-flex align-items-center";
    badge.textContent = value + " ";

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className =
      "btn-close btn-close-white btn-sm ms-1";
    removeBtn.ariaLabel = "Remove skill";
    removeBtn.addEventListener("click", () => {
      badge.remove();
    });

    badge.appendChild(removeBtn);
    skillsList.appendChild(badge);
    input.value = "";
  });

  // --- Dynamic list helpers ---
  function addItemFromTemplate(template, list) {
    const clone = template.content.cloneNode(true);
    list.appendChild(clone);
  }

  function handleRemoveButtons(container) {
    container.addEventListener("click", (e) => {
      const target = e.target;
      if (target.classList.contains("remove-item")) {
        const item = target.closest(
          ".experience-item, .education-item, .project-item, .certification-item, .language-item"
        );
        if (item) item.remove();
      }
    });
  }

  // Experience / Education / Projects / Extras add buttons
  addExperienceBtn.addEventListener("click", () => {
    addItemFromTemplate(experienceTemplate, experienceList);
  });

  addEducationBtn.addEventListener("click", () => {
    addItemFromTemplate(educationTemplate, educationList);
  });

  addProjectBtn.addEventListener("click", () => {
    addItemFromTemplate(projectTemplate, projectList);
  });

  addCertificationBtn.addEventListener("click", () => {
    addItemFromTemplate(certificationTemplate, certificationList);
  });

  addLanguageBtn.addEventListener("click", () => {
    addItemFromTemplate(languageTemplate, languageList);
  });

  // Enable remove buttons in all dynamic containers
  handleRemoveButtons(experienceList);
  handleRemoveButtons(educationList);
  handleRemoveButtons(projectList);
  handleRemoveButtons(certificationList);
  handleRemoveButtons(languageList);

  // Project reorder controls (move up/down)
  projectList.addEventListener("click", (e) => {
    const target = e.target;
    const item = target.closest(".project-item");
    if (!item) return;

    if (target.classList.contains("project-move-up")) {
      const prev = item.previousElementSibling;
      if (prev) {
        projectList.insertBefore(item, prev);
      }
    } else if (target.classList.contains("project-move-down")) {
      const next = item.nextElementSibling;
      if (next) {
        projectList.insertBefore(next, item);
      }
    }
  });

  // --- Theme toggle (bonus) ---
  function setTheme(theme) {
    document.body.setAttribute("data-bs-theme", theme);
    localStorage.setItem("rb_theme", theme);
    themeToggleBtn.textContent =
      theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme";
  }

  const savedTheme = localStorage.getItem("rb_theme") || "light";
  setTheme(savedTheme);

  themeToggleBtn.addEventListener("click", () => {
    const current = document.body.getAttribute("data-bs-theme") || "light";
    setTheme(current === "light" ? "dark" : "light");
  });

  // --- Profile photo (bonus) ---
  let profilePhotoDataUrl = "";
  profilePhotoInput.addEventListener("change", () => {
    const file = profilePhotoInput.files && profilePhotoInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      profilePhotoDataUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  // --- Validation helpers ---
  function validatePhone(value) {
    const digits = value.replace(/\D/g, "");
    return digits.length >= 10;
  }

  function validateForm() {
    let isValid = true;

    const fullName = qs("#fullName");
    const email = qs("#email");
    const phone = qs("#phone");
    const roleTitle = qs("#roleTitle");
    const location = qs("#location");
    const linkedin = qs("#linkedin");
    const portfolio = qs("#portfolio");

    // Use standard required validation
    [fullName, email, phone, summary, roleTitle, location, linkedin, portfolio].forEach((el) => {
      if (!el.value.trim()) {
        el.classList.add("is-invalid");
        isValid = false;
      } else {
        el.classList.remove("is-invalid");
      }
    });

    // Email format
    if (email.value && !email.checkValidity()) {
      email.classList.add("is-invalid");
      isValid = false;
    }

    // Phone basic rule
    if (!validatePhone(phone.value)) {
      phone.classList.add("is-invalid");
      isValid = false;
    }

    // Skills required (at least one badge)
    const skillBadges = qsa(".resume-skill-badge", skillsList);
    if (skillBadges.length === 0) {
      skillsError.classList.remove("d-none");
      isValid = false;
    } else {
      skillsError.classList.add("d-none");
    }

    // Experience required (at least one item with some content)
    const expItems = qsa(".experience-item", experienceList);
    const hasExp = expItems.some((item) => {
      return (
        qs(".exp-company", item).value.trim() ||
        qs(".exp-title", item).value.trim() ||
        qs(".exp-resp", item).value.trim()
      );
    });
    if (!hasExp) {
      experienceError.classList.remove("d-none");
      isValid = false;
    } else {
      experienceError.classList.add("d-none");
    }

    // Education required (at least one item with some content)
    const eduItems = qsa(".education-item", educationList);
    const hasEdu = eduItems.some((item) => {
      return (
        qs(".edu-inst", item).value.trim() ||
        qs(".edu-degree", item).value.trim()
      );
    });
    if (!hasEdu) {
      educationError.classList.remove("d-none");
      isValid = false;
    } else {
      educationError.classList.add("d-none");
    }

    return isValid;
  }

  // Remove invalid style on input
  qsa("input, textarea", form).forEach((el) => {
    el.addEventListener("input", () => {
      el.classList.remove("is-invalid");
    });
  });

  // --- Collect data from form ---
  function collectFormData() {
    const data = {
      personal: {
        fullName: qs("#fullName").value.trim(),
        roleTitle: qs("#roleTitle").value.trim(),
        phone: qs("#phone").value.trim(),
        email: qs("#email").value.trim(),
        location: qs("#location").value.trim(),
        linkedin: qs("#linkedin").value.trim(),
        portfolio: qs("#portfolio").value.trim(),
        summary: qs("#summary").value.trim(),
        photo: profilePhotoDataUrl,
      },
      skills: qsa(".resume-skill-badge", skillsList).map((badge) =>
        badge.firstChild.textContent.trim()
      ),
      experiences: qsa(".experience-item", experienceList).map((item) => ({
        company: qs(".exp-company", item).value.trim(),
        title: qs(".exp-title", item).value.trim(),
        start: qs(".exp-start", item).value.trim(),
        end: qs(".exp-end", item).value.trim(),
        current: qs(".exp-current", item).checked,
        resp: qs(".exp-resp", item).value.trim(),
      })),
      educations: qsa(".education-item", educationList).map((item) => ({
        inst: qs(".edu-inst", item).value.trim(),
        degree: qs(".edu-degree", item).value.trim(),
        start: qs(".edu-start", item).value.trim(),
        end: qs(".edu-end", item).value.trim(),
        score: qs(".edu-score", item).value.trim(),
      })),
      projects: qsa(".project-item", projectList).map((item) => ({
        title: qs(".proj-title", item).value.trim(),
        tech: qs(".proj-tech", item).value.trim(),
        desc: qs(".proj-desc", item).value.trim(),
        link: qs(".proj-link", item).value.trim(),
      })),
      certifications: qsa(".certification-item", certificationList).map(
        (item) => qs(".cert-text", item).value.trim()
      ),
      languages: qsa(".language-item", languageList).map(
        (item) => qs(".lang-text", item).value.trim()
      ),
    };

    return data;
  }

  // --- Render preview ---
  function renderPreview(data) {
    const { personal } = data;
    if (!personal.fullName && !personal.email && !personal.phone) {
      resumePreview.innerHTML =
        '<p class="fw-bold text-center mb-0">Resume Preview</p>';
      return;
    }

    const skillsHtml = data.skills
      .filter((s) => s)
      .map(
        (s) =>
          `<span class="badge text-bg-secondary me-1 mb-1">${s}</span>`
      )
      .join("");

    const expHtml = data.experiences
      .filter((e) => e.company || e.title || e.resp)
      .map((e) => {
        const dates =
          e.start || e.end || e.current
            ? `<div class="small text-muted">${
                e.start || "N/A"
              } - ${e.current ? "Present" : e.end || "N/A"}</div>`
            : "";
        const titleLine = [e.title, e.company].filter(Boolean).join(" | ");
        const resp = e.resp ? `<div>${e.resp}</div>` : "";
        return `<div class="mb-2">
            <div class="fw-semibold">${titleLine}</div>
            ${dates}
            ${resp}
          </div>`;
      })
      .join("");

    const eduHtml = data.educations
      .filter((e) => e.inst || e.degree)
      .map((e) => {
        const years =
          e.start || e.end
            ? `<div class="small text-muted">${e.start || ""} - ${
                e.end || ""
              }</div>`
            : "";
        const score = e.score
          ? `<div class="small">Score / CGPA: ${e.score}</div>`
          : "";
        return `<div class="mb-2">
            <div class="fw-semibold">${e.degree || ""}</div>
            <div>${e.inst || ""}</div>
            ${years}
            ${score}
          </div>`;
      })
      .join("");

    const projHtml = data.projects
      .filter((p) => p.title || p.desc)
      .map((p) => {
        const tech = p.tech
          ? `<div class="small text-muted">${p.tech}</div>`
          : "";
        const link = p.link
          ? `<div><a href="${p.link}" target="_blank" rel="noreferrer">${p.link}</a></div>`
          : "";
        return `<div class="mb-2">
            <div class="fw-semibold">${p.title || ""}</div>
            ${tech}
            <div>${p.desc || ""}</div>
            ${link}
          </div>`;
      })
      .join("");

    const certHtml = data.certifications
      .filter((c) => c)
      .map((c) => `<li>${c}</li>`)
      .join("");

    const langHtml = data.languages
      .filter((l) => l)
      .map((l) => `<li>${l}</li>`)
      .join("");

    const showSkills = skillsHtml !== "";
    const showExp = expHtml !== "";
    const showEdu = eduHtml !== "";
    const showProj = projHtml !== "";
    const showCert = certHtml !== "";
    const showLang = langHtml !== "";

    const contactParts = [];
    if (personal.email) contactParts.push(`<span>${personal.email}</span>`);
    if (personal.phone) contactParts.push(`<span>${personal.phone}</span>`);
    if (personal.location)
      contactParts.push(`<span>${personal.location}</span>`);
    if (personal.linkedin)
      contactParts.push(
        `<a href="${personal.linkedin}" target="_blank" rel="noreferrer">LinkedIn</a>`
      );
    if (personal.portfolio)
      contactParts.push(
        `<a href="${personal.portfolio}" target="_blank" rel="noreferrer">Portfolio</a>`
      );

    const contactHtml = contactParts.join(" | ");

    const photoHtml = personal.photo
      ? `<div class="profile-photo-wrapper">
          <img src="${personal.photo}" alt="Profile photo" />
        </div>`
      : "";

    resumePreview.innerHTML = `
      <div class="resume-header row g-3 align-items-center">
        <div class="col-md-9">
          <div class="resume-name">${personal.fullName || ""}</div>
          <div class="resume-role">${personal.roleTitle || ""}</div>
          <div class="mt-1 small">${contactHtml}</div>
        </div>
        <div class="col-md-3">
          ${photoHtml}
        </div>
      </div>

      <div class="mb-3">
        <div class="resume-section-title">Summary</div>
        <p class="mb-0">${personal.summary || ""}</p>
      </div>

      ${
        showSkills
          ? `<div class="mb-3">
              <div class="resume-section-title">Skills</div>
              <div>${skillsHtml}</div>
            </div>`
          : ""
      }

      ${
        showExp
          ? `<div class="mb-3">
              <div class="resume-section-title">Experience</div>
              ${expHtml}
            </div>`
          : ""
      }

      ${
        showProj
          ? `<div class="mb-3">
              <div class="resume-section-title">Projects</div>
              ${projHtml}
            </div>`
          : ""
      }

      ${
        showEdu
          ? `<div class="mb-3">
              <div class="resume-section-title">Education</div>
              ${eduHtml}
            </div>`
          : ""
      }

      ${
        showCert || showLang
          ? `<div class="mb-2">
              <div class="resume-section-title">Extras</div>
              ${
                showCert
                  ? `<div class="mb-1"><span class="fw-semibold">Certifications:</span>
                      <ul class="mb-1">${certHtml}</ul>
                    </div>`
                  : ""
              }
              ${
                showLang
                  ? `<div class="mb-0"><span class="fw-semibold">Languages:</span>
                      <ul class="mb-0">${langHtml}</ul>
                    </div>`
                  : ""
              }
            </div>`
          : ""
      }
    `;
  }

  // --- Form submit: validate and render ---
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    const data = collectFormData();
    renderPreview(data);
  });

  // --- Clear form ---
  clearBtn.addEventListener("click", () => {
    if (!confirm("Clear all form data?")) return;
    form.reset();
    skillsList.innerHTML = "";
    experienceList.innerHTML = "";
    educationList.innerHTML = "";
    projectList.innerHTML = "";
    certificationList.innerHTML = "";
    languageList.innerHTML = "";
    profilePhotoDataUrl = "";
    summaryCounter.textContent = "0 / 500";
    resumePreview.innerHTML =
      '<p class="fw-bold text-center mb-0">Resume Preview</p>';
    qsa(".is-invalid", form).forEach((el) =>
      el.classList.remove("is-invalid")
    );
    skillsError.classList.add("d-none");
    experienceError.classList.add("d-none");
    educationError.classList.add("d-none");
  });

  // --- Download as PDF (using print) ---
  downloadBtn.addEventListener("click", () => {
    // Ensure preview is updated before print
    const data = collectFormData();
    renderPreview(data);
    window.print();
  });
});

