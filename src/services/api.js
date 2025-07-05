import axios from 'axios';

export default axios.create({
  baseURL: 'https://komarenko123.github.io/1/api',
  headers: {
    'Content-Type': 'application/json'
  }
});