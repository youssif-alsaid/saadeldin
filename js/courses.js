document.addEventListener("DOMContentLoaded", function () {
  // Load SweetAlert2 if not already loaded
  if (typeof Swal === "undefined") {
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/limonte-sweetalert2/11.10.1/sweetalert2.all.min.js";
    script.onload = function () {
      console.log("SweetAlert2 loaded successfully");
    };
    document.head.appendChild(script);

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://cdnjs.cloudflare.com/ajax/libs/limonte-sweetalert2/11.10.1/sweetalert2.min.css";
    document.head.appendChild(link);
  }

  // Select the container for the courses on the home page
  const coursesContainer = document.querySelector(".courses-home .row");

  // API and storage base URLs
  const apiBaseUrl = "https://api-platfrom.ro-s.net/api/";
  const storageBaseUrl = "http://127.0.0.1:8000/storage/";
  const API_URL = "https://api-platfrom.ro-s.net/api/get-courses";


  async function fetchAndDisplayCourses() {
    if (!coursesContainer) return;

    let courses = [];        // ← تعريفها هنا
    let subscribedIds = [];

    // 1) جلب الكورسات
    try {
      const response = await tenantFetch(`${apiBaseUrl}courses`);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const jsonResponse = await response.json();
      courses = jsonResponse.data || jsonResponse; // Handle wrapped or unwrapped response

      // إزالة الكروت القديمة
      const existingCards = coursesContainer.querySelectorAll(".card-course");
      existingCards.forEach((card) => card.remove());

    } catch (error) {
      console.error("Error fetching or displaying courses:", error);
      coursesContainer.innerHTML +=
        '<p class="text-center text-danger w-100">حدث خطأ أثناء تحميل الكورسات.</p>';
      return; // stop execution
    }

    // 2) جلب اشتراكات الطالب
    try {
      const apiToken = localStorage.getItem("apiToken");

      if (apiToken) {
        const headers = {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Authorization": `Bearer ${apiToken}`
        };

        const response = await tenantFetch(API_URL, { method: "GET", headers });
        if (response.ok) {
          const studentData = await response.json();
          if (studentData.success === true) {
            const coursesList = studentData.courses.data || studentData.courses;
            if (Array.isArray(coursesList)) {
              subscribedIds = coursesList.map((course) => course.id);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error fetching student courses:", err);
    }

    // 3) عرض الكورسات بعد تجهيز البيانات كلها
    courses.forEach((course) => {
      const courseCard = createCourseCard(course, subscribedIds);
      coursesContainer.appendChild(courseCard);
    });
  }


  function createCourseCard(course, subscribedIds) {
    const cardDiv = document.createElement("div");
    cardDiv.className = "col-md-6 col-lg-4 card-course";

    const courseName = `${course.title} - ${course.grade ? course.grade.name : ''}`;
    let imageUrl = "media/img/default-course.jpg";
    if (course.image) {
      if (course.image.startsWith("http")) {
        imageUrl = course.image;
      } else {
        imageUrl = `${storageBaseUrl}${course.image}`;
      }
    }

    // Format dates in Arabic
    const startDate = new Date(course.created_at).toLocaleDateString(
      "ar-EG-u-nu-arab",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
    const updatedAt = new Date(course.updated_at).toLocaleDateString(
      "ar-EG-u-nu-arab",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

    let priceHtml = "";

    // إزالة العلامات العشرية
    const price = course.price ? Math.round(course.price) : null;
    const discountPrice = course.discount_price
      ? Math.round(course.discount_price)
      : null;

    if (subscribedIds.includes(course.id)) {

      priceHtml = '<div class="you-subscription">انت مشترك</div>';
    } else {

      if (course.is_free === "1" || price === 0) {
        priceHtml = '<div class="price-free">كورس مجاني</div>';
      } else if (discountPrice && price) {
        priceHtml = `
                <div>
                    <div class="price"><span>${discountPrice}</span> جنيهاً</div>
                    <div class="price-del">بدلاً من <span>${price}</span></div>
                </div>
            `;
      } else if (price) {
        priceHtml = `<div class="price"><span>${price}</span> جنيهاً</div>`;
      }
    }

    let priceOrSubscriptionHtml = `
      <div class="data-course">
        ${priceHtml}
        <div class="info-course">
          <p class="date-course">
            ${startDate}
            <i class="fa-solid fa-folder-plus"></i>
          </p>
          <p class="update-course">
            ${updatedAt}
            <i class="fa-solid fa-file-circle-plus fa-fade"></i>
          </p>
        </div>
      </div>
    `;

    let buttonsHtml = `
        <a href="course-page.html?id=${course.id}" class="check">بص على الكورس</a>
    `;

    if (course.is_free === "1" || price === 0) {
      cardDiv.innerHTML = `
            <div class="course course-free ">
                <img src="${imageUrl}" alt="${course.name}" loading="lazy" />
                <div class="content-course">
                    <h4>${courseName}</h4>
                    <p class="number-lect">${course.description}</p>
                    
                    ${priceOrSubscriptionHtml}
                    <div class="course-subscription">
                        ${buttonsHtml}
                    </div>
                </div>
            </div>`;
    } else {
      cardDiv.innerHTML = `
        <div class="course">
            <img src="${imageUrl}" alt="${course.name}" loading="lazy" />
            <div class="content-course">
                <h4>${courseName}</h4>
                <p class="number-lect">${course.description}</p>
                
                ${priceOrSubscriptionHtml}
                <div class="course-subscription">
                    ${buttonsHtml}
                </div>
            </div>
        </div>`;
    }

    return cardDiv;
  }

  // Function to check if user is logged in
  function isLoggedIn() {
    const apiToken = localStorage.getItem("apiToken");
    const studentData = localStorage.getItem("studentData");
    return apiToken && studentData;
  }

  // Function to show subscription code popup
  async function showSubscriptionCodePopup(courseId) {
    if (typeof Swal === "undefined") {
      alert("جاري تحميل المكتبات، حاول مرة أخرى بعد ثواني");
      return;
    }

    const { value: subscriptionCode } = await Swal.fire({
      title: "ادخل كود الاشتراك",
      html: `
            <div style="display: flex; justify-content: center; align-items: center;">
                <input id="subscription-code" class="swal2-input" style="width: 60%; text-align: center; font-size: 18px;">
            </div>
        `,
      showCancelButton: true,
      confirmButtonText: "تفعيل الكود",
      cancelButtonText: "إلغاء",
      background: "rgb(78, 194, 192)",
      confirmButtonColor: "#FFD700",
      cancelButtonColor: "#d33",
      preConfirm: () => {
        const code = document.getElementById("subscription-code").value.trim();
        if (!code) {
          Swal.showValidationMessage("ادخل الكود");
          return false;
        }
        return code.toUpperCase();
      },
    });

    if (subscriptionCode) verifyAndSubscribe(courseId, subscriptionCode);
  }

  // Function to verify subscription code and subscribe
  async function verifyAndSubscribe(courseId, subscriptionCode) {
    const apiToken = localStorage.getItem("apiToken");

    // Check if SweetAlert2 is loaded
    if (typeof Swal === "undefined") {
      alert("حدث خطأ في تحميل المكتبات المطلوبة، حاول مرة أخرى");
      return;
    }

    // Show loading
    Swal.fire({
      title: "جاري التحقق من الكود...",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      background:
        "linear-gradient(to right, rgba(37, 64, 143,1), rgba(48, 209, 201,1) 80%)",
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await tenantFetch(`${apiBaseUrl}coupon/redeem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({
          code: subscriptionCode,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Success with course details
        const courseInfo = data.course;
        let priceText = "";

        if (courseInfo.final_price === 0) {
          priceText = "مجاناً";
        } else if (courseInfo.discount > 0) {
          priceText = `${courseInfo.final_price} جنيهاً بدلاً من ${courseInfo.original_price} جنيهاً`;
        } else {
          priceText = `${courseInfo.final_price} جنيهاً`;
        }

        Swal.fire({
          html: `
                        <div style="text-align: center; color: white; direction: rtl;">
                            <h3 style="font-size: 24px; font-weight: bold; margin-bottom: 15px;">
                                🎉 تم الاشتراك بنجاح! 🎉
                            </h3>
                        </div>
                    `,
          icon: "success",
          confirmButtonText: "خش زاكر ",
          background: "rgb(78, 194, 192)",
          confirmButtonColor: "#FFD700",
          customClass: {
            popup: "swal-custom-popup",
            confirmButton: "swal-confirm-button",
          },
        }).then(() => {
          // Redirect to student profile or course page
          window.location.href = `course-page.html?id=${courseInfo.id}`;
        });
      } else {
        // Error in subscription - handle invalid code or token issues
        let errorTitle = "كود غير صالح";
        let errorMessage = "الكود المدخل غير صالح، تأكد منه وحاول مرة أخرى";

        // لو المشكلة توكن
        if (data.message?.includes("توكن")) {
          errorTitle = "خطأ في تسجيل الدخول";
          errorMessage = "انتهت جلسة تسجيل الدخول، سجل دخولك مرة أخرى";
        }

        Swal.fire({
          title: errorTitle,
          text: errorMessage,
          icon: "error",
          confirmButtonText: "حاول مرة أخرى",
          background: "rgb(78, 194, 192)",
          confirmButtonColor: "#FFD700",
          customClass: {
            popup: "swal-custom-popup",
            confirmButton: "swal-confirm-button",
          },
        }).then(() => {
          // إعادة توجيه في حالة التوكن
          if (data.message?.includes("توكن")) {
            localStorage.removeItem("apiToken");
            localStorage.removeItem("studentData");
            window.location.href = "login.html";
          }
        });
      }
    } catch (error) {
      console.error("Error verifying coupon code:", error);
      Swal.fire({
        title: "خطأ في الاتصال",
        text: "حدث خطأ في الاتصال بالخادم، تأكد من اتصالك بالإنترنت وحاول مرة أخرى",
        icon: "error",
        confirmButtonText: "حاول مرة أخرى",
        background: "rgb(78, 194, 192)",
        confirmButtonColor: "#FFD700",
        customClass: {
          popup: "swal-custom-popup",
          confirmButton: "swal-confirm-button",
        },
      });
    }
  }

  // Event delegation for subscription buttons
  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("subscription")) {
      e.preventDefault();

      const courseId = e.target.getAttribute("data-course-id");

      // Check if user is logged in
      if (!isLoggedIn()) {
        // Use basic alert if SweetAlert2 is not loaded
        if (typeof Swal === "undefined") {
          if (
            confirm(
              "يجب تسجيل الدخول أولاً للاشتراك في الكورسات. هل تريد الانتقال لصفحة تسجيل الدخول؟"
            )
          ) {
            window.location.href = "login.html";
          }
          return;
        }

        Swal.fire({
          title: "يجب تسجيل الدخول أولاً",
          text: "من فضلك سجل دخولك أولاً للاشتراك في الكورسات",
          icon: "warning",
          confirmButtonText: "تسجيل الدخول",
          showCancelButton: true,
          cancelButtonText: "إلغاء",
          background: "rgb(78, 194, 192)",
          confirmButtonColor: "#FFD700",
          cancelButtonColor: "#d33",
          customClass: {
            popup: "swal-custom-popup",
            confirmButton: "swal-confirm-button",
            cancelButton: "swal-cancel-button",
          },
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = "login.html";
          }
        });
        return;
      }

      // Show subscription code popup
      showSubscriptionCodePopup(courseId);
    }
  });

  fetchAndDisplayCourses();
});
