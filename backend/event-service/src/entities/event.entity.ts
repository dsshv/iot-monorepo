import { Entity, PrimaryKey, Property, Index } from '@mikro-orm/core';

@Entity({ collection: 'events' })
@Index({ properties: ['eventType', 'timestamp'] })
@Index({ properties: ['source', 'timestamp'] })
export class Event {
  @PrimaryKey()
  _id!: string;

  @Property()
  eventType!: string;

  @Property()
  source!: string;

  @Property()
  timestamp!: Date;

  @Property({ type: 'object' })
  payload!: any;

  @Property({ nullable: true })
  deviceId?: string;

  @Property({ nullable: true })
  userId?: string;

  @Property({ nullable: true })
  metadata?: any;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
} 