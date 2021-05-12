import * as React from 'react';
import { bindActionCreators, Dispatch, ActionCreator } from 'redux';
import { connect,  } from 'react-redux';
import { makeStyles } from '@material-ui/styles';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import { joystickMove, JoystickID, JoystickState, GamepadState, GamepadAction, ViewportState } from './store';

const MAX_UINT8 = 255;
const limitUInt8 = (x: number) => Math.max(0, Math.min(255, x));

const FOREGROUND = '#dddce1';

/**
 * Hacky scaling factore for the main plate.
 * Didn't realise doing all the sizes with percentages would be such a pain.
 */
const MAIN_PLATE_SCALE = 0.9 * 0.9 * 0.98 * 0.96;

const calcJoystickSize = (viewport: ViewportState): { width: number, height: number } => {
  if (viewport.width >= (2 * viewport.height)) {
    return {
      width: viewport.height,
      height: viewport.height,
    };
  } else {
    const size = viewport.width / 2;
    return {
      width: size,
      height: size,
    };
  }
};

const useStyles = makeStyles({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    alignItems: 'stretch',

    background: '#4e4f54',
  },
  grow: {
    position: 'relative',
  },
  square: {
    position: 'relative',
    display: 'block',
  },
  joystickContent: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    margin: 'auto',
  },
  outerRing: {
    position: 'absolute',
    top: '5%',
    left: '5%',
    width: '90%',
    height: '90%',
    borderRadius: '50%',
    background: '#1a1b20',
    boxShadow: '-1px -0.5px 6px #707176, inset 2px 2px 3px #08070c, inset -5px -5px 5px #0d0d0f',
  },
  innerRing: {
    position: 'absolute',
    top: '5%',
    left: '5%',
    width: '90%',
    height: '90%',
    borderRadius: '50%',
    background: '#57585d',
    boxShadow: '-2px -2px 3px #0c0b10, 2px -1px 3px #0c0b10, -2px -8px 5px #36373c, 2px 2px 2px #0c0b10',
  },
  indent: {
    position: 'absolute',
    top: '1%',
    left: '1%',
    width: '98%',
    height: '98%',
    borderRadius: '50%',
    background: '#2d2e33',
  },
  mainPlate: {
    position: 'absolute',
    top: '2%',
    left: '2%',
    width: '96%',
    height: '96%',
    borderRadius: '50%',
    backgroundImage: 'radial-gradient(55% 55%, circle, #36373b 0, #57585d 100%)',
    textAlign: 'center',
  },
  crosshairLeft: {
    position: 'absolute',
    top: '49.5%',
    left: '1%',
    width: '5%',
    height: '1%',
    borderRadius: '2px',
    background: FOREGROUND,
  },
  crosshairRight: {
    position: 'absolute',
    top: '49.5%',
    right: '1%',
    width: '5%',
    height: '1%',
    borderRadius: '2px',
    background: FOREGROUND,
  },
  crosshairTop: {
    position: 'absolute',
    top: '1%',
    left: '49.5%',
    width: '1%',
    height: '5%',
    borderRadius: '2px',
    background: FOREGROUND,
  },
  crosshairBottom: {
    position: 'absolute',
    bottom: '1%',
    left: '49.5%',
    width: '1%',
    height: '5%',
    borderRadius: '2px',
    background: FOREGROUND,
  },
  cursor: {
    position: 'absolute',
    width: '5%',
    height: '5%',
    borderRadius: '50%',
    background: FOREGROUND,
    marginLeft: '-2.5%',
    marginTop: '-2.5%',
  },
  fullscreenButton: {
    position: 'absolute',
    color: FOREGROUND,
    zIndex: 2,
    fontSize: '10vh',
  },
});

// Touch / Mouse calculations

const mainPlateWidth = (size: number) => size * MAIN_PLATE_SCALE;

const mainPlateMargin = (size: number) => (size - mainPlateWidth(size)) / 2;

const scaleRelativePoint = (size: number, x: number) =>
  (x - mainPlateMargin(size)) * (1/MAIN_PLATE_SCALE);

const updateJoystickPoint = (id: JoystickID, size: number, event: { clientX: number, clientY: number }, dispatch: (pos: { x: number, y: number }) => void): void => {
  const relativeX = (id === 'left') ?
    scaleRelativePoint(size, event.clientX) :
    scaleRelativePoint(size, event.clientX - (window.innerWidth - size));

  dispatch({
    x: limitUInt8((relativeX / size) * MAX_UINT8),
    y: limitUInt8((scaleRelativePoint(size, event.clientY) / size) * MAX_UINT8),
  });
};

type JoystickProps = {
  size: {
    // TODO these are always equal... because it's a square lol
    width: number;
    height: number;
  },
  id: JoystickID;
  state: JoystickState;
  dispatch: (loc: { x: number, y: number}) => void;
};
const Joystick: React.FC<JoystickProps> = ({ size, state, id, dispatch }) => {
  const classes = useStyles();

  const mouseHandler = (event: React.MouseEvent) => updateJoystickPoint(id, size.width, event, dispatch);

  return <div className={classes.grow}>
    <div
      className={classes.square}
      style={{
        top: 0,
        [id]: 0,
        width: `${size.width}px`,
        height: `${size.height}px`,
      }}
    >
      <div className={classes.joystickContent}>
        <div className={classes.outerRing}>
          <div className={classes.innerRing}>
            <div className={classes.indent}>
              <div
                className={classes.mainPlate}
                onMouseMove={mouseHandler}
              >
              {/*mps: {MAIN_PLATE_SCALE}<br/>
                mpm: {mainPlateMargin}<br/>
                x: {state.x}<br/>
                y: {state.y}*/}
                <div className={classes.crosshairLeft}/>
                <div className={classes.crosshairRight}/>
                <div className={classes.crosshairTop}/>
                <div className={classes.crosshairBottom}/>
                <div
                  className={classes.cursor}
                  style={{
                    /* Convert values to percentage of size of pad */
                    left: `${(state.x / MAX_UINT8) * 100}%`,
                    top: `${(state.y / MAX_UINT8) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>;
};

const currentlyFullscreen = (): boolean => window.document.fullscreenElement !== null;

export const FullscreenButton: React.FC = () => {
  const classes = useStyles();
  const [isFullscreen, setFullscreen] = React.useState(currentlyFullscreen());

  const goFullscreen = () => {
    window.document.documentElement.requestFullscreen();
    setFullscreen(currentlyFullscreen());
  };
  const exitFullscreen = () => {
    window.document.exitFullscreen();
    setFullscreen(currentlyFullscreen());
  };

  if (!isFullscreen) {
    return <FullscreenIcon
      className={classes.fullscreenButton}
      onClick={goFullscreen}
    />;
  } else {
    return <FullscreenExitIcon
      className={classes.fullscreenButton}
      onClick={exitFullscreen}
    />;
  }
};

const _Gamepad: React.FC<Props> = ({
  viewport,
  joysticks,
  leftJoystickMoved,
  rightJoystickMoved,
}) => {
  const classes = useStyles();
  const joystickSize = calcJoystickSize(viewport);

  const touchHandler = (event: React.TouchEvent) => {
    for(let i = 0; i < event.touches.length; i++) {
      let touch = event.touches.item(i);
      const joystickId = (touch.clientX < (window.innerWidth / 2)) ? 'left' : 'right';
      const dispatch = joystickId === 'left' ? leftJoystickMoved : rightJoystickMoved;

      updateJoystickPoint(joystickId, joystickSize.width, touch, dispatch);
    }
  };

  return <div className={classes.root} onTouchMove={touchHandler}>
    <FullscreenButton/>
    <Joystick size={joystickSize} id={'left'} state={joysticks['left']} dispatch={leftJoystickMoved}/>
    <Joystick size={joystickSize} id={'right'} state={joysticks['right']} dispatch={rightJoystickMoved}/>
  </div>;
}

// View Helpers
type Props = ReturnType<typeof mapDispatchToProps> & ReturnType<typeof mapStateToProps>;

const mapStateToProps = (state: GamepadState) => (state);

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators({
    leftJoystickMoved: joystickMove('left'),
    rightJoystickMoved: joystickMove('right'),
  },
  dispatch);

export const Gamepad = connect(mapStateToProps, mapDispatchToProps)(_Gamepad)
