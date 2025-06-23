import { connect, NatsConnection, StringCodec, DisconnectOptions } from 'nats';

class NatsManager {
  private static instance: NatsManager;
  private connection: NatsConnection | null = null;
  private readonly stringCodec = StringCodec();

  private constructor() {}

  public static getInstance(): NatsManager {
    if (!NatsManager.instance) {
      NatsManager.instance = new NatsManager();
    }
    return NatsManager.instance;
  }

  public async connect(): Promise<NatsConnection> {
    if (this.connection && !this.connection.closed()) {
      return this.connection;
    }

    const natsUrl = process.env.NATS_URL || 'nats://nats:4222';
    
    try {
      this.connection = await connect({ 
        servers: natsUrl,
        reconnect: true,
        maxReconnectAttempts: -1,
        reconnectTimeWait: 1000,
      });

      console.log(`Connected to NATS at ${natsUrl}`);

      // Обработка событий подключения
      this.connection.closed().then(() => {
        console.log('NATS connection closed');
      });

      this.connection.disconnected().then(() => {
        console.log('NATS connection disconnected');
      });

      return this.connection;
    } catch (error) {
      console.error('Failed to connect to NATS:', error);
      throw error;
    }
  }

  public getConnection(): NatsConnection | null {
    return this.connection;
  }

  public getStringCodec() {
    return this.stringCodec;
  }

  public async disconnect(options?: DisconnectOptions): Promise<void> {
    if (this.connection && !this.connection.closed()) {
      await this.connection.drain();
      await this.connection.close(options);
      this.connection = null;
      console.log('NATS connection closed gracefully');
    }
  }

  public isConnected(): boolean {
    return this.connection !== null && !this.connection.closed();
  }
}

// Экспорт singleton instance
export const natsManager = NatsManager.getInstance();

// Backward compatibility exports
export const initNats = async () => {
  const connection = await natsManager.connect();
  return connection;
};

export const getNatsConnection = () => natsManager.getConnection();
export const getStringCodec = () => natsManager.getStringCodec();
export const disconnectNats = (options?: DisconnectOptions) => natsManager.disconnect(options);

// Legacy exports for backward compatibility
export let natsConnection: NatsConnection;
export const stringCodec = StringCodec();

// Initialize connection for legacy code
initNats().then(connection => {
  natsConnection = connection;
}).catch(error => {
  console.error('Failed to initialize NATS connection:', error);
});