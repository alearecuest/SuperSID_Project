import { analysisService } from '../analysis.service';

describe('AnalysisService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe('getCurrentSolarActivity', () => {
    it('should fetch current solar activity', async () => {
      const mockData = {
        success: true,
        data: {
          timestamp: '2025-11-03T17:58:50Z',
          kIndex: 3,
          solarFlux: 150,
          activeRegions: 5,
          sunspots: 20,
          xrayClass: 'A',
          protonFlux: 0,
          electronFlux: 0,
          magneticStorm: 'none',
          source: 'test',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockData,
      });

      const result = await analysisService.getCurrentSolarActivity();

      expect(result).toEqual(mockData.data);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/analysis/space-weather'
      );
    });

    it('should handle fetch error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(analysisService.getCurrentSolarActivity()).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('getSolarForecast', () => {
    it('should fetch solar forecast', async () => {
      const mockData = {
        success: true,
        data: [
          {
            timestamp: '2025-11-04T00:00:00Z',
            kIndex: 4,
            solarFlux: 160,
            activeRegions: 5,
            sunspots: 22,
            xrayClass: 'A',
            protonFlux: 0,
            electronFlux: 0,
            magneticStorm: 'none',
            source: 'test',
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockData,
      });

      const result = await analysisService.getSolarForecast();

      expect(result).toEqual(mockData.data);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/analysis/space-weather/forecast'
      );
    });
  });

  describe('getVLFData', () => {
    it('should fetch VLF data for observatory', async () => {
      const mockData = {
        success: true,
        data: {
          observatoryId: 999,
          signals: [],
          averageAmplitude: 45.5,
          peakAmplitude: 60.2,
          noiseLevel: 35.1,
          disturbanceIndex: 30,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockData,
      });

      const result = await analysisService.getVLFData(999);

      expect(result).toEqual(mockData.data);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/analysis/vlf/999'
      );
    });
  });

  describe('correlateData', () => {
    it('should correlate solar and VLF data', async () => {
      const mockData = {
        success: true,
        data: {
          timestamp: '2025-11-03T17:58:50Z',
          solarActivity: {
            timestamp: '2025-11-03T17:58:50Z',
            kIndex: 3,
            solarFlux: 150,
            activeRegions: 5,
            sunspots: 20,
            xrayClass: 'A',
            protonFlux: 0,
            electronFlux: 0,
            magneticStorm: 'none',
            source: 'test',
          },
          vlsSignals: {
            observatoryId: 999,
            signals: [],
            averageAmplitude: 45.5,
            peakAmplitude: 60.2,
            noiseLevel: 35.1,
            disturbanceIndex: 30,
          },
          correlationCoefficient: 0.45,
          relationship: 'moderate-positive',
          confidence: 75,
          summary: 'Moderate correlation detected',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockData,
      });

      const result = await analysisService.correlateData(999);

      expect(result.correlationCoefficient).toBe(0.45);
      expect(result.relationship).toBe('moderate-positive');
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/analysis/correlate/999',
        { method: 'POST' }
      );
    });
  });
});