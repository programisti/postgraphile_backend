const { makeExtendSchemaPlugin, gql, embed } = require('graphile-utils');

const currentUserTopicFromContext = (_args, context, _resolveInfo) => {
  console.log('-----------------------------------------------------------')
  console.log(context)
  console.log('-----------------------------------------------------------')
  console.log(_args)
  console.log('-----------------------------------------------------------')
  return 'graphql:copmany:19'
  if (context.jwtClaims.user_id) {
    return `graphql:company:${context.jwtClaims.user_id}`;
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
      companyChanged: CompanySubscriptionPayload @pgSubscription(topic: graphql:copmany)
    }
  `,

  resolvers: {
    CompanySubscriptionPayload: {
      async company(event, _args, _context, { graphile: { selectGraphQLResultFromTable } }) {
        const rows = await selectGraphQLResultFromTable(
          sql.fragment`api.companies`,
          (tableAlias, sqlBuilder) => {
            sqlBuilder.where(
              sql.fragment`${sqlBuilder.getTableAlias()}.id = ${sql.value(
                event.subject
              )}`
            );
          }
        );
        console.log('===========================================================');
        console.log('rows', rows);
        console.log('event', event);
        console.log('context', context);
        console.log('===========================================================');
        return rows[0];
      },
    },
  },
}));
