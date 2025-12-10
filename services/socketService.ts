

import type { Kpis, HeatmapDataPoint, SlaBreachTicket } from '../types';
import { getTrainingState } from './api';

type EventCallback = (data: any) => void;

// Helper to pick a weighted random item
function getWeightedRandom<T>(items: T[], weights: number[]): T | undefined {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    if (totalWeight === 0) {
      // If all weights are zero, return a random item with uniform probability
      return items[Math.floor(Math.random() * items.length)];
    }
    let random = Math.random() * totalWeight;
    for (let i = 0; i < items.length; i++) {
        if (random < weights[i]) {
            return items[i];
        }
        random -= weights[i];
    }
    return items[items.length - 1]; // Fallback in case of rounding errors
}


class MockSocket {
  private listeners: Map<string, EventCallback[]> = new Map();
  private intervalId?: number;

  connect() {
    console.log('[Socket] Connected');
    this.intervalId = window.setInterval(() => {
      this.simulateEvents();
    }, 5000); // Push updates every 5 seconds
  }

  disconnect() {
    console.log('[Socket] Disconnected');
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.listeners.clear();
  }

  on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  private emit(event: string, data: any) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)?.forEach(callback => callback(data));
    }
  }

  public emitNewTicket(ticket: SlaBreachTicket) {
    this.emit('new_sla_ticket', ticket);
    console.log('[Socket] Emitted new_sla_ticket', ticket);
  }

  public emitHeatmapUpdate(update: HeatmapDataPoint) {
    this.emit('heatmap_update', update);
    console.log('[Socket] Emitted live heatmap_update', update);
  }

  private simulateEvents() {
    const { isModelTrained, dataDistribution } = getTrainingState(); // Get current state from api.ts

    // Simulate a KPI update
    const deflectionBase = isModelTrained ? 85.2 : 78;
    const timeToBase = isModelTrained ? 3.8 : 4;
    const kpiUpdate: Partial<Kpis> = {
      deflectionRate: Math.max(0, Math.min(100, Math.round((deflectionBase + Math.random() * 0.5 - 0.25) * 10) / 10)),
      avgTimeToResolution: Math.max(0, Math.round((timeToBase + Math.random() * 0.2 - 0.1) * 10) / 10),
    };
    this.emit('kpi_update', kpiUpdate);
    console.log('[Socket] Emitted kpi_update', kpiUpdate);

    // FIX: Simulate heatmap update if model is trained
    if (isModelTrained && dataDistribution && dataDistribution.categories.length > 0 && dataDistribution.priorities.length > 0) {
        // Pick a category based on its weight (ticket volume)
        const category = getWeightedRandom(dataDistribution.categories, dataDistribution.categoryWeights);
        // Pick a priority randomly (assuming uniform distribution for simulation)
        const priority = dataDistribution.priorities[Math.floor(Math.random() * dataDistribution.priorities.length)];

        if (category && priority) {
            const heatmapUpdate: HeatmapDataPoint = {
                category,
                priority,
                value: 1 // a single new ticket
            };
            this.emit('heatmap_update', heatmapUpdate);
            console.log('[Socket] Emitted simulated heatmap_update', heatmapUpdate);
        }
    }
  }
}

export const socketService = new MockSocket();