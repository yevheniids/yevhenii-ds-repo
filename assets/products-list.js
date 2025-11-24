if (!customElements.get('products-list')) {
  class ProductsList extends HTMLElement {
    constructor() {
      super();

      this.stickyDotHandlers = this.querySelectorAll('.js-scroll-by-dot');
    }

    scrollByDot(e) {
      e.preventDefault();

      const currentTarget = e.currentTarget;

      if (currentTarget.classList.contains('products-list__sticky-dot--active')) {
        return;
      }

      const activeDot = this.querySelector('.products-list__sticky-dot--active');
      const activeProduct = this.querySelector('.products-list__sticky-dots-product--active');
      const currentProduct = this.querySelector(`.products-list__sticky-dots-product[data-product-id="${currentTarget.dataset.productId}"]`);
      const currentItem = this.querySelector(`.products-list__item[data-product-id="${currentTarget.dataset.productId}"]`);

      activeDot?.classList.remove('products-list__sticky-dot--active');
      currentTarget.classList.add('products-list__sticky-dot--active');
      activeProduct?.classList.remove('products-list__sticky-dots-product--active');
      currentProduct?.classList.add('products-list__sticky-dots-product--active');

      window.scrollTo({
        top: window.scrollY + (currentItem?.getBoundingClientRect().top ?? 0) + 80,
        behavior: 'smooth'
      });
    }

    connectedCallback() {
      this.stickyDotHandlers.forEach(handler => {
        handler.addEventListener('click', this.scrollByDot.bind(this));
      });
    }

    disconnectedCallback() {
    }
  }

  customElements.define('products-list', ProductsList);
}