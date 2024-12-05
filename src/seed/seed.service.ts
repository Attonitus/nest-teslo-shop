import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import { hashPassword } from 'src/adapters/bcrypt.adapter';


@Injectable()
export class SeedService {

  constructor(
    private readonly productService : ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ){}

  async execute() {
    await this.deleteTables();
    const adminUser = await this.seedUsers();
    await this.seedProducts(adminUser);
    return `seeded!`;
  }

  private async deleteTables(){
    await this.productService.deleteAllProducts();

    const queryBuilder = this.userRepository.createQueryBuilder();

    await queryBuilder.delete().where({}).execute();
  }

  private async seedUsers(){
    const seedUsers = initialData.users;

    seedUsers.forEach(user => {
      user.password = hashPassword(user.password);
    });

    const users: User[] = [];

    seedUsers.forEach(user => (
      users.push( this.userRepository.create(user) )
    ))

    const dbUsers = await this.userRepository.save(users);
    return dbUsers[0];
  }
  
  private async seedProducts(user: User){
    await this.productService.deleteAllProducts();

    const products = initialData.products;

    const promises = [];

    products.forEach(product => (
      promises.push( this.productService.create(product, user) )
    ))

    await Promise.all( promises );

    return true;
  }

}
