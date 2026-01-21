import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('category')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  title: string;
  @Column()
  slug: string;
  @Column()
  lastScrapedAt: Date;

  // linking to its children from self referencing
  // Self-referencing: Many categories can have the same parent
  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parentId' })
  parent: Category;

  // Self-referencing: One category can have many child categories
  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];
}
