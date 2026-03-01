// دالة fetch مخصصة لإرسال tenant id تلقائيًا
window.tenantFetch = function (url, options = {}) {
  const TENANT_ID = 1;
  options = options || {};
  options.headers = options.headers || {};
  // دعم headers كـ Headers أو كائن عادي
  if (options.headers instanceof Headers) {
    options.headers.append("X-Tenant-ID", TENANT_ID);
  } else {
    options.headers["X-Tenant-ID"] = TENANT_ID;
  }
  return fetch(url, options);
};
function auth() {
  document.addEventListener("DOMContentLoaded", function () {
    const path = window.location.pathname;
    const isAuthPage =
      path.includes("login") || path.includes("create-account");

    // ✅ نحاول قراءة بيانات الطالب
    let studentData = null;
    try {
      studentData = JSON.parse(localStorage.getItem("studentData") || "null");
    } catch (e) {
      studentData = null;
    }

    const isLoggedIn = !!(studentData && studentData.api_token);

    // ✅ منع الوصول لصفحات معينة بدون تسجيل دخول
    const restrictedPages = [
      "student-profile",
      "fawaterk",
      "courses",
      "analysis",
    ];
    const isRestrictedPage = restrictedPages.some((page) =>
      path.includes(page),
    );
    if (!isLoggedIn && isRestrictedPage) {
      window.location.href = "login.html";
      return;
    }

    const container = document.getElementById("nav-links-container");

    if (!container) return;

    if (isLoggedIn) {
      // 🟢 المستخدم داخل بحسابه
      container.innerHTML = `
            <div class="user-menu">
              <lord-icon
                src="https://cdn.lordicon.com/kdduutaw.json"
                trigger="hover"
                stroke="bold"
                state="hover-nodding"
                colors="primary:#f3f3f3,secondary:#FFCF71"
                style="width: 35px; height: 35px"
                class="user-icon"
              ></lord-icon>
  
              <div class="dropdown-content" id="dropdownMenu">
                <a href="/">
                  <lord-icon src="https://cdn.lordicon.com/jeuxydnh.json" trigger="loop" stroke="bold"
                    state="hover-nodding" colors="primary:#f3f3f3,secondary:#FFCF71"
                    style="width: 30px; height: 30px"></lord-icon>
                  الصفحة الرئيسية
                </a>
                <a href="student-profile.html">
                  <lord-icon src="https://cdn.lordicon.com/kdduutaw.json" trigger="loop" stroke="bold"
                    state="hover-nodding" colors="primary:#f3f3f3,secondary:#FFCF71"
                    style="width: 30px; height: 30px"></lord-icon>
                  ملفك الشخصي
                </a>
                <a href="analysis.html">
                  <lord-icon src="https://cdn.lordicon.com/abfverha.json" trigger="loop" stroke="bold"
                    colors="primary:#f3f3f3,secondary:#FFCF71"
                    style="width: 30px; height: 30px"></lord-icon> إحصائياتك
                </a>
                <a href="courses.html">
                  <lord-icon src="https://cdn.lordicon.com/rrbmabsx.json" trigger="loop" stroke="bold"
                    colors="primary:#f3f3f3,secondary:#FFCF71"
                    style="width: 30px; height: 30px"></lord-icon> كورساتك
                </a>
                <a href="fawaterk.html">
                  <lord-icon src="https://cdn.lordicon.com/bsdkzyjd.json" trigger="loop" stroke="bold"
                    state="in-reveal" colors = "primary:#f3f3f3,secondary:#FFCF71"
                    style="width: 30px; height: 30px"></lord-icon> فواتيرك
                </a>
                <a href="#" id="logoutBtn">
                  <lord-icon src="https://cdn.lordicon.com/vfiwitrm.json" trigger="loop" stroke="bold"
                    state="hover-nodding" colors="primary:#f3f3f3,secondary:#FFCF71"
                    style="width: 30px; height: 30px"></lord-icon> تسجيل خروج
                </a>
              </div>
            </div>
          `;
      setupUserMenuDropdown();
      initLogout();
    } else {
      container.innerHTML = `
                      <div class="parent-spinner">
                  <div class="spinner">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                </div>

                <div id="menu-toggle">
                  <i class="fa-solid fa-bars bars"></i>
                </div>

                <!-- روابط التنقل -->
                <ul class="links">
                  <li>
                    <a
                      href="create-account.html"
                      class="create-account"
                    >

                <img src="media/img/create-icon.svg" alt="create icon" />
                      
                      انشئ حسابك
                    </a>
                  </li>
                  <li>
                    <a href="login.html" class="login-button">
                <img src="media/img/login-icon.svg" alt="login icon" />

                      سجل دخولك
                    </a>
                  </li>
                </ul>
      `;
      initMenuToggle();
      createAccountIcon();
      loginIcon();
    }
  });
}

auth();

function showGlobalSpinner() {
  const spinner = document.getElementById("global-spinner");
  if (spinner) spinner.style.display = "flex";
}

function hideGlobalSpinner() {
  const spinner = document.getElementById("global-spinner");
  if (spinner) spinner.style.display = "none";
}

// Start navbar js

// Start dark mode
function initDarkMode() {
  const toggle = document.getElementById("toggle");
  const Changer = document.querySelectorAll(".changer");
  const body = document.body;
  const bars = document.querySelector(".bars");

  if (!toggle) return;
  let lightMode = JSON.parse(localStorage.getItem("lightMode"));

  if (lightMode === null) {
    lightMode = true; // الوضع الافتراضي لايت
  }
  const applyMode = () => {
    if (lightMode) {
      Changer.forEach((el) => el.classList.add("change"));
      // إزالة الدارك من كل العناصر
      document
        .querySelectorAll("*")
        .forEach((el) => el.classList.remove("dark"));
      if (bars) bars.classList.remove("dark");
    } else {
      Changer.forEach((el) => el.classList.remove("change"));
      // إضافة الدارك لكل العناصر
      document.querySelectorAll("*").forEach((el) => el.classList.add("dark"));
      if (bars) bars.classList.add("dark");
    }
  };

  applyMode();

  toggle.addEventListener("click", () => {
    lightMode = !lightMode;
    localStorage.setItem("lightMode", JSON.stringify(lightMode));
    applyMode();
  });

    // 👇 ده الجزء المهم
  const observer = new MutationObserver((mutations) => {
    if (!lightMode) {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            node.classList.add("dark");
            node.querySelectorAll("*").forEach(el => {
              el.classList.add("dark");
            });
          }
        });
      });
    }
  });

    observer.observe(document.body, {
    childList: true,
    subtree: true
  });

}

// End dark mode

// Start navbar hidden

function initNavbarScroll() {
  const navbar = document.querySelector(".nav-content");
  const scrollLine = document.querySelector(".scroll-line");
  if (!navbar || !scrollLine) return;

  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    const scrollHeight = document.body.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / scrollHeight) * 100;

    scrollLine.style.width = `calc(${scrollPercent}% - 20px)`;

    // لو عايز تضيف شادو للناف بار لما يبدأ التمرير
    if (scrollTop > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });
}

// End navbar hidden

// Start menu toggle
function initMenuToggle() {
  const bars = document.querySelector("#menu-toggle");
  const links = document.querySelector(".links");
  const spinner = document.querySelector(".parent-spinner");
  if (!bars || !links || !spinner) return;

  bars.addEventListener("click", function () {
    links.classList.toggle("active");
    bars.style.display = "none";
    spinner.style.display = "block";

    spinner.addEventListener("click", function () {
      links.classList.remove("active");
      bars.style.display = "flex";
      spinner.style.display = "none";
    });
  });
}

function createAccountIcon() {
  const iconCreateButton = document.querySelector("#icon-create-button");
  const btnLordIconCreate = document.querySelector(".create-account");

  if (btnLordIconCreate && iconCreateButton) {
    btnLordIconCreate.addEventListener("mouseenter", () => {
      iconCreateButton.setAttribute(
        "colors",
        "primary:#F3F3F3,secondary:#FF9D00",
      );
    });

    btnLordIconCreate.addEventListener("mouseleave", () => {
      iconCreateButton.setAttribute(
        "colors",
        "primary:#F3F3F3,secondary:#FF9D00",
      );
    });
  }
}

function loginIcon() {
  const iconLoginButton = document.querySelector("#icon-login-button");
  const btnLordIconLogin = document.querySelector(".login-button");

  if (btnLordIconLogin && iconLoginButton) {
    btnLordIconLogin.addEventListener("mouseenter", () => {
      iconLoginButton.setAttribute(
        "colors",
        "primary:#F3F3F3,secondary:#FFCF71",
      );
    });

    btnLordIconLogin.addEventListener("mouseleave", () => {
      iconLoginButton.setAttribute(
        "colors",
        "primary:#B6771D,secondary:#F3F3F3",
      );
    });
  }
}

function createNewAccount() {
  const iconCreateButton = document.querySelector("#icon-create-new-account");
  const btnLordIconCreate = document.querySelector("#create-new-account");

  if (btnLordIconCreate && iconCreateButton) {
    btnLordIconCreate.addEventListener("mouseenter", () => {
      iconCreateButton.setAttribute(
        "colors",
        "primary:#4B5563,secondary:#810000",
      );
      console.log("hovered create");
    });

    btnLordIconCreate.addEventListener("mouseleave", () => {
      iconCreateButton.setAttribute(
        "colors",
        "primary:#1B1717,secondary:#f3f3f3",
      );
      console.log("leave create");
    });
  }
}

function setupUserMenuDropdown() {
  const userMenu = document.querySelector(".user-menu");
  const menu = document.getElementById("dropdownMenu");
  if (!userMenu || !menu) return;

  userMenu.addEventListener("click", function (e) {
    e.stopPropagation();
    menu.classList.toggle("open");
    userMenu.classList.toggle("open");
  });

  window.addEventListener("click", function (e) {
    if (!userMenu.contains(e.target)) {
      menu.classList.remove("open");
      userMenu.classList.remove("open");
    }
  });

  window.addEventListener("scroll", function () {
    menu.classList.remove("open");
    userMenu.classList.remove("open");
  });
}

function checkLoginStatus() {
  const userMenu = document.querySelector(".user-menu");
  // استخدم api_token من studentData في localStorage
  let apiToken = null;
  try {
    const studentData = JSON.parse(localStorage.getItem("studentData") || "{}");
    apiToken = studentData && studentData.api_token;
  } catch (e) {
    apiToken = null;
  }
  if (!userMenu) return;
  userMenu.style.display = apiToken ? "block" : "none";
}

function initLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", function (e) {
    e.preventDefault();
    Swal.fire({
      title: "تأكيد تسجيل الخروج",
      text: "هل أنت متأكد من تسجيل الخروج؟",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "نعم، سجل خروجي",
      cancelButtonText: "إلغاء",
      background: "#810000",
      color: "#f3f3f3",
      fontFamily: "DG-3asomy-Regular",
      confirmButtonColor: "#1B1717",
      cancelButtonColor: "red",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        const studentData = JSON.parse(
          localStorage.getItem("studentData") || "{}",
        );
        const token = studentData.api_token;

        try {
          await fetch("https://api-platfrom.ro-s.net/api/student/logout", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          });
        } catch (err) {
          console.error("Logout API error", err);
        }

        localStorage.removeItem("studentData");
        Swal.fire({
          title: "تم تسجيل الخروج بنجاح!",
          text: "شكراً لاستخدامك المنصة ",
          icon: "success",
          confirmButtonText: "تمام",
          background: "#810000",
          color: "#f3f3f3",
          confirmButtonColor: "#1B1717",
        }).then(() => {
          window.location.href = "index.html";
        });
      }
    });
  });
}

function loadSweetAlert(callback) {
  if (typeof Swal !== "undefined") {
    callback();
    return;
  }
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
  script.onload = callback;
  document.head.appendChild(script);
}
// loadSweetAlert();

// function speacialHeading() {
//   const headings = document.querySelectorAll(".speacial-heading"); // كل الـ headings

//   headings.forEach((headingWrapper) => {
//     const heading = headingWrapper.querySelector("h1");
//     const img = headingWrapper.querySelector("img");

//     if (heading && img) {
//       const headingWidth = heading.offsetWidth; // عرض الهيدر الحالي
//       img.style.width = `${headingWidth-100}px`; // نخلي الصورة بنفس عرض الهيدر
//       // img.style.minWidth = "250px";
//     }
//   });
// }

// window.addEventListener("load", speacialHeading);
// window.addEventListener("resize", speacialHeading); // يتظبط مع تغيير حجم الصفحة

initDarkMode();
initNavbarScroll();
createAccountIcon();
loginIcon();
checkLoginStatus();

// End navbar js

// End navbar js
