const { initCollections, models } = require("weblancer-collection");
const express = require('express');
const cors = require('cors');
const {unlessRoute} = require("./utils/unlessroute");
const {authorizeToken} = require("./utils/acl");

const appName = process.env.APP_NAME;
const dbName = process.env.DBNAME;
const dbUser = process.env.DBUSER;
const dbPassword = process.env.DBPASSWORD;
const groupId = process.env.GROUP_ID;
const websiteName = process.env.WEBSITE_NAME;
const port = process.env.PORT;
const baseRoute = '/' + process.env.BASE_ROUTE;

let app = express();
app.use(cors());
app.options('*', cors());
app.use(express.json({ limit: "50mb" }));

var edit = require('./routes/collection/edit');
var query = require('./routes/collection/query');
var user = require('./routes/user/user');

app.use(unlessRoute([
    baseRoute + '/test',
    baseRoute + '/testdb',
    baseRoute + '/user/login',
    baseRoute + '/collection/edit/initsandbox',
], authorizeToken()));

app.use(baseRoute + '/collection/edit', edit);
app.use(baseRoute + '/collection/query', query);
app.use(baseRoute + '/user', user);

app.get(baseRoute + '/test', function (req, res) {
    res.json(
        {message: "App Tested Successfully"}
    );
});

app.get(baseRoute + '/testdb', async function (req, res) {
    let collections = await models.instance.collection.findAll();
    res.json(
        {message: "App DB Tested Successfully", collections}
    );
});

initCollections(dbName, dbUser, dbPassword, groupId).then((success, error) => {
    if (success) {
        app.listen(port, () => {
            console.log(`${appName} app of ${websiteName} is running on port ${port} successfully`);
        });
    } else {
        throw new Error(`${appName} app of ${websiteName} error: Can't init collections of website`)
    }
}).catch(err => {
    console.log(`${appName} app of ${websiteName} error: Can't init collections of website`);
    console.log(err);
    throw new Error(`${appName} app of ${websiteName} error: Can't init collections of website`)
});
