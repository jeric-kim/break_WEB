import type { SaveData } from '../types';

const SAVE_KEY = 'core_breaker_save_v1';

const defaultSave: SaveData = {
  coins: 250,
  parts: 5,
  blueprints: {},
  equipment: {
    gloveLv: 1,
    hammerLv: 1,
    droneLv: 1,
  },
  bestScore: 0,
};

export const SaveSystem = {
  load(): SaveData {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      return { ...defaultSave };
    }
    try {
      const parsed = JSON.parse(raw) as SaveData;
      return {
        coins: parsed.coins ?? defaultSave.coins,
        parts: parsed.parts ?? defaultSave.parts,
        blueprints: parsed.blueprints ?? {},
        equipment: {
          gloveLv: parsed.equipment?.gloveLv ?? defaultSave.equipment.gloveLv,
          hammerLv: parsed.equipment?.hammerLv ?? defaultSave.equipment.hammerLv,
          droneLv: parsed.equipment?.droneLv ?? defaultSave.equipment.droneLv,
        },
        bestScore: parsed.bestScore ?? 0,
      };
    } catch {
      return { ...defaultSave };
    }
  },
  save(data: SaveData) {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  },
  reset(): SaveData {
    localStorage.removeItem(SAVE_KEY);
    const fresh = { ...defaultSave };
    this.save(fresh);
    return fresh;
  },
};

export type SaveSystemType = typeof SaveSystem;
