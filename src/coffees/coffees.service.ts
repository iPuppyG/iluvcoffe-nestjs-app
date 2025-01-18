import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Coffee } from './entities/coffee.entity';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { Flavor } from './entities/flavor.entity';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Event } from 'src/events/entities/event.entity';
import { COFFEE_BRANDS } from './coffees.constants';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee)
    private readonly coffeeRepository: Repository<Coffee>,
    @InjectRepository(Flavor)
    private readonly flavorRepository: Repository<Flavor>,
    private readonly connection: Connection, // TODO Connection is deprecated
    @Inject(COFFEE_BRANDS) coffeeBrands: string[],
    private readonly configService: ConfigService,
  ) {
    console.log('coffee brands', coffeeBrands);
    console.log('DB Host', this.configService.get('DATABASE_HOST'));
  }

  /**
   * Finds all coffee entities with pagination.
   *
   * @param paginationQuery - The pagination query parameters containing
   *                          the limit and offset for the query.
   * @returns A promise that resolves to an array of coffee entities,
   *          including their associated flavors, with the specified
   *          pagination applied.
   */

  async findAll(paginationQuery: PaginationQueryDto) {
    const { limit, offset } = paginationQuery;
    return this.coffeeRepository.find({
      relations: ['flavors'],
      skip: offset,
      take: limit,
    });
  }

  /**
   * Finds a coffee entity by its ID.
   *
   * @param id - The ID of the coffee to find.
   * @returns A promise that resolves to the coffee entity with the specified ID,
   *          including its associated flavors.
   * @throws NotFoundException if no coffee with the given ID is found.
   */

  async findOne(id: string) {
    const coffee = await this.coffeeRepository.findOne({
      where: { id: +id },
      relations: ['flavors'],
    });
    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }
    return coffee;
  }

  /**
   * Creates a new coffee entity with the given properties, including its associated flavors.
   *
   * @param createCoffeeDto - The properties of the coffee to create.
   * @returns A promise that resolves to the newly created coffee entity, including its associated flavors.
   */
  async create(createCoffeeDto: CreateCoffeeDto) {
    const flavors = await Promise.all(
      createCoffeeDto.flavors.map((name) => this.preloadFlavorByName(name)),
    );
    const coffee = this.coffeeRepository.create({
      ...createCoffeeDto,
      flavors,
    });
    return this.coffeeRepository.save(coffee);
  }

  /**
   * Updates an existing coffee entity with the given properties, including its associated flavors.
   *
   * @param id - The ID of the coffee to update.
   * @param updateCoffeeDto - The properties of the coffee to update.
   * @returns A promise that resolves to the updated coffee entity, including its associated flavors.
   * @throws NotFoundException if no coffee with the given ID is found.
   */
  async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
    const flavors =
      updateCoffeeDto.flavors &&
      (await Promise.all(
        updateCoffeeDto.flavors.map((name) => this.preloadFlavorByName(name)),
      ));

    const coffee = await this.coffeeRepository.preload({
      id: +id,
      ...updateCoffeeDto,
      flavors,
    });

    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }
    return this.coffeeRepository.save(coffee);
  }

  async remove(id: string) {
    const coffee = await this.findOne(id);
    return this.coffeeRepository.remove(coffee);
  }

  async recommendCoffee(id: string) {
    const coffee = await this.findOne(id);

    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // increment the coffee recommendations count by one
      coffee.recommendations++;

      // create a new event entity
      const recommendEvent = new Event();
      recommendEvent.name = 'recommend_coffee';
      recommendEvent.type = 'coffee';
      recommendEvent.payload = { coffeeId: coffee.id, coffeeName: coffee.name };

      // save coffee and event entities
      await queryRunner.manager.save(coffee);
      await queryRunner.manager.save(recommendEvent);
    } catch (error) {
      console.error(error);
      // since we have errors let's rollback the transaction
      await queryRunner.rollbackTransaction();
    } finally {
      // release the queryRunner, since we don't need it anymore
      await queryRunner.release();
    }
  }

  // -------------------------- Helper methods --------------------------

  // 👉 Used to preload flavors before saving the coffee entity to the database
  //  to avoid creating duplicate flavors with the same name
  private async preloadFlavorByName(name: string) {
    const existingFlavor = await this.flavorRepository.findOne({
      where: { name },
    });

    return existingFlavor
      ? existingFlavor
      : this.flavorRepository.create({ name });
  }
}
