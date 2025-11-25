if (!customElements.get('video-section')) {
  class VideoSection extends HTMLElement {
    constructor() {
      super();
    }

    initWindowHeight() {
      const height = window.innerHeight;

      document.documentElement.style.setProperty('--window-height', `${(height / 2) + 75}px`);
    }

    initListeners() {
      window.addEventListener('resize', this.initWindowHeight.bind(this));
    }

    connectedCallback() {
      this.initWindowHeight();
      this.initListeners();
    }
  }

  customElements.define('video-section', VideoSection);
}