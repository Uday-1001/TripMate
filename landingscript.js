// Open Modal
function openModal() {
  document.getElementById("authModal").classList.add("active");
  document.body.style.overflow = "hidden";
}

// Close Modal
function closeModal() {
  document.getElementById("authModal").classList.remove("active");
  document.body.style.overflow = "auto";
}

// Close modal when clicking outside
document.getElementById("authModal").addEventListener("click", function (e) {
  if (e.target === this) {
    closeModal();
  }
});

// Switch between Login and Sign Up tabs
function switchTab(tab) {
  const tabBtns = document.querySelectorAll(".tab-btn");
  const forms = document.querySelectorAll(".form-content");

  tabBtns.forEach((btn) => btn.classList.remove("active"));
  forms.forEach((form) => form.classList.remove("active"));

  if (tab === "login") {
    tabBtns[0].classList.add("active");
    document.getElementById("loginForm").classList.add("active");
  } else {
    tabBtns[1].classList.add("active");
    document.getElementById("signupForm").classList.add("active");
  }
}

// Handle Login
async function handleLogin(event) {
  event.preventDefault();
  console.log("Login form submitted");

  const email = event.target.querySelector('input[type="email"]').value;
  const password = event.target.querySelector('input[type="password"]').value;

  console.log("Login attempt with email:", email);

  if (!email || !password) {
    alert("Please fill in all fields!");
    return;
  }

  try {
    console.log("Calling API.Auth.login...");
    const response = await API.Auth.login(email, password);
    console.log("Login successful:", response);

    localStorage.setItem("tripmate_token", response.token);
    localStorage.setItem("user_id", response.user._id);
    localStorage.setItem("user_name", response.user.name);
    localStorage.setItem("user_email", response.user.email);

    alert("✅ Login successful! Redirecting...");
    window.location.href = "homepage.html";
  } catch (error) {
    console.error("Login error caught:", error);
    const errorMsg = error.message || "Invalid credentials";
    if (
      errorMsg.includes("Network error") ||
      errorMsg.includes("Connection error")
    ) {
      alert(
        "❌ Cannot connect to server.\n\nMake sure:\n1. Backend is running (npm start in Tripmate-backend)\n2. Frontend is running (node server.js in Tripmate-frontend)\n3. Both are on ports 5000 and 3000",
      );
    } else {
      alert("❌ Login failed: " + errorMsg);
    }
  }
}

// Handle Sign Up
async function handleSignup(event) {
  event.preventDefault();
  console.log("Signup form submitted");

  // Get all form inputs from the signup form
  const form = event.target;
  const inputs = form.querySelectorAll(
    'input[type="text"], input[type="email"], input[type="tel"], input[type="password"], select',
  );

  // Extract values
  const firstName = inputs[0]?.value || "";
  const lastName = inputs[1]?.value || "";
  const email = form.querySelector('input[type="email"]').value;
  const phone = form.querySelector('input[type="tel"]').value;
  const country = form.querySelector("select").value;
  const passwordInputs = form.querySelectorAll('input[type="password"]');
  const password = passwordInputs[0]?.value || "";
  const confirmPassword = passwordInputs[1]?.value || "";
  const termsCheckbox = document.getElementById("termsAgree").checked;

  console.log("Signup data:", { firstName, lastName, email, phone, country });

  // Validate all required fields
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !country ||
    !password ||
    !confirmPassword
  ) {
    alert("Please fill in all required fields!");
    return;
  }

  if (!termsCheckbox) {
    alert("Please agree to the Terms & Conditions!");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  try {
    // Combine first and last name
    const fullName = firstName + " " + lastName;
    console.log("Calling API.Auth.register with:", { fullName, email });

    const response = await API.Auth.register(
      fullName,
      email,
      password,
      confirmPassword,
    );

    console.log("Signup successful:", response);

    localStorage.setItem("tripmate_token", response.token);
    localStorage.setItem("user_id", response.user._id);
    localStorage.setItem("user_name", response.user.name);
    localStorage.setItem("user_email", response.user.email || email);
    localStorage.setItem("user_phone", phone);

    alert("✅ Account created successfully! Welcome to TripMate!");
    closeModal();
    window.location.href = "homepage.html";
  } catch (error) {
    console.error("Signup error caught:", error);
    const errorMsg = error.message || "Please try again";
    if (
      errorMsg.includes("Network error") ||
      errorMsg.includes("Connection error")
    ) {
      alert(
        "❌ Cannot connect to server.\n\nMake sure:\n1. Backend is running (npm start in Tripmate-backend)\n2. Frontend is running (node server.js in Tripmate-frontend)\n3. Both are on ports 5000 and 3000",
      );
    } else if (errorMsg.includes("already exists")) {
      alert(
        "❌ Email already registered. Please use a different email or try logging in.",
      );
    } else if (errorMsg.includes("at least 6")) {
      alert("❌ Password must be at least 6 characters long.");
    } else if (errorMsg.includes("Invalid email")) {
      alert("❌ Please enter a valid email address.");
    } else {
      alert("❌ Registration failed: " + errorMsg);
    }
  }
}

// Handle Social Login
function socialLogin(platform) {
  console.log(`Logging in with ${platform}`);
  alert(
    `${platform.charAt(0).toUpperCase() + platform.slice(1)} login coming soon!`,
  );
}

// Initialize Google Login
function initializeGoogleLogin() {
  const googleBtn = document.getElementById("google-login-btn");
  if (googleBtn) {
    googleBtn.addEventListener("click", async () => {
      try {
        // Check if Google API is loaded
        if (typeof google === "undefined" || !google.accounts) {
          console.error("Google Sign-In SDK not loaded");

          // Fallback: Show a simple prompt for testing
          const clientId = prompt(
            "⚠️ Google SDK not loaded.\n\nTo use Google login:\n1. Create a Google Cloud Project\n2. Add Client ID here:\n\nFor testing, enter your Google Client ID:",
          );

          if (clientId && clientId.trim()) {
            localStorage.setItem("google_client_id", clientId);
            window.location.reload();
          }
          return;
        }

        // Initialize Google Sign-In
        google.accounts.id.initialize({
          client_id: window.GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_NOT_SET",
          callback: handleGoogleLogin,
          auto_select: false,
        });

        // Render the Google Sign-In button
        google.accounts.id.renderButton(googleBtn, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "signin_with",
          logo_alignment: "left",
          width: "100%",
        });

        console.log("✅ Google Sign-In initialized");
      } catch (error) {
        console.error("❌ Google initialization error:", error);
        alert(
          "❌ Google OAuth Error:\\n\\n" +
            error.message +
            "\\n\\nSetup required:\\n1. Get Google Client ID from Google Cloud Console\\n2. Add http://localhost:3000 to authorized origins\\n3. Update GOOGLE_CLIENT_ID in .env file\\n4. Restart backend\\n5. Refresh browser",
        );
      }
    });
  }
}

// Handle Google Login Response
async function handleGoogleLogin(response) {
  if (!response || !response.credential) {
    console.error("No credential received from Google");
    alert("Google login failed. Please try again.");
    return;
  }

  const token = response.credential;
  console.log("Google token received:", token.substring(0, 20) + "...");

  try {
    console.log("Sending token to backend...");
    const result = await API.Auth.googleLogin(token);
    console.log("Google login successful:", result);

    // Store user data
    localStorage.setItem("tripmate_token", result.token);
    localStorage.setItem("user_id", result.user._id);
    localStorage.setItem("user_name", result.user.name);
    localStorage.setItem("user_email", result.user.email);
    if (result.user.profilePicture) {
      localStorage.setItem("user_profile_picture", result.user.profilePicture);
    }

    console.log("User data stored, redirecting to homepage...");
    // Close modal and redirect
    closeModal();
    alert("Login successful! Redirecting...");
    window.location.href = "homepage.html";
  } catch (error) {
    console.error("Google login error:", error);
    alert("Google login failed: " + (error.message || "Please try again."));
  }
}

// Initialize Facebook Login
function initializeFacebookLogin() {
  const facebookBtn = document.getElementById("facebook-login-btn");
  if (facebookBtn) {
    facebookBtn.addEventListener("click", async () => {
      try {
        // Check if Facebook SDK is loaded
        if (typeof FB === "undefined") {
          console.error("Facebook SDK not loaded");
          alert(
            "❌ Facebook SDK failed to load.\\n\\nSetup required:\\n1. Go to Facebook Developers\\n2. Create an App (Consumer type)\\n3. Add Facebook Login product\\n4. Add http://localhost to App Domains\\n5. Copy App ID and update .env file",
          );
          return;
        }

        FB.login(
          async function (response) {
            if (response.authResponse) {
              const accessToken = response.authResponse.accessToken;
              console.log(
                "Facebook token received:",
                accessToken.substring(0, 20) + "...",
              );
              await handleFacebookLogin(accessToken);
            } else {
              console.log("Facebook login cancelled");
              alert("Facebook login was cancelled by user.");
            }
          },
          { scope: "public_profile,email" },
        );
      } catch (error) {
        console.error("Facebook initialization error:", error);
        alert("Facebook login configuration error. Please try again.");
      }
    });
  }
}

// Handle Facebook Login Response
async function handleFacebookLogin(accessToken) {
  try {
    console.log("Sending Facebook token to backend...");
    const result = await API.Auth.facebookLogin(accessToken);
    console.log("Facebook login successful:", result);

    // Store user data
    localStorage.setItem("tripmate_token", result.token);
    localStorage.setItem("user_id", result.user._id);
    localStorage.setItem("user_name", result.user.name);
    localStorage.setItem("user_email", result.user.email);
    if (result.user.profilePicture) {
      localStorage.setItem("user_profile_picture", result.user.profilePicture);
    }

    console.log("User data stored, redirecting to homepage...");
    // Close modal and redirect
    closeModal();
    alert("Login successful! Redirecting...");
    window.location.href = "homepage.html";
  } catch (error) {
    console.error("Facebook login error:", error);
    alert("Facebook login failed: " + (error.message || "Please try again."));
  }
}

// Initialize OAuth on page load
document.addEventListener("DOMContentLoaded", () => {
  initializeGoogleLogin();
  initializeFacebookLogin();
});

// Fade-in animation on scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -100px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, observerOptions);

document.querySelectorAll(".fade-in").forEach((el) => {
  observer.observe(el);
});

// Animated counter for stats
const animateCounter = (element, target) => {
  let current = 0;
  const increment = target / 100;
  const duration = 2000;
  const stepTime = duration / 100;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target.toLocaleString();
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current).toLocaleString();
    }
  }, stepTime);
};

// Observe stats section for counter animation
const statsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const counters = entry.target.querySelectorAll(
          ".stat-number[data-target]",
        );
        counters.forEach((counter) => {
          const target = parseInt(counter.getAttribute("data-target"));
          animateCounter(counter, target);
        });
        statsObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 },
);

const statsSection = document.querySelector(".stats-section");
if (statsSection) {
  statsObserver.observe(statsSection);
}

// Smooth scroll for all anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Parallax effect for testimonials background
window.addEventListener("scroll", () => {
  const testimonialsBg = document.querySelector(".testimonials-bg");
  if (testimonialsBg) {
    const scrolled = window.pageYOffset;
    const rate = scrolled * 0.3;
    testimonialsBg.style.transform = `translateY(${rate}px)`;
  }
});

// Add hover sound effect (optional - remove if not needed)
document
  .querySelectorAll(".step-card, .experience-card, .stat-item")
  .forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.style.transition =
        "all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
    });
  });

// CTA button pulse effect
const ctaButtons = document.querySelectorAll(".cta-button, .btn-primary");
ctaButtons.forEach((btn) => {
  setInterval(() => {
    btn.style.animation = "none";
    setTimeout(() => {
      btn.style.animation = "";
    }, 10);
  }, 3000);
});
