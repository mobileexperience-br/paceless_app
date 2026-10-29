import { base64ToBytes } from './base64.ts';

export type SensorContact = 'detected' | 'lost' | 'unsupported';

export interface HeartRateReading {
  bpm: number;
  contact: SensorContact;
  energyKj: number | null;
  rrMs: number[];
}

const FLAG_UINT16_BPM = 0x01;
const FLAG_CONTACT_DETECTED = 0x02;
const FLAG_CONTACT_SUPPORTED = 0x04;
const FLAG_ENERGY = 0x08;
const FLAG_RR = 0x10;
const RR_UNITS_PER_SECOND = 1024;
const MS_PER_SECOND = 1000;
const FLAGS_BYTES = 1;
const UINT8_BYTES = 1;
const UINT16_BYTES = 2;

function contactFrom(flags: number): SensorContact {
  if ((flags & FLAG_CONTACT_SUPPORTED) === 0) return 'unsupported';
  return (flags & FLAG_CONTACT_DETECTED) !== 0 ? 'detected' : 'lost';
}

export function parseHeartRateBytes(bytes: Uint8Array): HeartRateReading | null {
  if (bytes.length < FLAGS_BYTES + UINT8_BYTES) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const flags = view.getUint8(0);
  const isUint16 = (flags & FLAG_UINT16_BPM) !== 0;
  const bpmBytes = isUint16 ? UINT16_BYTES : UINT8_BYTES;
  if (bytes.length < FLAGS_BYTES + bpmBytes) return null;
  const bpm = isUint16 ? view.getUint16(FLAGS_BYTES, true) : view.getUint8(FLAGS_BYTES);
  let offset = FLAGS_BYTES + bpmBytes;
  let energyKj: number | null = null;
  if ((flags & FLAG_ENERGY) !== 0 && offset + UINT16_BYTES <= bytes.length) {
    energyKj = view.getUint16(offset, true);
    offset += UINT16_BYTES;
  }
  const rrMs: number[] = [];
  if ((flags & FLAG_RR) !== 0) {
    while (offset + UINT16_BYTES <= bytes.length) {
      const units = view.getUint16(offset, true);
      rrMs.push(Math.round((units * MS_PER_SECOND) / RR_UNITS_PER_SECOND));
      offset += UINT16_BYTES;
    }
  }
  return { bpm, contact: contactFrom(flags), energyKj, rrMs };
}

export function parseHeartRate(base64: string): HeartRateReading | null {
  const bytes = base64ToBytes(base64);
  return bytes === null ? null : parseHeartRateBytes(bytes);
}
