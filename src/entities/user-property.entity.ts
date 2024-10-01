import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

// Entities
import { User } from "../users/entities/user.entity";
import { Property } from "../properties/entities/property.entity";


export enum UserRole {
    BUYER = 'buyer',
    SELLER = 'seller',
};


@Entity()
export class UserProperty {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE'})
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Property, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'property_id' })
    property: Property;

    @Column({ type: 'enum', enum: UserRole })
    role: UserRole;
}