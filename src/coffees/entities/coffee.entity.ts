import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { Flavor } from './flavor.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity()
export class Coffee extends BaseEntity {
  @Column()
  name: string;

  @Column()
  brand: string;

  @Column({ default: 0 })
  recommendations: number;

  @JoinTable()
  @ManyToMany(() => Flavor, (flavor) => flavor.coffees, {
    cascade: true,
  })
  flavors: Flavor[];
}
