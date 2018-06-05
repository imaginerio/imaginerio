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
    // lightboxContent.html(`
    //   <div class="register-image">
    //   </div>
    //   <div class="register-content">
    //     <p class="register-title">
    //       New Member Registration
    //     </p>
    //     <p class="register-text">
    //       Sign up to receive project updates and news
    //     </p>
    //     <div class="register-form-row">
    //       Name *
    //       <input type="text" name="name" />
    //     </div>
    //     <div class="register-form-row">
    //       Email Address *
    //       <input type="text" name="email" />
    //     </div>
    //     <div class="register-form-row">
    //       Institution
    //       <textarea rows="5" type="text" name="institution" />
    //     </div>
    //     <div class="register-form-buttons">
    //       <div class="register-submit-button">
    //         Submit
    //       </div>
    //       <div class="register-cancel-button">
    //         Cancel
    //       </div>
    //     </div>
    //   </div>
    // `);
    lightboxContent.html(`
      <div class="register-image">
      </div>
      <div id="mc_embed_signup" class="register-content">
        <div class="register-title-container">
          <p class="register-title">
            New Member Registration
          </p>
          <p class="register-text">
            Sign up to receive project updates and news
          </p>
        </div>
        <form action="https://rice.us18.list-manage.com/subscribe/post?u=93ce6abb6b21c6441c11959ad&amp;id=8bca138035" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate" target="_blank" novalidate>
            <div id="mc_embed_signup_scroll">
          
        <div class="indicates-required"><span class="asterisk">*</span> indicates required</div>
        <div class="mc-field-group">
          <label for="mce-EMAIL">Email Address  <span class="asterisk">*</span>
        </label>
          <input type="email" value="" name="EMAIL" class="required email" id="mce-EMAIL">
        </div>
        <div class="mc-field-group">
          <label for="mce-FNAME">First Name </label>
          <input type="text" value="" name="FNAME" class="" id="mce-FNAME">
        </div>
        <div class="mc-field-group">
          <label for="mce-LNAME">Last Name </label>
          <input type="text" value="" name="LNAME" class="" id="mce-LNAME">
        </div>
        <div class="mc-field-group">
          <label for="mce-MMERGE5">Organization </label>
          <input type="text" value="" name="MMERGE5" class="" id="mce-MMERGE5">
        </div>
          <div id="mce-responses" class="clear">
            <div class="response" id="mce-error-response" style="display:none"></div>
            <div class="response" id="mce-success-response" style="display:none"></div>
          </div>    <!-- real people should not fill this in and expect good things - do not remove this or risk form bot signups-->
            <div style="position: absolute; left: -5000px;" aria-hidden="true"><input type="text" name="b_93ce6abb6b21c6441c11959ad_8bca138035" tabindex="-1" value=""></div>
            <div class="clear register-form-buttons">
              <input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" class="button">
              <div class="register-cancel-button">
                Cancel
              </div>
            </div>
              
            </div>

        </form>
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
