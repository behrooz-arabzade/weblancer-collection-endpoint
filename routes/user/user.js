let express = require('express');
const { models } = require('weblancer-collection');
const { getAuthorizedUser, generateAccessToken} = require('../../utils/acl');
const axios = require('axios');
let router = express.Router();
let Response = require('../../utils/response');

router.post('/login', async (req, res) => {
    let {adminToken} = req.body;

    if (adminToken) {
        let publisherBaseUrl = process.env.PUBLISHER_API_URL;
        console.log("publisherBaseUrl", publisherBaseUrl);
        try{
            let response = await axios.get(`${publisherBaseUrl}/user/checkauthorization`, {
                params: {
                    token: adminToken
                },
                headers: {
                    'authorization': `Bearer ${adminToken}`,
                    'pport': 4000, // TODO make it dynamic
                }
            });

            console.log("login response 2", response)
            if (response.statusCode === 200) {
                let user = response.data.data.user;

                console.log("login response 3", user, response.data)
                let accessToken = generateAccessToken(user)
                console.log("login response 4", accessToken)
                res.json(
                    new Response(true, {accessToken}).json()
                );
                return;
            } else {
                throw new Error("Access Denied !!!");
            }
        } catch (error) {
            console.log("login error", error)
            res.status(401).json(
                new Response(false, {}, error.message).json()
            );
            return;
        }
    }
});

module.exports = router;
