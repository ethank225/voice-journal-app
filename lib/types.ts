export interface Transcript {
  id: number;
  transcript: string;
  sentiment: string;
  mean_pitch: number;
  pitch_variability: number;
  mean_loudness: number;
  speaking_rate_wps: number;
}