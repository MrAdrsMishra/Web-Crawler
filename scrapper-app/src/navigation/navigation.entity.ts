import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('navigation')
export class Navigation{
    @PrimaryGeneratedColumn('uuid')
    id:string;
    @Column()
    title:string;
    @Column()
    slug:string;
    @Column()
    LastScrapedAt:Date;
}