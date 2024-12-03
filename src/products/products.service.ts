import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { isValidUuid } from 'src/adapters/uuid.adapter';
import { ProductImage, Product } from './entities';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource
  ){}


  async create(createProductDto: CreateProductDto) {

    const {images = [], ...paramsCreateProduct} = createProductDto;

    try {

      const product = this.productRepository.create({
        ...paramsCreateProduct,
        images: images.map(image => this.productImageRepository.create({url: image}))
      });
      await this.productRepository.save(product);
      return {
        ...product,
        images
      };

    } catch (error) {
      this.handleExceptions(error);
    }

  }

  async findAll(paginationDto: PaginationDto) {

    const {limit = 10, offset = 0} = paginationDto;

    const products =  await this.productRepository.find({
      take: limit,
      skip: offset
    });

    return products.map(product => ({
      ...product,
      images: product.images.map(image => image.url)
    }))
  }

  async findOne(term: string) {

    let product: Product;

    if(isValidUuid(term)){
      product = await this.productRepository.findOne({
        where: { id: term }
      })
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
      .where('UPPER(title)= :title or slug= :slug',{
        title: term.toUpperCase(),
        slug: term.toLowerCase()
      }).leftJoinAndSelect('prod.images', 'prodImages').getOne();
    }

    if(!product){
      throw new NotFoundException(`Product with "${term}" not exist`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const {images, ...toUpdate} = updateProductDto;

    const product = await this.productRepository.preload({ id, ...toUpdate});

    if(!product){
      throw new BadRequestException(`Product with id ${id} not exists`);
    }

    // Create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {

      if(images){
        await queryRunner.manager.delete(ProductImage, { product: { id } });
        product.images = images.map( image => this.productImageRepository.create({url: image}));
      }

      await queryRunner.manager.save(product);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      // await this.productRepository.save(product);
      return this.findOnePlain(id);

    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {

    const deleted = await this.productRepository.delete({id});

    if(deleted.affected === 0){
      throw new BadRequestException(`Can't delete a product that not exists`);
    }

    return;
  }

  async findOnePlain(term: string){
    const {images = [], ...rest} = await this.findOne(term);
    return{
      ...rest,
      images: images.map(imag => imag.url)
    }
  }

  async deleteAllProducts(){

    const queryBuilder = this.productRepository.createQueryBuilder('product');

    try {
      return await queryBuilder
      .delete()
      .where({})
      .execute();

    } catch (error) {
      this.handleExceptions(error);
    }

  }
  
  private handleExceptions(error: any){
    if(error.code === '23505'){
      throw new BadRequestException(`Error: ${error.detail}`);
    }

    this.logger.error(error);
    throw new InternalServerErrorException(`Error internal server error`);
  }
}
