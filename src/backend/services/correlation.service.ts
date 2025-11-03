export interface SolarActivity {
  timestamp: string;
  kIndex: number;
  solarFlux: number;
  activeRegions: number;
  sunspots: number;
  xrayClass: string;
  protonFlux: number;
  electronFlux: number;
  magneticStorm: string;
  source: string;
}

export interface SuperSIDData {
  observatoryId: number;
  signals: any[];
  averageAmplitude: number;
  peakAmplitude: number;
  noiseLevel: number;
  disturbanceIndex: number;
}

export interface CorrelationAnalysis {
  timestamp: string;
  solarActivity: SolarActivity;
  vlsSignals: SuperSIDData;
  correlationCoefficient: number;
  relationship: 'strong-positive' | 'moderate-positive' | 'weak' | 'moderate-negative' | 'strong-negative';
  confidence: number;
  summary: string;
}

class CorrelationService {
  correlateData(
    solarActivity: SolarActivity,
    vlsData: SuperSIDData
  ): CorrelationAnalysis {
    const coefficient = this.calculateCorrelation(solarActivity, vlsData);
    const relationship = this.getRelationship(coefficient);
    const confidence = Math.min(100, Math.max(0, (vlsData.signals.length / 1440) * 100));
    const summary = this.generateSummary(solarActivity, vlsData, coefficient);

    return {
      timestamp: new Date().toISOString(),
      solarActivity,
      vlsSignals: vlsData,
      correlationCoefficient: coefficient,
      relationship,
      confidence,
      summary,
    };
  }

  private calculateCorrelation(
    solarActivity: SolarActivity,
    vlsData: SuperSIDData
  ): number {
    try {
      const normalizedKIndex = (solarActivity.kIndex / 9) * 100;
      const normalizedSolarFlux = Math.min(100, (solarActivity.solarFlux / 300) * 100);
      const solarSeverity = (normalizedKIndex + normalizedSolarFlux) / 2;
      const vlsDisturbance = vlsData.disturbanceIndex;
      const maxDiff = 100;
      const diff = Math.abs(solarSeverity - vlsDisturbance);
      const correlation = 1 - diff / maxDiff;
      return Math.max(-1, Math.min(1, correlation));
    } catch (error) {
      console.error('Error calculating correlation:', error);
      return 0;
    }
  }

  private getRelationship(
    coefficient: number
  ): 'strong-positive' | 'moderate-positive' | 'weak' | 'moderate-negative' | 'strong-negative' {
    if (coefficient >= 0.7) return 'strong-positive';
    if (coefficient >= 0.4) return 'moderate-positive';
    if (coefficient >= -0.4) return 'weak';
    if (coefficient >= -0.7) return 'moderate-negative';
    return 'strong-negative';
  }

  private generateSummary(
    solarActivity: SolarActivity,
    vlsData: SuperSIDData,
    coefficient: number
  ): string {
    const solarSeverity =
      solarActivity.kIndex >= 7
        ? 'severe'
        : solarActivity.kIndex >= 5
          ? 'high'
          : solarActivity.kIndex >= 3
            ? 'moderate'
            : 'low';

    const vlsSeverity =
      vlsData.disturbanceIndex >= 70
        ? 'severe'
        : vlsData.disturbanceIndex >= 50
          ? 'high'
          : vlsData.disturbanceIndex >= 30
            ? 'moderate'
            : 'low';

    if (coefficient > 0.5) {
      return `Strong correlation detected: Solar activity (${solarSeverity}) and VLF disturbances (${vlsSeverity}) are closely related.`;
    }
    if (coefficient > 0.2) {
      return `Moderate correlation: Some relationship between solar activity and VLF signals observed.`;
    }
    return `Weak correlation: VLF disturbances may be caused by other factors besides current solar activity.`;
  }
}

export const correlationService = new CorrelationService();