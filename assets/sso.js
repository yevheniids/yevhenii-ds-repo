if (!customElements.get('sso-login')) {
  class SSOLogin extends HTMLElement {
    constructor() {
      super();

      this.selectors = {
        buttonSendCode: '.js-send-code',
        buttonVerifyCode: '.js-verify-code',
        error: '.sso-login__error',
        success: '.sso-login__success',
        formVerify: '.sso-login__form--verify',

        formHidden: 'sso-login__form--hidden',
        classBlocked: 'sso-login__form--blocked',
      };

      this.apiBaseUrl = this.getAttribute('data-api-base-url');
      this.buttonSendCode = this.querySelector(this.selectors.buttonSendCode);
      this.buttonVerifyCode = this.querySelector(this.selectors.buttonVerifyCode);

      this.phoneNumber = null;
      this.email = null;
    }

    setupCookies(name, value) {
      document.cookie = `${name}=${value}; max-age=3600; path=/;`;
    }

    generatePassword(length = 16) {
      const charset = "abcdefghijklmnopqrstuvwxyz" +
          "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789" +
          "!@#$%^&*()_+-=[]{}<>?";

      const array = new Uint32Array(length);
      crypto.getRandomValues(array);

      return Array.from(array).map(x => charset[x % charset.length]).join('');
    }

    async handleSendCode(event) {
      event.preventDefault();

      const form = event.target.closest('form');
      const error = form.querySelector(this.selectors.error);
      const formData = new FormData(form);
      const formVerify = this.querySelector(this.selectors.formVerify);
      const success = form.querySelector(this.selectors.success);
      const phone = formData.get('phone');

      this.phoneNumber = phone;

      error.textContent = '';
      success.textContent = '';

      if (!phone) {
        error.textContent = window.ssoMessages.phoneNumberRequired || 'Phone number is required';

        return;
      }

      try {
        const response = await fetch(`${this.apiBaseUrl}/send-verification-code`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phone }),
        });

        form.classList.add(this.selectors.classBlocked);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        this.phoneNumber = phone;

        if (data.success === true) {
          success.textContent = window.ssoMessages.verificationSent || 'Verification code sent successfully';
          form.classList.add(this.selectors.formHidden);
          formVerify.classList.remove(this.selectors.formHidden);
        }
      } catch (error) {
        console.error(error);
      } finally {
        form.classList.remove(this.selectors.classBlocked);
      }
    }

    async handleVerifyCode(event) {
      event.preventDefault();

      const form = event.target.closest('form');
      const error = form.querySelector(this.selectors.error);
      const formData = new FormData(form);
      const code = formData.get('code');

      error.textContent = '';

      if (!code) {
        error.textContent = window.ssoMessages.codeRequired || 'Code is required';

        return;
      }

      try {
        const response = await fetch(`${this.apiBaseUrl}/check-verification-code`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: this.phoneNumber,
            code: code,
          }),
        });

        form.classList.add(this.selectors.classBlocked);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success === true && data.status === 'approved') {
          const customerData = await this.checkCustomerExists();

          this.setupCookies('customer_data', JSON.stringify(customerData.customer.ssoData));
          window.location.href = '/account/login';
        } else {
          error.textContent = window.ssoMessages.verificationFailed || 'Verification failed';
        }
      } catch (error) {
        console.error(error);
      } finally {
        form.classList.remove(this.selectors.classBlocked);
      }
    }

    async checkCustomerExists() {
      const email = `${this.phoneNumber}@sso.com`;
      const password = this.generatePassword(16);

      try {
        const response = await fetch(`${this.apiBaseUrl}/check-customer-exists`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email, password: password })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        return data;
      } catch (error) {
        console.error(error);
      }
    }

    addEventListeners() {
      if (this.buttonSendCode) {
        this.buttonSendCode.addEventListener('click', this.handleSendCode.bind(this));
      }

      if (this.buttonVerifyCode) {
        this.buttonVerifyCode.addEventListener('click', this.handleVerifyCode.bind(this));
      }
    }

    removeEventListeners() {
      if (this.buttonSendCode) {
        this.buttonSendCode.removeEventListener('click', this.handleSendCode.bind(this));
      }

      if (this.buttonVerifyCode) {
        this.buttonVerifyCode.removeEventListener('click', this.handleVerifyCode.bind(this));
      }
    }

    connectedCallback() {
      this.addEventListeners();
    }

    disconnectedCallback() {
      this.removeEventListeners();
    }
  }

  customElements.define('sso-login', SSOLogin);
}
