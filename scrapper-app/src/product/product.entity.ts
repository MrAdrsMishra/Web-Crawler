// import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

// @Entity('product')
// export class Product{
//     @PrimaryGeneratedColumn('uuid')
//     id:string;
//     @Column()
//     sourceId:string;
//     @Column()
//     productSlug:string;
//     @Column()
//     title:string;
//     @Column()
//     price:number;
//     @Column()
//     currency:string;
//     @Column()
//     productUrl:string;
//     @Column()
//     lastScrapedAt:Date;
// }

// @Entity('product_details')
// export class ProductDetails{
//     @PrimaryGeneratedColumn('uuid')
//     id:string;
//     @Column()
//     productId:string;
//     @Column()
//     description:string;
//     @Column()
//     ratingAvg:number;
//     @Column()
//     reviewsCount:number;
//     @Column()
//     specs:string;
// }

// @Entity('product_specs')
// export class ProductSpecs{
//     @PrimaryGeneratedColumn('uuid')
//     id:string;
//     @Column()
//     first:string;
//     @Column()
//     second:string;
// }

import { ReviewDto} from "src/review/review.dto";
import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany } from "typeorm";

@Entity('product')
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    sourceId: string;

    @Column()
    productSlug: string;

    @Column()
    title: string;

    @Column()
    price: number;

    @Column()
    currency: string;

    @Column()
    productUrl: string;

    @Column()
    lastScrapedAt: Date;

    // 1. Link Product to ProductDetails
    @OneToOne(() => ProductDetails, (details) => details.product)
    details: ProductDetails; // this field will abstractally hold the details row reference will not be created in db
    // 1. Link Product to review
    @OneToMany(() =>  ReviewDto,(review)=> review.product)
    review: ReviewDto; // this field will abstractally hold the details row reference will not be created in db
}

@Entity('product_details')
export class ProductDetails {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    description: string;

    @Column()
    ratingAvg: number;

    @Column()
    reviewsCount: number;

    // 2. Foreign Key to Product
    @OneToOne(() => Product, (product) => product.details)
    @JoinColumn({ name: "productId" }) // This creates the FK column
    product: Product; // this field will abstractally hold the product row reference will not be created in db

    // 3. Link Details to Specs
    @OneToOne(() => ProductSpecs)  // since the details->spec is unidirectional on-to-one relation no need to mention the via which (second arg) because it there is not refe in specs to come in details entity
    @JoinColumn({ name: "specsId" }) // This creates the FK column
    specs: ProductSpecs;
}

@Entity('product_specs')
export class ProductSpecs {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    first: string;

    @Column()
    second: string;
}