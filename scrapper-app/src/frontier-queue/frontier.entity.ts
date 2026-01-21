import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('frontier_queue')
export class FrontierQueue {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  url: string;
  @Column()
  status: string;
  @Column()
  depth: number;
  @Column()
  last_seen: Date;
  @Column()
  priority: number;
  @Column()
  retry_time:number;
  @Column()
  retry_count: number;
}
// insert into frontier_queue (identity,url(),status)