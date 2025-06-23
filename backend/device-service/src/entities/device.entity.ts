import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Device {
  @PrimaryKey()
  _id!: string;

  @Property()
  name!: string;

  @Property()
  type!: string;

  @Property()
  status!: string;
}
