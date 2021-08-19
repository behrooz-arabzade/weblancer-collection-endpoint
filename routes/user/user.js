let express = require('express');
const { generateAccessToken} = require('../../utils/acl');
const axios = require('axios');
let router = express.Router();
let Response = require('../../utils/response');

router.post('/login', async (req, res) => {
    let {adminToken} = req.body;

    if (adminToken) {
        let publisherBaseUrl = process.env.PUBLISHER_API_URL;
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

            if (response.status === 200) {
                let user = response.data.data.user;

                let accessToken = generateAccessToken(user)
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

    let user = {
        role: "guest"
        // TODO add additional data
    };

    let accessToken = generateAccessToken(user)
    res.json(
        new Response(true, {accessToken}).json()
    );
});

module.exports = router;
