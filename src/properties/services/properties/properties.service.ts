import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Services
import { UsersService } from 'src/users/services/users/users.service';

// Entities
import { Property } from '../../entities/property.entity';
import { UserProperty, UserRole } from '../../../entities/user-property.entity';


@Injectable()
export class PropertiesService {
    constructor(
        @InjectRepository(Property) private propertyRepository: Repository<Property>,
        @InjectRepository(UserProperty) private userPropertyRepository: Repository<UserProperty>,
        private usersService: UsersService,
    ) {}

    async findAllProperties() {
        const properties = await this.propertyRepository.find();

        const userProperties = await this.userPropertyRepository.find({
            relations: ['user', 'property'],
        });

        const result = properties.map(property => {
            const sellerRecord = userProperties.find(up => up.property.id === property.id && up.role === UserRole.SELLER);
            const buyerRecord = userProperties.find(up => up.property.id === property.id && up.role === UserRole.BUYER);

            return {
                id: property.id,
                name: property.name,
                address: property.address,
                latitude: property.latitude,
                longitude: property.longitude,
                price: property.price,
                createdBy: sellerRecord ? { id: sellerRecord.user.id, email: sellerRecord.user.email } : null,
                boughtBy: buyerRecord ? { id: buyerRecord.user.id, email: buyerRecord.user.email } : null,
                isBought: !!buyerRecord
            };
        });
        return {
            properties: result,
        };
    }

    findAllByCoordinates(latitude: number, longitude: number) {
        return this.propertyRepository.find({
            where: {
                latitude: latitude,
                longitude: longitude
            }
        });
    }

    async findOneById(id: number) {
        if (!id) {
            return null;
        }

        const property = await this.propertyRepository.findOneBy({ id });

        if (!property) {
            throw new NotFoundException(`Property with ${ id } not found`);
        }

        return property;
    }

    async create(userId: number, name: string, address: string, latitude: number, longitude: number, price: number, idempotencyKey: string) {
        const user = await this.usersService.findOneById(userId);

        if (!user) {
            throw new NotFoundException(`User with ${ userId } not found`);
        }

        const existingProperty = await this.propertyRepository.findOne({ where: { idempotencyKey } });
        if (existingProperty) {
            return existingProperty;
        }

        const properties = await this.findAllByCoordinates(latitude, longitude);

        if (properties.length > 0) {
            throw new BadRequestException(`Property with same coordinates already exists`);
        }

        const newProperty = this.propertyRepository.create({ name, latitude, longitude, address, price, idempotencyKey });
        const savedProperty = await this.propertyRepository.save(newProperty);
        
        const newUserProperty = this.userPropertyRepository.create({
            user: user,
            property: newProperty,
            role: UserRole.SELLER
        });
        const savedUserProperty = await this.userPropertyRepository.save(newUserProperty);

        return savedProperty;
    }

    async update(propertyId: number, userId: number, attrs: Partial<Property>) {
        const property = await this.findOneById(propertyId);
        if (!property) {
            throw new NotFoundException(`Property with ${ propertyId } not found`);
        }

        const sellerRelation = this.userPropertyRepository.findOne({
            where: {
                user: {
                    id: userId,
                },
                property: {
                    id: propertyId,
                },
                role: UserRole.SELLER
            }
        });
        if (!sellerRelation) {
            throw new ForbiddenException(`You are not the seller of this property`);
        }

        const buyerRelation = await this.userPropertyRepository.findOne({
            where: {
                property: {
                    id: propertyId
                },
                role: UserRole.BUYER
            }
        });
        if (buyerRelation) {
            throw new ForbiddenException(`Property has already been bought by someone`);
        }

        Object.assign(property, attrs);

        return this.propertyRepository.save(property);
    }

    async delete(propertyId: number, userId: number) {
        const property = await this.findOneById(propertyId);
        if (!property) {
            throw new NotFoundException(`Property with ${ propertyId } not found`);
        }

        const sellerRelation = this.userPropertyRepository.findOne({
            where: {
                user: {
                    id: userId,
                },
                property: {
                    id: propertyId,
                },
                role: UserRole.SELLER
            }
        });
        if (!sellerRelation) {
            throw new ForbiddenException(`You are not the seller of this property`);
        }

        const buyerRelation = await this.userPropertyRepository.findOne({
            where: {
                property: {
                    id: propertyId
                },
                role: UserRole.BUYER
            }
        });
        if (buyerRelation) {
            throw new BadRequestException(`Property has already been bought by someone`);
        }

        return this.propertyRepository.remove(property);
    }

    async buyProperty(propertyId: number, userId: number) {
        const property = await this.findOneById(propertyId);
        if (!property) {
            throw new NotFoundException(`Property with ${ propertyId } not found`);
        }

        const alreadyBoughtByUser = await this.userPropertyRepository.findOne({
            where: {
                user: {
                    id: userId,
                },
                property: {
                    id: propertyId
                },
                role: UserRole.BUYER,
            },
        });
        if (alreadyBoughtByUser) {
            throw new BadRequestException(`You have already bought this property`);
        }
        
        const existingUserProperty = await this.userPropertyRepository.findOne({
            where: {
                property: {
                    id: propertyId,
                },
                role: UserRole.BUYER,
            }
        });
        if (existingUserProperty) {
            throw new BadRequestException(`Property already bought by another user`);
        }

        const isSeller = await this.userPropertyRepository.findOne({
            where: {
                user: {
                    id: userId,
                },
                property: {
                    id: propertyId,
                },
                role: UserRole.SELLER,
            }
        });
        if (isSeller) {
            throw new BadRequestException(`You cannot buy a property you created`);
        }

        const userProperty = this.userPropertyRepository.create({
            user: {
                id: userId,
            },
            property: {
                id: propertyId,
            },
            role: UserRole.BUYER,
        });

        return this.userPropertyRepository.save(userProperty);
    }

    async cancelPurchase(propertyId: number, userId: number) {
        const property = await this.findOneById(propertyId);
        if (!property) {
            throw new NotFoundException(`Property with ${ propertyId } not found`);
        }

        const purchaseRecord = await this.userPropertyRepository.findOne({
            where: {
                user: {
                    id: userId,
                },
                property: {
                    id: propertyId,
                },
                role: UserRole.BUYER,
            }
        });
        if (!purchaseRecord) {
            throw new BadRequestException('You have not bought this property.');
        }

        const isSeller = await this.userPropertyRepository.findOne({
            where: {
                user: {
                    id: userId,
                },
                property: {
                    id: propertyId,
                },
                role: UserRole.SELLER,
            }
        });
        if (isSeller) {
            throw new BadRequestException('You cannot cancel a purchase of a property you are selling.');
        }

        return this.userPropertyRepository.remove(purchaseRecord);
    }
}