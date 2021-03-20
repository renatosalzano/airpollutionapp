process.env.API_KEY;

exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: process.env.API_KEY,
  };
};