//taken/modified from second databases lecture code
const handleError = (res, data) => {
  return new Promise((resolve, reject) => {
    if (!res.ok) {
      let error = new Error(data.error);
      error.status = res.status;
      reject(error);
    }
    resolve();
  });
};

export default {
  get: (url) => {
    return new Promise(async (resolve, reject) => {
      const res = await fetch(url);
      const data = await res.json();
      handleError(res, data).then(() => {
        resolve(data);
      }).catch(err => {
        reject(err);
      });
    });
  },

  post: (url, body) => {
    return new Promise(async (resolve, reject) => {
      const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Accept': "application/json",
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      handleError(res, data).then(() => {
        resolve(data);
      }).catch(err => {
        reject(err);
      });
    });
  },

  put: (url, body) => {
    return new Promise(async (resolve, reject) => {
      const res = await fetch(url, {
        method: 'PUT',
        body: JSON.stringify(body),
        headers: {
          'Accept': "application/json",
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      handleError(res, data).then(() => {
        resolve(data);
      }).catch(err => {
        reject(err);
      });
    });
  },

  delete: (url) => {
    return new Promise(async (resolve, reject) => {
      const res = await fetch(url, {
        method: 'DELETE'
      });
      const data = await res.json();
      handleError(res, data).then(() => {
        resolve(data);
      }).catch(err => {
        reject(err);
      });
    });
  }
};
