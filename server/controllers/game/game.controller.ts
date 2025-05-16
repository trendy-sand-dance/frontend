import { FastifyRequest, FastifyReply } from 'fastify';
import { getBundledFile } from '../../utility/utility.js';

const DATABASE_URL: string = process.env.DATABASE_URL || "http://ok:3000";
const GAMESERVER_URL: string = process.env.GAMESERVER_URL || "http://gameserver_container:3000";

export async function getPixiGame(request: FastifyRequest, reply: FastifyReply) {
  try {
    const file = await getBundledFile();
    return reply.viewAsync("game/game-canvas.ejs", { file });
  } catch (error) {
    request.log.error(error);
    return reply.viewAsync("errors/error-500.ejs");
  }

}


export async function getPlayerInfo(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: number };

    const response = await fetch(`${DATABASE_URL}/game/playerinfo/${id}`);
    const resData = await response.json() as { username: string, avatar: string };
    return reply.code(200).send({ username: resData.username, avatar: resData.avatar });
  } catch (error) {
    request.log.error(error);
    return reply.viewAsync("errors/error-500.ejs");
  }
}

export async function getTournamentPlayers(request: FastifyRequest, reply: FastifyReply) {
  try {
    const response = await fetch(`${GAMESERVER_URL}/getTournamentPlayers`);
    const resData = await response.json() as { pongPlayers : TournamentPlayer[]};

    // resData.pongPlayers[0] = {id: 69, username: "User69", avatar: "km", wins: 0, losses: 69 , local: false};
    // resData.pongPlayers[1] = {id: 69, username: "Wowzerz", avatar: "km", wins: 2, losses: 0 , local: false};
    // resData.pongPlayers[2] = {id: 69, username: "KaasKootje", avatar: "km", wins: 5, losses: 0 , local: false};
    // resData.pongPlayers[3] = {id: 69, username: "Vlomp", avatar: "km", wins: 0, losses: 20 , local: false};

    console.log("GETTING TOURNAMENT PLAYERS: ", resData.pongPlayers);
    return reply.viewAsync("game/tournamentplayers.ejs", {pongPlayers: resData.pongPlayers});
  } 
  catch (error) {
    request.log.error(error);
  }
}
