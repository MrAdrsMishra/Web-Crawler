import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('scrap_job')
export class ScrapJob{
    @PrimaryGeneratedColumn('uuid')
    id:string;
    @Column()
    targetUrl:string;
    @Column()
    targteType:string;
    @Column()
    status:string;
    @Column()
    startedAt:Date;
    @Column()
    finishedAt:Date;
    @Column()
    errorLog:string;
}