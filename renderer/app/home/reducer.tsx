export type DisplayState = {
  slidingPosition: 'left' | 'center' | 'right';
  timeDisplay: 'always' | 'hover' | 'never';
  progressDisplay: 'always' | 'hover' | 'never';
  hiddenControlBar: boolean;
  hiddenRefreshWindow: boolean;
  useWindowBackgroundMaterial: boolean; // 新增
};

export type AppState = {
  classSchedule: any | null;
  display: DisplayState;
  playingMixed: boolean;
};

export const initialState: AppState = {
  classSchedule: null,
  display: {
    slidingPosition: 'center',
    timeDisplay: 'always',
    progressDisplay: 'always',
    hiddenControlBar: false,
    hiddenRefreshWindow: false,
    useWindowBackgroundMaterial: false,
  },
  playingMixed: true,
};

export type Action = { type: 'UPDATE'; payload: Partial<AppState> } | { type: 'SET_PLAYING_MIXED'; payload: boolean };

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'UPDATE':
      return {
        ...state,
        ...action.payload,
        display: {
          ...state.display,
          ...(action.payload.display || {}),
        },
      };

    case 'SET_PLAYING_MIXED':
      return {
        ...state,
        playingMixed: action.payload,
      };

    default:
      return state;
  }
}
