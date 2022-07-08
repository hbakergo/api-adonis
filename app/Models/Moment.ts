import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Comment from './Comment'

export default class Moment extends BaseModel {

  //usa o HasMany que é um tipo criado pelo próprio adonis, onde ele diz que o Moment
  //tem muitos Comment
  @hasMany(() => Comment)
  public comments: HasMany<typeof Comment>

  @column({ isPrimary: true })
  public id: number

  @column()
  public title: string

  @column()
  public description: string

  @column()
  public image: string

  //toda vez que um registro é criado esse campo é preenchido
  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  //toda vez que um registro é editado esse campo é preenchido
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
