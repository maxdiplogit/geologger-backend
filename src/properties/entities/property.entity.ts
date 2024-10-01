import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Property {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column('decimal', { precision: 9, scale: 6 })
    latitude: number;

    @Column('decimal', { precision: 9, scale: 6 })
    longitude: number;

    @Column()
    address: string;

    @Column('decimal')
    price: number;

    @Column({ nullable: true, unique: true })
    idempotencyKey: string;
}