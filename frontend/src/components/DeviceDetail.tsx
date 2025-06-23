import React from 'react';
import { useQuery, useSubscription, gql } from '@apollo/client';
import { useParams, Link } from 'react-router-dom';

const GET_DEVICE = gql`
  query GetDevice($id: ID!) {
    device(id: $id) {
      _id
      name
      type
      status
    }
  }
`;

const GET_DEVICE_TELEMETRY = gql`
  query GetDeviceTelemetry($deviceId: String!) {
    deviceTelemetry(deviceId: $deviceId) {
      _id
      deviceId
      timestamp
      payload
    }
  }
`;

const TELEMETRY_SUBSCRIPTION = gql`
  subscription {
    telemetry
  }
`;

interface Device {
  _id: string;
  name: string;
  type: string;
  status: string;
}

interface TelemetryRecord {
  _id: string;
  deviceId: string;
  timestamp: string;
  payload: string;
}

export default function DeviceDetail() {
  const { id } = useParams<{ id: string }>();
  
  const { loading: deviceLoading, error: deviceError, data: deviceData } = useQuery<{ device: Device }>(
    GET_DEVICE,
    { variables: { id } }
  );

  const { loading: telemetryLoading, error: telemetryError, data: telemetryData } = useQuery<{ deviceTelemetry: TelemetryRecord[] }>(
    GET_DEVICE_TELEMETRY,
    { variables: { deviceId: id } }
  );

  const { data: subscriptionData } = useSubscription(TELEMETRY_SUBSCRIPTION);

  if (deviceLoading) return <div>Загрузка устройства...</div>;
  if (deviceError) return <div>Ошибка загрузки устройства: {deviceError.message}</div>;

  const device = deviceData?.device;
  if (!device) return <div>Устройство не найдено</div>;

  return (
    <div className="device-detail">
      <Link to="/devices" className="back-link">← Назад к списку</Link>
      
      <div className="device-info">
        <h2>{device.name}</h2>
        <div className="info-grid">
          <div className="info-item">
            <strong>ID:</strong> {device._id}
          </div>
          <div className="info-item">
            <strong>Тип:</strong> {device.type}
          </div>
          <div className="info-item">
            <strong>Статус:</strong> 
            <span className={`status ${device.status.toLowerCase()}`}>
              {device.status}
            </span>
          </div>
        </div>
      </div>

      <div className="telemetry-section">
        <h3>Телеметрия</h3>
        {telemetryLoading && <div>Загрузка телеметрии...</div>}
        {telemetryError && <div>Ошибка загрузки телеметрии: {telemetryError.message}</div>}
        
        {telemetryData && (
          <div className="telemetry-table">
            <table>
              <thead>
                <tr>
                  <th>Время</th>
                  <th>Данные</th>
                </tr>
              </thead>
              <tbody>
                {telemetryData.deviceTelemetry.map((record) => (
                  <tr key={record._id}>
                    <td>{new Date(record.timestamp).toLocaleString()}</td>
                    <td>
                      <pre>{JSON.stringify(JSON.parse(record.payload), null, 2)}</pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {subscriptionData && (
        <div className="realtime-update">
          <h4>Последнее обновление в реальном времени:</h4>
          <pre>{subscriptionData.telemetry}</pre>
        </div>
      )}
    </div>
  );
} 