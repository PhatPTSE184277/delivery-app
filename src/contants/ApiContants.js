const COUNTRY_FLAG = {
  BASE_URL: `https://flagsapi.com/`,
  SIZE: {16: '16', 24: '24', 32: '32', 48: '48', 64: '64'},
  STYLE: {FLAT: 'flat', SHINY: 'shiny'},
};

const baseURL = 'http://10.0.2.2:8080/';

const STATIC_IMAGE = {
  BASE_URL: `${baseURL}/images`,
  TYPE: {POSTER: 'poster', LOGO: 'logo', GALLERY: 'gallery'},
  SIZE: {SQUARE: 'square', LANDSCAPE: 'landscape', PORTRAIT: 'portrait'},
  QUALITY: {SD: 'sd', HD: 'hd'},
};


export default { COUNTRY_FLAG, STATIC_IMAGE };