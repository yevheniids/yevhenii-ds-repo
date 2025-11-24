if (!customElements.get('products-list')) {
  class ProductsList extends HTMLElement {
    constructor() {
      super();

      this.stickyDotHandlers = this.querySelectorAll('.js-scroll-by-dot');
      this.items = this.querySelectorAll('.products-list__item');
      this.observer = null;
      this.isScrollingByDot = false;
    }

    updateActiveItem(productId) {
      const activeDot = this.querySelector('.products-list__sticky-dot--active');
      const activeProduct = this.querySelector('.products-list__sticky-dots-product--active');
      const currentDot = this.querySelector(`.js-scroll-by-dot[data-product-id="${productId}"]`);
      const currentProduct = this.querySelector(`.products-list__sticky-dots-product[data-product-id="${productId}"]`);

      if (activeDot && activeDot !== currentDot) {
        activeDot.classList.remove('products-list__sticky-dot--active');
      }
      if (currentDot) {
        currentDot.classList.add('products-list__sticky-dot--active');
      }

      if (activeProduct && activeProduct !== currentProduct) {
        activeProduct.classList.remove('products-list__sticky-dots-product--active');
      }
      if (currentProduct) {
        currentProduct.classList.add('products-list__sticky-dots-product--active');
      }
    }

    scrollByDot(e) {
      e.preventDefault();

      const currentTarget = e.currentTarget;

      if (currentTarget.classList.contains('products-list__sticky-dot--active')) {
        return;
      }

      const currentItem = this.querySelector(`.products-list__item[data-product-id="${currentTarget.dataset.productId}"]`);

      this.isScrollingByDot = true;
      this.updateActiveItem(currentTarget.dataset.productId);

      window.scrollTo({
        top: window.scrollY + (currentItem?.getBoundingClientRect().top ?? 0) + 80,
        behavior: 'smooth'
      });

      setTimeout(() => {
        this.isScrollingByDot = false;
      }, 1000);
    }

    observeItems() {
      if (!this.items.length) return;

      const options = {
        root: null,
        rootMargin: '-49.9% 0px -49.9% 0px',
        threshold: 0
      };

      this.observer = new IntersectionObserver((entries) => {
        if (this.isScrollingByDot) return;

        let mostVisibleEntry = null;
        let maxIntersectionRatio = 0;

        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio > maxIntersectionRatio) {
            maxIntersectionRatio = entry.intersectionRatio;
            mostVisibleEntry = entry;
          }
        });

        if (mostVisibleEntry) {
          const productId = mostVisibleEntry.target.dataset.productId;

          this.updateActiveItem(productId);
        }
      }, options);

      this.items.forEach(item => {
        this.observer.observe(item);
      });
    }

    connectedCallback() {
      this.stickyDotHandlers.forEach(handler => {
        handler.addEventListener('click', this.scrollByDot.bind(this));
      });

      this.observeItems();
    }

    disconnectedCallback() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
    }
  }

  customElements.define('products-list', ProductsList);
}