import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Event extends BaseEntity {
  @Column()
  name: string;

  @Column()
  type: string;

  @Column('json')
  payload: Record<string, any>;
}
