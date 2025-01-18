import { Column, Entity, ManyToMany } from 'typeorm';
import { Coffee } from './coffee.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity()
export class Flavor extends BaseEntity {
  @Column()
  name: string;

  @ManyToMany(() => Coffee, (coffee) => coffee.flavors)
  coffees: Coffee[];
}
