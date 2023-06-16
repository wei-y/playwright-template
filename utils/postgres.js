const { Client } = require("pg");

async function runQuery(options, query) {
  console.log(
    `Querying DB using config:\n ${JSON.stringify(options, null, 2)}`
  );
  console.log(`Query:\n ${query}`);
  const client = new Client(options);
  await client.connect();
  const result = await client.query(query);
  await client.end();
  return result;
}

module.exports = {
  runQuery,
};
