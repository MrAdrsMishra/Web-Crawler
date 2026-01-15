import { Entity, PrimaryColumn } from 'typeorm';

@Entity('category_product')
export class CategoryProduct {
  @PrimaryColumn()
  categoryId: number;

  @PrimaryColumn()
  productId: number;
}
