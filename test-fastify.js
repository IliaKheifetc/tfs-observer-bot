const fastify = require("fastify");

const fastifyInstance = fastify();

fastifyInstance.get("/", async (req, reply) => {
  console.log({ req });

  reply.code(200).send("reply sent!");
});

(async () => {
  try {
    await fastifyInstance.listen(4444);
  } catch (e) {
    console.log("error occurred ", e);
  }
})();
