import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { IListTabCounts, ISelectOption } from '@/types/_core/app.type';

interface IEntityWithId {
  id: string;
}

export interface IEntityState<TEntity> {
  loading: boolean;
  entity: TEntity | null;
  entities: TEntity[];
  entitiesOptions: ISelectOption[];
  count: number;
  // how many rows each tab of the list holds, whichever tab is currently being displayed
  tabCounts: IListTabCounts;
}

/**
 * generic list/detail/options CRUD state, shared by every domain entity in the BO
 * (category, page, article, ride, ...) — a hand-written reducer per entity repeats the exact same
 * reducers and selectors with only the entity name changed, so the shape is declared once here and
 * an entity only writes the state it holds on top of it
 * @param name slice name, ex: 'category'
 */
export const createEntitySlice = <TEntity extends IEntityWithId>(name: string) => {
  const initialState: IEntityState<TEntity> = {
    loading: false,
    entity: null,
    entities: [],
    entitiesOptions: [],
    count: 0,
    tabCounts: {},
  };

  return createSlice({
    name,
    initialState,
    reducers: {
      loadListSlice: (state, action: PayloadAction<TEntity[]>) => {
        state.entities = action.payload as any;
      },
      loadOptionsSlice: (state, action: PayloadAction<ISelectOption[]>) => {
        state.entitiesOptions = action.payload;
      },
      clearOptionsSlice: (state) => {
        state.entitiesOptions = [];
      },
      loadOneSlice: (state, action: PayloadAction<TEntity>) => {
        state.entity = action.payload as any;
      },
      addToListSlice: (state, action: PayloadAction<TEntity>) => {
        state.entities = [...state.entities, action.payload] as any;
        state.count += 1;
      },
      removeFromListSlice: (state, action: PayloadAction<string>) => {
        state.entities = state.entities.filter(
          (entity) => (entity as TEntity & IEntityWithId).id !== action.payload
        );
        state.count -= 1;
      },
      /*
       * writes one field back on the rows a bulk action just changed, leaving them where they are.
       * Used by the actions that change a row rather than take it out of the list (switching rows
       * on or off): removing and re-adding them would reorder the list under the reader's cursor.
       */
      updateFieldInListSlice: (
        state,
        action: PayloadAction<{ ids: string[]; field: string; value: unknown }>
      ) => {
        const { ids, field, value } = action.payload;

        state.entities = state.entities.map((entity) => (
          ids.includes((entity as TEntity & IEntityWithId).id)
            ? { ...entity, [field]: value }
            : entity
        ));
      },
      /*
       * the single-entity counterpart of `updateFieldInListSlice`: writes one field on the open
       * detail, so an action triggered from either screen leaves both saying the same thing. The
       * id is checked rather than assumed — the detail may have been replaced since the action
       * started, and writing into whatever is open now would state it about the wrong record.
       */
      updateFieldOnOneSlice: (
        state,
        action: PayloadAction<{ id: string; field: string; value: unknown }>
      ) => {
        const { id, field, value } = action.payload;
        const entity = state.entity as (TEntity & IEntityWithId) | null;

        if (!entity || entity.id !== id) return;

        state.entity = { ...entity, [field]: value } as any;
      },
      removeManyFromListSlice: (state, action: PayloadAction<string[]>) => {
        state.entities = state.entities.filter(
          (entity) => !action.payload.includes((entity as TEntity & IEntityWithId).id)
        );
      },
      setCountSlice: (state, action: PayloadAction<number>) => {
        state.count = action.payload;
      },
      setTabCountsSlice: (state, action: PayloadAction<IListTabCounts>) => {
        state.tabCounts = action.payload;
      },
      /*
       * keeps the tab figures true between two fetches: binning rows moves them from the list tab
       * into the recycle bin, destroying them takes them out of the bin for good. Without it the
       * strip would still call the bin empty right after a row was dropped into it — and the tab
       * needed to reach that row would stay inert until the next reload.
       *
       * A figure that has not landed yet is left alone rather than counted from zero: it is
       * unknown, not empty, and the fetch it is waiting on will bring the already-shifted total.
       */
      shiftTabCountsSlice: (
        state,
        action: PayloadAction<{ from: string; to?: string; amount: number }>
      ) => {
        const { from, to, amount } = action.payload;
        const previousFrom = state.tabCounts[from];

        if (previousFrom !== undefined) {
          state.tabCounts[from] = Math.max(previousFrom - amount, 0);
        }

        if (to === undefined) return;

        const previousTo = state.tabCounts[to];

        if (previousTo !== undefined) {
          state.tabCounts[to] = previousTo + amount;
        }
      },
      /*
       * rewrites one row where it stands, unlike `updateInListSlice` which pulls it to the top.
       * Used when the change is an outcome rather than an edit — an operator working down a run of
       * failed payments is retrying them in the order they are reading, and a row that jumps to the
       * front on success takes their place in the list away from them.
       */
      replaceInListSlice: (state, action: PayloadAction<TEntity>) => {
        state.entities = state.entities.map((entity) => (
          (entity as TEntity & IEntityWithId).id === action.payload.id
            ? { ...entity, ...action.payload }
            : entity
        ));
      },
      updateInListSlice: (state, action: PayloadAction<TEntity>) => {
        const newEntities: TEntity[] = [];

        for (const entity of state.entities as TEntity[]) {
          if ((entity as TEntity & IEntityWithId).id === action.payload.id) {
            newEntities.unshift({ ...entity, ...action.payload });
          }
          else {
            newEntities.push(entity);
          }
        }

        state.entities = newEntities as any;
      },
      clearOneSlice: (state) => {
        state.entity = null;
      },
      clearListSlice: (state) => {
        state.entities = [];
      },
      setLoadingSlice: (state, action: PayloadAction<boolean>) => {
        state.loading = action.payload;
      },
      clearCountSlice: (state) => {
        state.count = 0;
      },
    },
  });
};
