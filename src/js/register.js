const getRegister = () => {
  let lightbox;
  let lightboxContent;
  // let container;

  function initialize() {
    initEvents();
  }

  function initEvents() {
    $('.register-button').on('click', () => {
      setSelections();
      displayLightbox();
      clearLightbox();
      // setContainer();
      setRegisterScreenContent();
      setRegisterEvents();
    });
  }

  function setSelections() {
    lightbox = $('.lightbox');
    lightboxContent = $('.lightbox')
      .find('.content');
  }

  function displayLightbox() {
    lightbox
      .addClass('register')
      .css('display', 'flex');
  }

  function clearLightbox() {
    lightboxContent.find('div').remove();
  }

  // function setContainer() {
  //   container =
  //     $('<div>')
  //       .appendTo(lightboxContent)
  //       .addClass('register-content');
  // }

  function setRegisterScreenContent() {
    lightboxContent.html(`
      <div class="register-image">
      </div>
      <div class="register-content"> 
        <p class="register-title">
          New Member Registration
        </p>
        <p class="register-text">
          Sign up to receive project updates and news
        </p>
        <div class="register-form-row">
          Name *
          <input type="text" name="name" />
        </div>
        <div class="register-form-row">
          Email Address *
          <input type="text" name="email" />
        </div>
        <div class="register-form-row">
          Institution
          <textarea rows="5" type="text" name="institution" />
        </div>
        <div class="register-form-buttons">
          <div class="register-submit-button">
            Submit
          </div>
          <div class="register-cancel-button">
            Cancel
          </div>
        </div>
      </div>
    `);
  }
  function setThankYouScreenContents() {
    lightboxContent.html(`
      <div class="register-image">
      </div>
      <div class="register-content"> 
        <p class="register-title">
          Thank You!
        </p>
        <p class="register-text register-thank-you-text">
          Your registration is complete. ImagineRio is in perpetual academic development. Project updates and news will be sent to the email address associated with your registration.
        </p>
        <div class="thankyou-buttons">
          <div class="thankyou-close-button">
            Close
          </div>
        </div>
      </div>
    `);
  }

  function setThankYouScreenEvents() {
    $('.thankyou-close-button').on('click', () => {
      lightbox.hide();
    });
  }

  function setRegisterEvents() {
    $('.register-submit-button').on('click', () => {
      clearLightbox();
      setThankYouScreenContents();
      setThankYouScreenEvents();
    });
    $('.register-cancel-button').on('click', () => {
      lightbox.hide();
    });
  }

  return {
    initialize,
  };
};

export default getRegister;
