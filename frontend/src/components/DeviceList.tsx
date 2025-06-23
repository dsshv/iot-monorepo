import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { Link } from 'react-router-dom';

const GET_DEVICES = gql`
  query GetDevices {
    devices {
      _id
      name
      type
      status
    }
  }
`;

interface Device {
  _id: string;
  name: string;
  type: string;
  status: string;
}

export default function DeviceList() {
  const { loading, error, data } = useQuery<{ devices: Device[] }>(GET_DEVICES);

  if (loading) return <div>Загрузка устройств...</div>;
  if (error) return <div>Ошибка загрузки: {error.message}</div>;

  return (
    <div className="device-list">
      <h2>Устройства</h2>
      <div className="devices-grid">
        {data?.devices.map((device) => (
          <Link 
            key={device._id} 
            to={`/devices/${device._id}`}
            className="device-card"
          >
            <h3>{device.name}</h3>
            <p><strong>Тип:</strong> {device.type}</p>
            <p><strong>Статус:</strong> 
              <span className={`status ${device.status.toLowerCase()}`}>
                {device.status}
              </span>
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
} 