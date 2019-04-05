const express = require("express");
const liveQuery = require("@graphile/subscriptions-lds")
const { postgraphile, makePluginHook } = require("postgraphile");
const PgSimplifyInflectorPlugin = require("@graphile-contrib/pg-simplify-inflector");
const subscriptionPlugin = require("./subscriptionPlugin");
const { default: PgPubsub } = require("@graphile/pg-pubsub");
const pluginHook = makePluginHook([PgPubsub]);

const app = express();
const options = {
  pluginHook,
  live: true,
  ownerConnectionString: 'postgres://zaali:postgres@localhost:5432/kodala_dev',
  // subscriptions: true,
  appendPlugins: [
    PgSimplifyInflectorPlugin,
    liveQuery.default
    // subscriptionPlugin
  ],
  graphileBuildOptions: {
    pgOmitListSuffix: true,
  },
  graphiql: true,
  watchPg: true,
  simpleCollections: "only",
  ignoreRBAC: false,
  jwtPgTypeIdentifier: 'private.jwt_token',
  disableQueryLog: true,
  jwtSecret: "mySecret"
}

app.use(
  postgraphile('postgres://kodala:postgres@localhost:5432/kodala_dev', ["api"], options)
);

app.listen(process.env.PORT || 5000);
