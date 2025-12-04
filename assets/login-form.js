if (!customElements.get('login-form')) {
  class LoginForm extends HTMLElement {
    constructor() {
      super();
    }

    getCookie(name) {
      let cookieValue = `${name}=`;
      let ca = document.cookie.split(';');

      for (let i = 0; i < ca.length; i++) {
        let cookie = ca[i];

        while (cookie.charAt(0) === ' ') {
          cookie = cookie.substring(1);
        }

        if (cookie.indexOf(cookieValue) === 0) {
          return cookie.substring(cookieValue.length, cookie.length);
        }
      }

      return null;
    }

    submitForm() {
      const emailInput = this.querySelector('.js-login-email');
      const passwordInput = this.querySelector('.js-login-password');
      const formButton = this.querySelector('#customer_login button');

      if (this.getCookie('customer_data')) {
        const customerData = JSON.parse(this.getCookie('customer_data'));

        emailInput.value = customerData.email;
        passwordInput.value = customerData.password;

        formButton.click();
      }
    }

    connectedCallback() {
      this.submitForm();
    }

    handleSubmit(event) {
      event.preventDefault();
    }
  }

  customElements.define('login-form', LoginForm);
}