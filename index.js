const express = require("express");
const { postgraphile, makePluginHook } = require("postgraphile");
const PgSimplifyInflectorPlugin = require("@graphile-contrib/pg-simplify-inflector");
const subscriptionPlugin = require("./subscriptionPlugin");
const { default: PgPubsub } = require("@graphile/pg-pubsub");
const pluginHook = makePluginHook([PgPubsub]);

const app = express();
const options = {
    pluginHook,
    appendPlugins: [
      PgSimplifyInflectorPlugin,
      subscriptionPlugin
    ],
    graphileBuildOptions: {
      pgOmitListSuffix: true,
    },
    subscriptions: true,
    watchPg: true,
    graphiql: true,
    graphqlRoute: "/graphql",
    graphiqlRoute: "/graphiql",
    simpleCollections: "only"
  }

app.use(
  postgraphile('postgres://postgres:postgres@localhost:5432/kodala_dev', "api", options)
);



app.listen(process.env.PORT || 5000);
