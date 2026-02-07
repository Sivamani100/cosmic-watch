
import { describe, it, expect } from 'vitest';
import { calculateRiskScore } from './nasa.service';

describe('Risk Analysis Engine', () => {
    it('should calculate correct risk score for hazardous asteroids', () => {
        const asteroid = {
            is_potentially_hazardous_asteroid: true,
            estimated_diameter: {
                kilometers: {
                    estimated_diameter_max: 0.5,
                    estimated_diameter_min: 0.4
                }
            },
            close_approach_data: [{
                miss_distance: {
                    kilometers: '2000000', // ~5.2 LD
                    lunar: '5.2'
                }
            }]
        };

        // Hazardous (40)
        // Avg Diameter 0.45km >= 0.1(SMALL) = 10 pts
        // Distance 2M km < 7.5M km (CLOSE) = 20 pts 
        // Total = 40 + 10 + 20 = 70.
        // Expect >= 60.

        const { score } = calculateRiskScore(asteroid as any);
        expect(score).toBeGreaterThanOrEqual(60);
    });

    it('should calculate low risk for small, non-hazardous asteroids', () => {
        const asteroid = {
            is_potentially_hazardous_asteroid: false,
            estimated_diameter: {
                kilometers: {
                    estimated_diameter_max: 0.05,
                    estimated_diameter_min: 0.04
                }
            },
            close_approach_data: [{
                miss_distance: {
                    kilometers: '10000000', // ~26 LD
                    lunar: '26.0'
                }
            }]
        };

        // Hazardous (0)
        // Avg Diameter 0.045km < SMALL = 5 pts
        // Distance 10M km >= MODERATE = 5 pts
        // Total = 0 + 5 + 5 = 10.
        // Expect < 20.

        const { score } = calculateRiskScore(asteroid as any);
        expect(score).toBeLessThan(20);
    });
});
