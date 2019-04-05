const express = require("express");
const liveQuery = require("@graphile/subscriptions-lds")
const { postgraphile, makePluginHook } = require("postgraphile");
const PgSimplifyInflectorPlugin = require("@graphile-contrib/pg-simplify-inflector");
const ConnectionFilterPlugin = require("postgraphile-plugin-connection-filter");
const subscriptionPlugin = require("./subscriptionPlugin");
const { default: PgPubsub } = require("@graphile/pg-pubsub");
const jwt = require("jsonwebtoken");
const pluginHook = makePluginHook([PgPubsub]);

const app = express();
const options = {
  pgSettings: req => {
    getClaims(req)
  },
  pluginHook,
  live: true,
  defaultRole: "kodala",
  ownerConnectionString: 'postgres://zaali:postgres@localhost:5432/kodala_dev',
  // subscriptions: true,
  appendPlugins: [
    PgSimplifyInflectorPlugin,
    liveQuery.default,
    ConnectionFilterPlugin
    // subscriptionPlugin
  ],
  graphileBuildOptions: {
    pgOmitListSuffix: true,
  },
  graphiql: true,
  watchPg: true,
  simpleCollections: "only",
  ignoreRBAC: false,
  jwtPgTypeIdentifier: 'api.jwt_token',
  jwtToken: 'api.jwt_token',
  disableQueryLog: true,
  jwtSecret: "mySecret"
}

app.use(
  postgraphile('postgres://kodala:postgres@localhost:5432/kodala_dev', ["api"], options)
);

const getClaims = (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new Error("No authorization header provided.");
    }

    const authSplit = authHeader.split(" ");
    if (authSplit.length !== 2) {
      throw new Error(
        'Malformed authentication header. "Bearer accessToken" syntax expected.'
      );
    } else if (authSplit[0].toLowerCase() !== "bearer") {
      throw new Error(
        '"Bearer" keyword missing from front of authorization header.'
      );
    }

    const token = authSplit[1];
    const decodedToken = jwt.decode(token);
    if (decodedToken === null) {
      throw new Error("Unable to decode JWT, refresh login and try again.");
    }
    return {
      'jwt.claims.user_id': decodedToken.user_id,
    }
  } catch (e) {
    e.status = 401; // append a generic 401 Unauthorized header status
    throw e;
  }
}


app.listen(process.env.PORT || 5000);
