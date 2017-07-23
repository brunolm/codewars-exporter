import { JSDOM } from 'jsdom';
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://www.codewars.com/',
});

async function getToken() {
  const csrf = 'csrf-token';

  const r = await api.get('/users/sign_in');
  const html = new JSDOM(r.data);
  const token = html.window.document.querySelector(`[name=${csrf}]`);

  if (!token) {
    return undefined;
  }

  return token.getAttribute('content');
}

async function login(user: string, password: string) {
  const csrfToken = await getToken();

  const response = await api.post('/users/sign_in', {
    'utf8': '✓',
    'authenticity_token': csrfToken,
    'user[email]': user,
    'user[password]': password,
    'user[remember_me]': 'true',
  }, {
    headers: {
    },
  });

  if (response.status !== 302) {
    throw new Error('Could not login');
  }
}

(async function () {

  try {
    await login(process.argv[2], process.argv[3]);
  }
  catch (err) {
    console.error(err);
  }

}());
