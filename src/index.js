const axios = require('axios').default;
import { Notify } from 'notiflix';

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const KEY = '29675773-14c39cfbd09e94e65f3c5c74b';
const URL = 'https://pixabay.com/api/?key=';

const form = document.querySelector('.search-form');
const input = document.querySelector('[name="searchQuery"]');
const loadMore = document.querySelector('.load-more');
const gallery = document.querySelector('.gallery');

const lightbox = new SimpleLightbox('.gallery a');

class PhotoApiService {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
  }

  fetchImages() {
    return fetch(
      `${URL}${KEY}&q=${this.searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${this.page}`
    )
      .then(response => response.json())
      .then(photos => {
        this.page += 1;

        return photos;
      });
  }

  resetPage() {
    this.page = 1;
  }

  get query() {
    return this.searchQuery;
  }

  set query(newQuery) {
    this.searchQuery = newQuery;
  }
}

const photoApiService = new PhotoApiService();

form.addEventListener('submit', searchImgSubmit);
loadMore.addEventListener('click', onLoadMoreClick);

function searchImgSubmit(evt) {
  evt.preventDefault();
  if (!input.value) {
    return Notify.warning('Please type something to begin searching.');
  }

  photoApiService.query = input.value;
  photoApiService.resetPage();
  photoApiService
    .fetchImages()
    .then(photos => {
      gallery.innerHTML = '';
      gallery.insertAdjacentHTML('beforeend', renderGallery(photos.hits));
      lightbox.refresh();

      loadMore.style.display = 'block';

      if (photos.totalHits === 0) {
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );

        hideMore();
        return;
      }

      if (photos.totalHits === photos.hits.length) {
        hideMore();
      }

      Notify.success(`Hooray! We found ${photos.totalHits} images.`);

      const { height: cardHeight } = document
        .querySelector('.gallery')
        .firstElementChild.getBoundingClientRect();

      window.scrollBy({
        top: cardHeight * 0.4,
        behavior: 'smooth',
      });
    })
    .catch('error');
}

function renderGallery(photos) {
  return photos
    .map(photo => {
      return `<a class="photo-card" href="${photo.largeImageURL}">
                <img class="photo-card__image" src="${photo.webformatURL}" alt="${photo.tags}" loading="lazy" />
                <div class="info">
                    <p class="info-item">
                    <b>Likes</b>${photo.likes}
                    </p>
                    <p class="info-item">
                    <b>Views</b>${photo.views}
                    </p>
                    <p class="info-item">
                    <b>Comments</b>${photo.comments}
                    </p>
                    <p class="info-item">
                    <b>Downloads</b>${photo.downloads}
                    </p>
                </div>
                </a>`;
    })
    .join('');
}

window.addEventListener('scroll', () => {
  if (
    window.scrollY + window.innerHeight >=
    document.documentElement.scrollHeight
  ) {
    onLoadMoreClick();
  }
});

function onLoadMoreClick() {
  photoApiService
    .fetchImages()
    .then(photos => {
      gallery.insertAdjacentHTML('beforeend', renderGallery(photos.hits));
      if (photos.totalHits === photos.hits.length) {
        hideMore();
      }
      if (Math.round(photos.totalHits / 40) < photoApiService.page) {
        Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
        hideMore();
      }
      console.log(photos);
    })
    .catch('error');
}

function hideMore() {
  loadMore.style.display = 'none';
}
