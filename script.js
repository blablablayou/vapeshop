const AGE_VERIFIED_KEY = "negozioAgeVerified";

const ageGate = document.getElementById("ageGate");
const yesButton = document.getElementById("ageYes");
const noButton = document.getElementById("ageNo");

function hideAgeGate() {
  ageGate.classList.add("age-gate--hidden");
  setTimeout(() => {
    ageGate.setAttribute("aria-hidden", "true");
  }, 220);
}

function showAgeGate() {
  ageGate.classList.remove("age-gate--hidden");
  ageGate.setAttribute("aria-hidden", "false");
}

function isAgeVerified() {
  try {
    return window.localStorage.getItem(AGE_VERIFIED_KEY) === "true";
  } catch (error) {
    return false;
  }
}

function setAgeVerified(value) {
  try {
    window.localStorage.setItem(AGE_VERIFIED_KEY, value ? "true" : "false");
  } catch (error) {
    // localStorage might be disabled (privacy mode)
  }
}

function onAgeConfirm() {
  setAgeVerified(true);
  hideAgeGate();
}

function onAgeDeny() {
  setAgeVerified(false);
  document.body.innerHTML = "<div style='height:100vh;display:flex;align-items:center;justify-content:center;padding:2rem;text-align:center;color:#fff;background:#000;'>\n  <div style='max-width:420px;'>\n    <h1>Sorry</h1>\n    <p>You must be 18 years or older to access this site.</p>\n  </div>\n</div>";
}

yesButton.addEventListener("click", onAgeConfirm);
noButton.addEventListener("click", onAgeDeny);

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
