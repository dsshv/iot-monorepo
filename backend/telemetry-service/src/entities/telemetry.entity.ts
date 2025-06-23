import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class TelemetryRecord {
  @PrimaryKey()
  _id!: string;

  @Property()
  deviceId!: string;

  @Property()
  timestamp!: Date;

  @Property()
  payload!: string;
}
