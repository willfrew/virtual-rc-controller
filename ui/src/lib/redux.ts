import { Action, Reducer } from 'redux';
import { GamepadAction } from '../gamepad/store'; // lol

type StrictReducer<S, A extends Action> = (state: S, action: A) => S;

/**
 * Since we _always_ initialise the store with a complete initial state, it is
 * not necessary for reducers to handle the `undefined` state case.
 *
 * We therefore provide this small wrapper than immediately returns the
 * reducer again, as-is, but with its type amended to remove the `undefined`
 * from its `state` parameter.
 *
 * If the state parameter is `undefined`, the wrapper returns a value to get around
 * redux's check (https://github.com/reduxjs/redux/blob/master/src/combineReducers.ts#L77).
 *
 */
export const r =
  <S, A extends Action<string> = GamepadAction>(reducer: StrictReducer<S, A>): Reducer<S, A> => {
    return (state: S | undefined, action: A): S => {
      if (state === undefined) {
        // This should never be observed in the actual state tree.
        // It is only returned to redux during store creation.
        return 'WARNING, REDUCER CHECK VALUE' as unknown as S;
      }
      return reducer(state, action);
    };
  };
