import { useCallback, useEffect, useState } from 'react';

import { quranStorage } from '../storage/quranStorage';
import { QariId } from '../types';

export function useQari() {
  const [selectedQari, setSelectedQariState] = useState<QariId>('mishary');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    quranStorage.getSelectedQari().then((saved) => {
      setSelectedQariState(saved);
      setLoading(false);
    });
  }, []);

  const setSelectedQari = useCallback(async (qariId: QariId) => {
    setSelectedQariState(qariId);
    await quranStorage.setSelectedQari(qariId);
  }, []);

  return { selectedQari, setSelectedQari, loading };
}
