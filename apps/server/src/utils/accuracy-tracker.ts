import { logger } from './logger.js';

export interface Prediction {
  id: string;
  category: string;
  predictedValue: number;
  actualValue: number | null;
  confidence: number;
  timestamp: Date;
}

export interface CategoryAccuracy {
  category: string;
  totalPredictions: number;
  resolvedPredictions: number;
  accuracy: number;
  avgConfidence: number;
  calibrationError: number;
}

export class AccuracyTracker {
  private predictions: Prediction[] = [];

  record(prediction: Omit<Prediction, 'id' | 'timestamp'>): string {
    const id = `pred_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.predictions.push({
      ...prediction,
      id,
      timestamp: new Date(),
    });
    logger.debug({ id, category: prediction.category }, 'Prediction recorded');
    return id;
  }

  resolve(id: string, actualValue: number): boolean {
    const pred = this.predictions.find(p => p.id === id);
    if (!pred) return false;
    pred.actualValue = actualValue;
    logger.debug({ id, actualValue }, 'Prediction resolved');
    return true;
  }

  getAccuracyByCategory(): CategoryAccuracy[] {
    const categoryMap = new Map<string, Prediction[]>();
    for (const pred of this.predictions) {
      const existing = categoryMap.get(pred.category) ?? [];
      existing.push(pred);
      categoryMap.set(pred.category, existing);
    }

    const results: CategoryAccuracy[] = [];
    for (const [category, preds] of categoryMap) {
      const resolved = preds.filter(p => p.actualValue !== null);
      const correct = resolved.filter(p => {
        const diff = Math.abs((p.actualValue as number) - p.predictedValue);
        return diff / Math.max(Math.abs(p.predictedValue), 1) < 0.2;
      });

      const avgConfidence = preds.reduce((s, p) => s + p.confidence, 0) / preds.length;
      const accuracy = resolved.length > 0 ? correct.length / resolved.length : 0;
      const calibrationError = Math.abs(accuracy - avgConfidence);

      results.push({
        category,
        totalPredictions: preds.length,
        resolvedPredictions: resolved.length,
        accuracy: Math.round(accuracy * 100),
        avgConfidence: Math.round(avgConfidence * 100),
        calibrationError: Math.round(calibrationError * 100),
      });
    }

    logger.info({ categories: results.length }, 'Accuracy report generated');
    return results;
  }

  getOverallAccuracy(): number {
    const categories = this.getAccuracyByCategory();
    if (categories.length === 0) return 0;
    return Math.round(categories.reduce((s, c) => s + c.accuracy, 0) / categories.length);
  }
}
