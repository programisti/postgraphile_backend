const { makeExtendSchemaPlugin, gql, embed } = require('graphile-utils');

const currentUserTopicFromContext = (_args, context, _resolveInfo) => {
  if (context.jwtClaims.user_id) {
    return `graphql:user:${context.jwtClaims.user_id}`;
  } else {
    throw new Error("You're not logged in");
  }
};

module.exports = makeExtendSchemaPlugin(({ pgSql: sql }) => ({
  typeDefs: gql`
    type CompanySubscriptionPayload {
      company: Company
      event: String
    }

    extend type Subscription {
      companyUpdated: CompanySubscriptionPayload @pgSubscription(topic: graphql)
    }
  `,

  resolvers: {
    CompanySubscriptionPayload: {
      // This method finds the user from the database based on the event
      // published by PostgreSQL.
      //
      // In a future release, we hope to enable you to replace this entire
      // method with a small schema directive above, should you so desire. It's
      // mostly boilerplate.
      async company(event, _args, _context, { graphile: { selectGraphQLResultFromTable } }) {
        const rows = await selectGraphQLResultFromTable(
          sql.fragment`api.copmanies`,
          (tableAlias, sqlBuilder) => {
            sqlBuilder.where(
              sql.fragment`${sqlBuilder.getTableAlias()}.id = ${sql.value(
                event.subject
              )}`
            );
          }
        );
        return rows[0];
      },
    },
  },
}));
