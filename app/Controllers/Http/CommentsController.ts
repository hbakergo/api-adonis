import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Comment from 'App/Models/Comment'
import Moment from 'App/Models/Moment'

export default class CommentsController {
  //método para adicionar comment, o store é informado no node ace list:routes
  //vamos trabalhar com request, params e response
  public async store({ request, params, response }: HttpContextContract) {
    //pega o que vem no body
    const body = request.body()

    //pega o id do moment, que está sendo restado do :momentId daqui => /api/moments/:momentId/comments
    const momentId = params.momentId

    //saber se aquele comentário está indo para um Id de Moment válido ou não, ou seja, se aquele comentário
    //vai para um Moment que existe
    await Moment.findOrFail(momentId)

    //colocamos o momentId no nosso body, pois precisamos dessa coluna para inserir no banco de dados
    body.momentId = momentId

    //criamos o comentário
    //o método create do controller cria um comentário com o conteúdo do body
    const comment = await Comment.create(body)

    response.status(201)

    return {
      message: 'Comentário adicionado com sucesso!',
      data: comment,
    }
  }
}
