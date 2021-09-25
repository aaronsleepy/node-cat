const express = require('express');
const axios = require('axios');

const router = express.Router();

router.get('/test', async (req, res, next) => {
  try {
    if (!req.session.jwt) {
      const tokenResult = await axios.post('http://localhost:8081/v1/token', {
        clientSecret: process.env.CLIENT_SECRET,
      });

      if (tokenResult.data && 200 === tokenResult.data.code) {
        req.session.jwt = tokenResult.data.token;
      } else {
        return res.json(tokenResult.data);
      }
    }

    const result = await axios.get('http://localhost:8081/v1/test', {
      headers: {authorization: req.session.jwt},
    });

    return res.json(result.data);
  } catch (error) {
    console.error(error);
    if(419 === error.response.status) {
      return res.json(error.response.data);
    }
    return next(error);
  }
});

const URL = 'http://localhost:8081/v1';
axios.defaults.headers.origin = 'http://localhost:4000';
const request = async (req, api) => {
  try {
    if (!req.session.jwt) {
      const tokenResult = await axios.post(`${URL}/token`, {
        clientSecret: process.env.CLIENT_SECRET,
      });

      if (tokenResult.data && 200 === tokenResult.data.code) {
        req.session.jwt = tokenResult.data.token;
      } else {
        return res.json(tokenResult.data);
      }
    }

    console.info(`Call rest: ${URL}${api}`);
    return await axios.get(`${URL}${api}`, {
      headers: {authorization: req.session.jwt},
    });
  } catch (error) {
    console.error(error);
    if(419 === error.response.status) {
      delete req.session.jwt;
      return request(req, api);
    }
    return error.response;
  }
};

router.get('/mypost', async (req, res, next) => {
  try {
    const result = await request(req, '/posts/my');
    res.json(result.data);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/search/:hashtag', async (req, res, next) => {
  try {
    const result = await request(req, `/posts/hashtag/${encodeURIComponent(req.params.hashtag)}`);
    res.json(result.data);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/', (req, res) => {
  res.render('main', {
    key: process.env.CLIENT_SECRET,
  });
});

module.exports = router;