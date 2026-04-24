const AGE_VERIFIED_KEY = "negozioAgeVerified";

const ageGate = document.getElementById("ageGate");
const ageGateForm = document.getElementById("ageGateForm");
const ageMonth = document.getElementById("ageMonth");
const ageDay = document.getElementById("ageDay");
const ageYear = document.getElementById("ageYear");
const ageError = document.getElementById("ageError");
const ageExit = document.getElementById("ageExit");
const body = document.body;

function hideAgeGate() {
  ageGate.classList.add("age-gate--hidden");
  body.classList.remove("age-gate-open");
  setTimeout(() => {
    ageGate.setAttribute("aria-hidden", "true");
  }, 220);
}

function showAgeGate() {
  ageGate.classList.remove("age-gate--hidden");
  ageGate.setAttribute("aria-hidden", "false");
  body.classList.add("age-gate-open");
}

function isAgeVerified() {
  try {
    return window.sessionStorage.getItem(AGE_VERIFIED_KEY) === "true";
  } catch (error) {
    return false;
  }
}

function setAgeVerified(value) {
  try {
    window.sessionStorage.setItem(AGE_VERIFIED_KEY, value ? "true" : "false");
  } catch (error) {
    // sessionStorage might be disabled (privacy mode)
  }
}

function calculateAge(year, month, day) {
  const today = new Date();
  const birthDate = new Date(year, month - 1, day);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
}

function validateAgeForm() {
  const month = Number(ageMonth.value);
  const day = Number(ageDay.value);
  const year = Number(ageYear.value);

  if (!month || !day || !year) {
    ageError.textContent = "Please select your month, day, and year of birth.";
    return false;
  }

  const age = calculateAge(year, month, day);
  if (age >= 18) {
    ageError.textContent = "";
    setAgeVerified(true);
    hideAgeGate();
    return true;
  }

  ageError.textContent = "You must be at least 18 years old to enter.";
  return false;
}

function populateAgeFields() {
  if (!ageMonth || !ageDay || !ageYear) return;

  const months = ["Month", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  months.forEach((name, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = index === 0 ? `- ${name} -` : name;
    ageMonth.appendChild(option);
  });

  for (let d = 1; d <= 31; d++) {
    const option = document.createElement("option");
    option.value = d;
    option.textContent = d;
    ageDay.appendChild(option);
  }

  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= currentYear - 100; y--) {
    const option = document.createElement("option");
    option.value = y;
    option.textContent = y;
    ageYear.appendChild(option);
  }
}

if (ageGateForm) {
  ageGateForm.addEventListener("submit", (event) => {
    event.preventDefault();
    validateAgeForm();
  });
}

if (ageExit) {
  ageExit.addEventListener("click", () => {
    onAgeDeny();
  });
}

function onAgeDeny() {
  setAgeVerified(false);
  document.body.innerHTML = "<div style='height:100vh;display:flex;align-items:center;justify-content:center;padding:2rem;text-align:center;color:#fff;background:#000;'>\n  <div style='max-width:420px;'>\n    <h1>Sorry</h1>\n    <p>You must be 18 years or older to access this site.</p>\n  </div>\n</div>";
}

populateAgeFields();

if (!isAgeVerified()) {
  showAgeGate();
} else {
  hideAgeGate();
}

// Contact form (present on index.html)
const contactForm = document.getElementById("contactForm");
const contactSuccess = document.getElementById("contactSuccess");
if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = contactForm.elements["name"].value.trim();
    const email = contactForm.elements["email"].value.trim();
    const subject = contactForm.elements["subject"]?.value.trim();
    const message = contactForm.elements["message"].value.trim();

    if (!name || !email || !message) {
      contactSuccess.textContent = "Please fill in all required fields (Name, Email, Message).";
      return;
    }

    contactForm.reset();
    contactSuccess.textContent = "Thanks! Your message has been sent. We'll get back to you soon.";

    setTimeout(() => {
      contactSuccess.textContent = "";
    }, 7000);
  });
}
