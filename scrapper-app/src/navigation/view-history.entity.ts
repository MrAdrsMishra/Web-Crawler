import { Column, Entity, ForeignKey, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class view_history{
    @PrimaryGeneratedColumn()
    id:number;
    @Column()
    session_id:string;    
    @Column()
    path_json:JSON;    
    @Column({nullable:true})
    created_at:Date;    
}
// view_history —
//  id,
//  user_id (optional),
//  session_id,
//  path_json, 
//  created_at=