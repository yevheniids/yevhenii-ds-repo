if (!customElements.get('pros-cons')) {
  class ProsCons extends HTMLElement {
    constructor() {
      super();

      this.selectors = {
        data: '#pros-cons-data',
        jsSetDataHandler: '.js-set-data',
        prosConsListIconWrapper: '.pros-cons__icon-wrapper',
        prosConsListItemCount: '.pros-cons__list-item-count',
        prosConsIcons: '.pros-cons__icons',
        prosConsList: '.pros-cons__list-wrapper',

        loading: 'pros-cons__loading',
        disabledIcons: 'pros-cons__icons--disabled',
        disabledList: 'pros-cons__list-wrapper--disabled'
      }

      this.dataString = this.querySelector(this.selectors.data)?.innerHTML || '{}';
      this.data = JSON.parse(this.dataString.trim());
      this.jsSetDataHandlers = this.querySelectorAll(this.selectors.jsSetDataHandler);
      this.setDataIcons(this.data);
      this.enableSection(this.dataset.handle);
    }

    async setData(event) {
      const target = event.currentTarget;
      const title = target.dataset.title;
      const isIcon = target.dataset.icon === 'true' ? true : false;

      if (target.dataset.icon === 'true') {
        if (!('icons_list' in this.data)) {
          this.data.icons_list = {};
        }

        if (!(title in this.data.icons_list)) {
          this.data.icons_list[title] = 1;
        } else {
          this.data.icons_list[title]++;
        }
      } else {
        if (!(title in this.data)) {
          this.data[title] = 1;
        } else {
          this.data[title]++;
        }
      }

      try {
        this.classList.add(this.selectors.loading);

        await fetch(`https://pros-const-test.vercel.app/api/metafield`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            handle: this.dataset.handle,
            value: `${JSON.stringify(this.data)}`
          })
        });

        if (isIcon) {
          const iconsProsConsArray = localStorage.getItem('pros-cons-icons')?.split(',');

          if (iconsProsConsArray && !iconsProsConsArray.includes(this.dataset.handle)) {
            iconsProsConsArray?.push(this.dataset.handle);
            localStorage.setItem('pros-cons-icons', iconsProsConsArray?.join(','));
          } else {
            localStorage.setItem('pros-cons-icons', this.dataset.handle);
          }
        } else {
          const prosConsArray = localStorage.getItem('pros-cons-data')?.split(',');

          if (prosConsArray && !prosConsArray.includes(this.dataset.handle)) {
            prosConsArray?.push(this.dataset.handle);
            localStorage.setItem('pros-cons-data', prosConsArray?.join(','));
          } else {
            localStorage.setItem('pros-cons-data', this.dataset.handle);
          }
        }

        this.enableSection(this.dataset.handle);
      } finally {
        this.classList.remove(this.selectors.loading);
      }
    }

    setDataIcons(data) {
      const prosConsListItemCounts = this.querySelectorAll(this.selectors.prosConsListItemCount);
      const prosConsListIconWrapper = this.querySelectorAll(this.selectors.prosConsListIconWrapper);
      const prosConsList = [...prosConsListItemCounts, ...prosConsListIconWrapper];
      const total = this.data.icons_list
        ? Object.values(this.data.icons_list).reduce((sum, count) => sum + count, 0)
        : 0;

      if (Object.keys(this.data).length > 0) {
        prosConsList.forEach(item => {
          if (item.classList.contains('pros-cons__list-item-count')) {
            if (data[item.dataset.title]) {
              item.innerText = data[item.dataset.title];
            }
          } else {
            if (data.icons_list[item.dataset.title]) {
              const progressBar = item.querySelector('span');

              progressBar.style.width = `${data.icons_list[item.dataset.title] / total * 100}%`;
            }
          }
        });
      }
    }

    enableSection(handle) {
      const handlesArray = localStorage.getItem('pros-cons-data')?.split(',');
      const iconsHandlesArray = localStorage.getItem('pros-cons-icons')?.split(',');
      const prosConsList = this.querySelector(this.selectors.prosConsList);
      const prosConsIcons = this.querySelector(this.selectors.prosConsIcons);

      if (!handlesArray) {
        prosConsList.classList.remove(this.selectors.disabledList);
      } else if (handlesArray && !handlesArray.includes(handle)) {
        prosConsList.classList.remove(this.selectors.disabledList);
      } else {
        prosConsList.classList.add(this.selectors.disabledList);
      }

      if (!iconsHandlesArray) {
        prosConsIcons.classList.remove(this.selectors.disabledIcons);
      } else if (iconsHandlesArray && !iconsHandlesArray.includes(handle)) {
        prosConsIcons.classList.remove(this.selectors.disabledIcons);
      } else {
        prosConsIcons.classList.add(this.selectors.disabledIcons);
      }
    }

    connectedCallback() {
      this.jsSetDataHandlers.forEach(handler => {
        handler.addEventListener('click', this.setData.bind(this));
      });
    }

    disconnectedCallback() {
      this.jsSetDataHandlers.forEach(handler => {
        handler.removeEventListener('click', this.setData.bind(this));
      });
    }
  }

  customElements.define('pros-cons', ProsCons);
}
