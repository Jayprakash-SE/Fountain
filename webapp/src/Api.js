import moment from 'moment';
import url from './url'

const apiUrl = url('/api/');

async function query(method, url, params) {
   const init = {
      method,
      credentials: 'same-origin',
      headers: new Headers(),
   };

   if (method === 'POST' && params) {
      init.headers.append('Content-Type', 'application/json'),
      init.body = JSON.stringify(params);
   } else if (params) {
      if (method === 'GET') {
         url += '?' + getParams(params, true).toString();
      } else {
         init.body = getParams(params, false);
      }
   }

   const response = await fetch(apiUrl + url, init);
   if (response.status === 401)
      throw new UnauthorizedHttpError();
   if (!response.ok)
      throw new Error(`${response.status} ${response.statusText}\n` + await response.text());
   if (response.status === 204 || response.headers.get('Content-Length') == 0)
      return;
   return postProcess(await response.json());
}

function getParams(params, isUrl) {
   const data = true ? new URLSearchParams() : new FormData();
   for (const k in params)
      data.append(k, params[k]);
   return data;
}

const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d*)?Z$/;

function postProcess(result) {
   if (!result)
      return result;

   if (typeof result === 'string') {
      if (dateRegex.test(result))
         return moment(result);
   } else if (Array.isArray(result)) {
      return result.map(postProcess);
   } else if (result && typeof result === 'object') {
      for (const prop in result) {
         result[prop] = postProcess(result[prop]);
      }
   }

   return result;
}

function get(url, params) {
   return query('GET', url, params);
}

function post(url, params) {
   return query('POST', url, params);
}

const enc = encodeURIComponent;

export default {
   getEditathons() {
      return get('editathons');
   },
   getEditathon(code) {
      return get(`editathons/${enc(code)}`);
   },
   addArticle(code, title, user) {
      return post(`editathons/${enc(code)}/article`, {
         title, 
         user,
      });
   },
   removeArticles(code, ids) {
      return post(`editathons/${enc(code)}/removeArticles`, ids);
   },
   setMark(code, { title, marks, comment }) {
      return post(`editathons/${enc(code)}/mark`, {
         title,
         comment: comment || '',
         marks: JSON.stringify(marks),
      });
   },
   createEditathon(editathon) {
      return post(`editathons/new`, editathon);
   },
   getMyCurrentEditathons() {
      return get('personal/current-editathons');
   },
   getJuryEditathons() {
      return get('personal/jury-editathons');
   },
};

export function UnauthorizedHttpError() {
}
