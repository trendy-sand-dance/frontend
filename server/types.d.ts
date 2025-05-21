import { JWT } from '@fastify/jwt'

declare module 'fastify' {

  interface FastifyRequest {
    jwt: JWT
  }

  export interface FastifyInstance {
    authenticate: any
  }

}

declare module '@fastify/jwt' {

  interface FastifyJWT {
    user: UserPayload
  }

}

declare global {

  interface TournamentPlayer {
    id: number,
    username: string,
    avatar: string,
    wins: number,
    losses: number,
    local: boolean,
  }

  type UserPayload = {
    id: string
    email: string
    name: string
  }

  interface Player {
    id: number,
    userId: number,
    x: number,
    y: number,
  }

  interface User {
    id?: number,
    username?: string,
    password?: string,
    email?: string,
    avatar?: string,
    status?: boolean,
    wins?: number,
    losses?: number,
    player?: Player,
  }

}
