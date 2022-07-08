import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Moment from 'App/Models/Moment'

import Application from '@ioc:Adonis/Core/Application'
import { v4 as uuidv4 } from 'uuid'

//usar para apagar imagem do disco
import Drive from '@ioc:Adonis/Core/Drive'

export default class MomentsController {
  private validationOptions = {
    types: ['image'],
    size: '2mb',
  }

  //salvar um registro NA TABELA MOMENT(com upload de imagem) pela API
  //O nome STORE foi obtido ao digitar node ace list:routes
  public async store({ request, response }: HttpContextContract) {
    const body = request.body()

    //criamos a imagem como se fosse um entidade separada, onde o nome do input vai ser 'image'
    //também é inserido após a virgula opções de validação como tipo da imagem, tamanho da imagem, etc
    //que é montado no objeto validationOptions declaradon o começo da classe
    const image = request.file('image', this.validationOptions)

    if (image) {
      //1º) gerar o nome da imagem!
      //para gerar o nome da imagem ele concatena a string gerada no uuid com o image.extname que é a
      //extensão da imagem
      const imageName = `${uuidv4()}.${image.extname}`

      //2º) colocando a imagem na pasta uploads
      //aqui estou movendo essa imagem para Application.tmpPath(), que é onde eu quero que a minha
      //imagem fique guardada no servidor
      await image.move(Application.tmpPath('uploads'), {
        name: imageName,
      })

      //3º) guarando o nome da imagem no banco
      body.image = imageName
    }

    //vai cadastrar o body através do create no banco de dados
    //Essa operação é assíncrona pois ela depende do tempo de acesso ao banco e tempo
    //de resposta por isso usamos o await antes do ato de create
    //O nome CREATE foi obtido ao digitar node ace list:routes
    const moment = await Moment.create(body)

    //status de resposta
    response.status(201)

    //mensagem de retorno válido para o usuário
    return {
      message: 'Momento criado com sucesso!',
      data: moment,
    }
  }

  //buscar TODOS OS registros da tabela MOMENT pela API
  //O nome INDEX foi obtido ao digitar node ace list:routes
  public async index() {
    //retorna todos os registros da tabela Moment, usando o .all()
    //const moments = await Moment.all()

    //precisei mudar a linha acima e alterar como está abaixo usando o query(), mas se eu não colocar
    //nada ela irá trazer o mesmo resultado do .all(), por isso eu devo usar o preload(), que ele tem
    //como chamar os nossos MODELS relacionados
    const moments = await Moment.query().preload('comments')

    return {
      data: moments,
    }
  }

  //Retorna um registro da tabela Moment pelo ID
  //O nome STORE foi obtido ao digitar node ace list:routes
  //os parâmetros da URL vem no {params}
  public async show({ params }: HttpContextContract) {
    //findOrFail, se ele não encontrar ele falha
    const moment = await Moment.findOrFail(params.id)

    //o load vai fazer a mesma coisa do preload, ele vai carregar todos os comentários de um item(momento)
    //individual
    await moment.load('comments')

    return {
      data: moment,
    }
  }

  //deletar um registro da tabela Moment
  //O nome DESTROY foi obtido ao digitar node ace list:routes
  //os parâmetros da URL vem no {params}
  public async destroy({ params }: HttpContextContract) {
    //findOrFail, se ele não encontrar ele falha
    const moment = await Moment.findOrFail(params.id)

    //***OBS, o battisti não ensinou a apagar a imagem no temp/uploads
    //***fiz aqui por conta
    const image = moment.image

    //o delete é o método que exclui o registro da tabela
    await moment.delete()

    //***continuação do deletar imagem do disco que fiz por conta
    if (moment.image) {
      await Drive.delete(image)
    }

    return {
      message: 'Momento excluído com sucesso!',
      data: moment,
    }
  }

  //fazer um update em um registro
  public async update({ params, request }: HttpContextContract) {
    const body = request.body()

    //findOrFail, se ele não encontrar ele falha
    const moment = await Moment.findOrFail(params.id)

    moment.title = body.title
    moment.description = body.description

    //verifica se as imagens são diferentes ou tbm verifico se o momento não possui uma imagem
    //ou seja, ou ele não possui imagem, ou imagem é diferente da que está sendo enviada
    if (moment.image !== body.image || !moment.image) {
      //pegar imagem
      const image = request.file('image', this.validationOptions)

      if (image) {
        const imageName = `${uuidv4()}.${image.extname}`

        await image.move(Application.tmpPath('uploads'), {
          name: imageName,
        })

        //3º) guardando o nome da imagem no banco
        const imageOldToDelete = moment.image
        moment.image = imageName

        //4º) deletando o nome da imagem antiga do disco
        await Drive.delete(imageOldToDelete)
      }
    }
    //save é o método para fazer uma atualização de um dado já existente
    await moment.save()

    return {
      message: 'Momento atualizado com sucesso!',
      data: moment,
    }
  }
}
