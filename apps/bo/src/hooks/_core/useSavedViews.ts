import { useState } from 'react';

import { ISavedView } from '@/types/_core/app.type';
import { getLocalStorage, setLocalStorage } from '@/utils/_core/utils';

type Output = {
  views: ISavedView[];
  saveView: (name: string, search: Record<string, any>) => ISavedView;
  deleteView: (id: string) => void;
};

const getStorageKey = (listId: string): string => `savedViews:${listId}`;

const readViews = (listId: string): ISavedView[] => {
  const stored = getLocalStorage(getStorageKey(listId));

  return stored ? JSON.parse(stored) : [];
};

export const useSavedViews = (listId: string): Output => {
  const [views, setViews] = useState<ISavedView[]>(() => readViews(listId));

  const persist = (newViews: ISavedView[]) => {
    setViews(newViews);
    setLocalStorage(getStorageKey(listId), newViews);
  };

  const saveView = (name: string, search: Record<string, any>): ISavedView => {
    const newView: ISavedView = {
      id: crypto.randomUUID(),
      name,
      search,
      createdAt: new Date().toISOString(),
    };

    persist([...views, newView]);

    return newView;
  };

  const deleteView = (id: string) => {
    persist(views.filter((view) => view.id !== id));
  };

  return {
    views,
    saveView,
    deleteView,
  };
};
