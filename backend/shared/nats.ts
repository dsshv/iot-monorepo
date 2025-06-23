import { connect, NatsConnection, StringCodec } from 'nats';

class NatsManager {
  private connection: NatsConnection | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;

  async connect(): Promise<void> {
    if (this.connection) {
      return;
    }

    try {
      const natsUrl = process.env.NATS_URL || 'nats://nats:4222';
      this.connection = await connect({
        servers: natsUrl,
        reconnect: true,
        maxReconnectAttempts: this.maxReconnectAttempts,
        reconnectDelayHandler: () => this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      });

      this.connection.closed().then(() => {
        console.log('NATS connection closed');
      });

      this.connection.addEventListener('connect', () => {
        console.log('Connected to NATS');
        this.reconnectAttempts = 0;
      });

      this.connection.addEventListener('disconnect', () => {
        console.log('Disconnected from NATS');
      });

      this.connection.addEventListener('reconnect', () => {
        console.log('Reconnected to NATS');
        this.reconnectAttempts = 0;
      });

      this.connection.addEventListener('error', (err) => {
        console.error('NATS connection error:', err);
      });

      this.connection.addEventListener('close', () => {
        console.log('NATS connection closed');
        this.connection = null;
      });

    } catch (error) {
      console.error('Failed to connect to NATS:', error);
      throw error;
    }
  }

  getConnection(): NatsConnection | null {
    return this.connection;
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.drain();
      this.connection = null;
    }
  }

  async publish(subject: string, data: any): Promise<void> {
    if (!this.connection) {
      throw new Error('NATS connection not available');
    }

    const codec = StringCodec();
    const payload = typeof data === 'string' ? data : JSON.stringify(data);
    this.connection.publish(subject, codec.encode(payload));
  }
}

export const natsManager = new NatsManager();

export const connectNats = () => natsManager.connect();
export const disconnectNats = () => natsManager.disconnect();
export const getNatsConnection = () => natsManager.getConnection();
export const publishToNats = (subject: string, data: any) => natsManager.publish(subject, data);

export default natsManager;