import type { Asset } from '../types'

/**
 * In-memory stand-in for the real API. ADR-0006 fixes the backend as
 * server-side, but it "is still the Express generator scaffold, with no
 * database chosen" — so `assets.api.ts` serves this mock array behind the
 * same async, paginated shape the real endpoint will have, and every
 * function that touches it is where a real `apiClient` call goes later.
 */
export const mockAssets: Asset[] = [
  asset('LAP-1001', 'Dell Latitude 5440', 'Laptop', 'In Use', 'HQ – 2F – Rm 204', '2024-02-14'),
  asset('LAP-1002', 'MacBook Pro 14"', 'Laptop', 'In Use', 'HQ – 2F – Rm 206', '2023-08-30'),
  asset('LAP-1003', 'Dell Latitude 5440', 'Laptop', 'In Storage', 'Warehouse A', '2024-02-14'),
  asset('LAP-1004', 'Lenovo ThinkPad X1', 'Laptop', 'Under Repair', 'HQ – 3F – Rm 310', '2022-11-02'),
  asset('MON-2001', 'Dell UltraSharp 27"', 'Monitor', 'In Use', 'HQ – 2F – Rm 204', '2023-05-19'),
  asset('MON-2002', 'LG 24" IPS', 'Monitor', 'In Use', 'HQ – 2F – Rm 205', '2023-05-19'),
  asset('MON-2003', 'LG 24" IPS', 'Monitor', 'In Storage', 'Warehouse A', '2023-05-19'),
  asset('DSK-3001', 'Jarvis Standing Desk', 'Desk', 'In Use', 'HQ – 3F – Rm 310', '2022-01-10'),
  asset('DSK-3002', 'Jarvis Standing Desk', 'Desk', 'In Use', 'HQ – 3F – Rm 311', '2022-01-10'),
  asset('CHR-4001', 'Herman Miller Aeron', 'Chair', 'In Use', 'HQ – 3F – Rm 310', '2022-01-10'),
  asset('CHR-4002', 'Herman Miller Aeron', 'Chair', 'Retired', 'Warehouse B', '2019-06-04'),
  asset('PRJ-5001', 'Epson EB-2250U', 'Projector', 'In Use', 'HQ – Lobby', '2021-09-22'),
  asset('SRV-6001', 'Dell PowerEdge R740', 'Server', 'In Use', 'HQ – Server Rm', '2022-07-08'),
  asset('SRV-6002', 'Dell PowerEdge R640', 'Server', 'Under Repair', 'HQ – Server Rm', '2021-03-15'),
  asset('RTR-7001', 'Cisco Catalyst 9300', 'Router', 'In Use', 'HQ – Server Rm', '2023-01-05'),
  asset('TAB-8001', 'iPad Air', 'Tablet', 'In Use', 'HQ – 4F – Rm 402', '2024-06-11'),
  asset('TAB-8002', 'iPad Air', 'Tablet', 'In Storage', 'Warehouse A', '2024-06-11'),
  asset('PHN-9001', 'iPhone 13', 'Phone', 'In Use', 'Remote – WFH', '2023-10-01'),
  asset('PHN-9002', 'Samsung Galaxy S22', 'Phone', 'Retired', 'Warehouse B', '2020-02-18'),
  asset('VEH-0001', 'Ford Transit Van', 'Vehicle', 'In Use', 'HQ – Parking', '2020-08-25'),
  asset('PRN-1101', 'HP LaserJet Pro M404', 'Printer', 'In Use', 'HQ – 2F – Rm 204', '2022-04-30'),
  asset('PRN-1102', 'HP LaserJet Pro M404', 'Printer', 'Under Repair', 'HQ – 3F – Rm 310', '2022-04-30'),
]

function asset(
  tag: string,
  name: string,
  type: Asset['type'],
  status: Asset['status'],
  location: string,
  purchaseDate: string,
): Asset {
  return { id: tag, tag, name, type, status, location, purchaseDate }
}
