let express = require('express');
const { createCollection, getAllCollections} = require('weblancer-collection');
let router = express.Router();
let Response = require('../../utils/response');

router.post('/install', async (req, res) => {
    let {success, collections, error, errorStatusCode} =
        await getAllCollections();

    if (!success) {
        res.status(errorStatusCode || 500).json(
            new Response(false, {}, error).json()
        );
        return;
    }

    let collection = collections.find(c => c.name === "contacts" && c.groupId === "Form App");

    if (collection) {
        res.status(200).json(
            new Response(true).json()
        );
        return;
    }

    let {success: createSuccess, error: createError, errorStatusCode: createErrorStatusCode} =
        await createCollection("contacts", "Contacts",
            "", "Form App", {}, true);

    if (createSuccess) {
        res.status(200).json(
            new Response(true).json()
        );
    } else {
        res.status(createErrorStatusCode || 500).json(
            new Response(false, {}, createError).json()
        );
    }
});

module.exports = router;
