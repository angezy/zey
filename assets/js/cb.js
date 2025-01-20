

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

function toggleOtherInput() {
  const otherCheckbox = document.getElementById('OtherFinancing');
  const otherInputContainer = document.getElementById('otherInputContainer');
  const otherInput = document.getElementById('otherInput');

  if (otherCheckbox.checked) {
    otherInputContainer.style.display = 'block';
    otherInput.setAttribute('required', 'required'); // Make the input field required
  } else {
    otherInputContainer.style.display = 'none';
    otherInput.removeAttribute('required'); // Remove the required attribute
    otherInput.value = ''; // Optionally clear the input field
  }
};
function toggleProofUpload(isVisible) {
  const uploadContainer = document.getElementById('proofUploadContainer');
  if (isVisible) {
    uploadContainer.style.display = 'inline';
  } else {
    uploadContainer.style.display = 'none';
  }
};
function toggleOtherQuicklyInput() {
  const otherQuicklyRadio = document.getElementById('OtherQuickly');
  const otherInputContainer = document.getElementById('otherQuicklyInputContainer');
  const otherInput = document.getElementById('otherQuicklyInput');

  if (otherQuicklyRadio.checked) {
    otherInputContainer.style.display = 'block';
    otherInput.setAttribute('required', 'required'); // Make the input field required
  } else {
    otherInputContainer.style.display = 'none';
    otherInput.removeAttribute('required'); // Remove the required attribute
    otherInput.value = ''; // Optionally clear the input field
  }
}

// Attach event listeners to all radio buttons in the "Quickly" group
document.querySelectorAll('input[name="Quickly"]').forEach((radio) => {
  radio.addEventListener('change', toggleOtherQuicklyInput);
});

function toggleOtherPropertyInput() {
  const checkbox = document.getElementById('PropertyOther');
  const inputContainer = document.getElementById('propertyOtherInputContainer');

  if (checkbox.checked) {
    inputContainer.style.display = 'block';
  } else {
    inputContainer.style.display = 'none';
  }
}

// Function to toggle the visibility of the "Other" work type input
function toggleWorkTypeInput() {
  const checkbox = document.getElementById('WorkTypeOther');
  const inputContainer = document.getElementById('workTypeOtherInputContainer');

  if (checkbox.checked) {
    inputContainer.style.display = 'block';
  } else {
    inputContainer.style.display = 'none';
  }
};


const readinessDescriptions = {
  1: "Just browsing",
  2: "Thinking about it",
  3: "Researching options",
  4: "Getting prepared",
  5: "Somewhat ready",
  6: "Fairly ready",
  7: "Very ready",
  8: "Extremely ready",
  9: "Almost closing",
  10: "Ready to close today"
};

function updateReadinessLabel(value) {
  const label = readinessDescriptions[value];
  document.getElementById("purchaseReadinessLabel").innerText = label;
  document.getElementById("purchaseReadinessSlider").setAttribute("data-readiness-description", label);
}

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
        window.location.href = "/Cash-Buyer"; // Redirect to blogs on confirmation
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