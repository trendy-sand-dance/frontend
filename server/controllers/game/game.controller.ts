import { FastifyRequest, FastifyReply } from 'fastify';
import { getBundledFile } from '../../utility/utility.js';

export async function getPixiGame(request: FastifyRequest, reply: FastifyReply) {
  try {
    const file = await getBundledFile();
    console.log("file: ", file);
    let html = `<div id="pixi-container" class="bg-black border border-[#FF55FE] text-white w-full">
                  <script type="module" src="${file}"></script>
                  </div>`

    console.log(html);
    return reply.send(html);

  } catch (error) {
    request.log.error(error);
    return reply.viewAsync("errors/error-500.ejs");
  }

}
