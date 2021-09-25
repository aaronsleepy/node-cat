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

module.exports = router;