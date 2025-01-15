var blendAmount = 70;
var delay = -10;
var windowWidth = window.innerWidth;
var bg = document.getElementById("bg");

document.onmousemove = function (e) {
  mouseX = Math.round(e.pageX / windowWidth * 100 - delay);

  col1 = mouseX - blendAmount;
  col2 = mouseX + blendAmount;

  bg.style.background = "linear-gradient(to right,rgb(54, 15, 95) " + col1 + "%,rgb(48, 78, 129) " + col2 + "%)";
}

function navigateSection(currentSectionId, targetSectionId) {
  const $currentSection = $(`#section-${currentSectionId}`);
  const $targetSection = $(`#section-${targetSectionId}`);

  if (targetSectionId > currentSectionId) {
    // Moving forward: validate required fields
    if (!validateSection($currentSection)) {
      Swal.fire({
        title: "Please fill out all required fields before proceeding.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }
  }

  // Switch sections
  $currentSection.addClass('hidden-section');
  $targetSection.removeClass('hidden-section');
}

function validateSection($section) {
  let isValid = true;
  $section.find('input[required], select[required]').each(function () {
    if (!$(this).val()) {
      isValid = false;
      $(this).addClass('is-invalid'); // Add a class for invalid fields (optional for styling)
    } else {
      $(this).removeClass('is-invalid'); // Remove invalid class if corrected
    }
  });
  return isValid;
};



function handlePageLoad() {
    const params = new URLSearchParams(window.location.search);
  
    // Handle validation errors
    const errors = params.get('errors');
    if (errors) {
      try {
        // Parse the JSON string to get error messages
        const errorMessages = JSON.parse(decodeURIComponent(errors));
  
        // Combine all errors into a single string with each error on a new line
        const errorText = errorMessages.map(msg => `• ${msg}`).join("\n");
  
        // Display using SweetAlert2
        Swal.fire({
          title: "Please try again!",
          text: errorText,
          icon: "error",
          confirmButtonText: "OK",
        });
      } catch (e) {
        console.error('Error parsing validation errors:', e);
      }
    }
    // Handle success message
    const success = params.get('success');
    if (success) {
      Swal.fire({
        title: "<h3 class='fw-bold text-secondary' style='font-size: 18px; margin: 0;'>Thank you for submitting the Cash Buyer Form. Our team will get back to you shortly!</h3>", // Smaller title
        html: "<p class='fw-bold text-primary' style='font-size: 26px;'>Draw your dream with us</p>", // Larger text
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#28a745", // Green color for the OK button
        //  footer: `<a  href="/blogs">Refer to the blog page for guidance</a>`,
  
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "/Nick-Cash-Buyer"; // Redirect to blogs on confirmation
        }
      });
    }
  
    // Populate form fields with data from query parameters
    const formElements = document.querySelectorAll("form#Preview-form [name]");
    formElements.forEach(element => {
      const value = params.get(element.name);
      if (value) {
        element.value = decodeURIComponent(value);
      }
    });
  }
  
  // Run on page load
  window.onload = handlePageLoad;