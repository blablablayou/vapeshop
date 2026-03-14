const AUTH_KEY = "negozio-auth";
const ADMIN_CREDENTIALS = { email: "admin@store.com", password: "admin123" };

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY));
  } catch {
    return null;
  }
}

function setStoredUser(user) {
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  } catch {
    // ignore
  }
}

function clearUser() {
  localStorage.removeItem(AUTH_KEY);
}

function isAdmin() {
  const user = getStoredUser();
  return user?.isAdmin === true;
}

function isLoggedIn() {
  return !!getStoredUser();
}

function requireLogin(redirectTo = "login.html") {
  if (!isLoggedIn()) {
    window.location.href = redirectTo;
  }
}

function requireAdmin() {
  if (!isAdmin()) {
    window.location.href = "admin-login.html";
  }
}

function handleLoginForm(form) {
  const email = form.querySelector("[name='email']").value.trim();
  const password = form.querySelector("[name='password']").value;

  const storedUser = getStoredUser();
  if (storedUser && storedUser.email === email && storedUser.password === password) {
    setStoredUser(storedUser);
    window.location.href = "index.html";
    return;
  }

  alert("Invalid email or password.\nTry signing up first or use the demo credentials.");
}

function handleSignupForm(form) {
  const name = form.querySelector("[name='name']").value.trim();
  const email = form.querySelector("[name='email']").value.trim();
  const password = form.querySelector("[name='password']").value;
  const confirm = form.querySelector("[name='confirm']").value;

  if (!name || !email || !password) {
    alert("Please fill out all fields.");
    return;
  }

  if (password !== confirm) {
    alert("Passwords do not match.");
    return;
  }

  setStoredUser({ name, email, password, isAdmin: false });
  alert("Account created! You will be redirected to login.");
  window.location.href = "login.html";
}

function handleAdminLogin(form) {
  const email = form.querySelector("[name='email']").value.trim();
  const password = form.querySelector("[name='password']").value;

  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    setStoredUser({ email, isAdmin: true });
    window.location.href = "admin-dashboard.html";
    return;
  }

  alert("Invalid admin credentials.");
}

function logout(redirectTo = "login.html") {
  clearUser();
  window.location.href = redirectTo;
}

function setupAuthNavigation() {
  const accountLinks = document.querySelectorAll("a[data-auth="+"account"+"]");
  accountLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      if (!isLoggedIn()) return;
      event.preventDefault();
      logout("login.html");
    });
  });
}

window.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      handleLoginForm(loginForm);
    });
  }

  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", (event) => {
      event.preventDefault();
      handleSignupForm(signupForm);
    });
  }

  const adminLoginForm = document.getElementById("adminLoginForm");
  if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      handleAdminLogin(adminLoginForm);
    });
  }

  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => logout());
  }
});
