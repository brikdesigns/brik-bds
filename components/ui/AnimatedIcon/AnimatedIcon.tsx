import { useRef, useEffect } from 'react';
import Lottie, { type LottieRefCurrentProps } from 'lottie-react';
import { bdsClass } from '../../utils';
import './AnimatedIcon.css';

export type AnimatedIconTrigger = 'loop' | 'hover' | 'click' | 'once';

export interface AnimatedIconProps {
  /** Lottie JSON animation data — import from your app's src/animations/ */
  animationData: object;
  /** Pixel size (width = height) */
  size?: number;
  /** Playback control */
  trigger?: AnimatedIconTrigger;
  /** Loop the animation (overrides trigger loop logic) */
  loop?: boolean;
  /** aria-label for accessibility */
  label?: string;
  /** Optional CSS class names appended to the wrapping `<span>`. */
  className?: string;
}

/**
 * AnimatedIcon — Lottie wrapper for animated UI icon states.
 *
 * Source Lottie JSON from useanimations.com and store in your app's
 * `src/animations/` directory. Pass the imported JSON as `animationData`.
 *
 * @example
 * ```tsx
 * import checkAnimation from '@/animations/checkbox.json';
 * <AnimatedIcon animationData={checkAnimation} trigger="once" size={32} label="Completed" />
 * ```
 *
 * @summary Lottie wrapper for animated icon states
 */
export function AnimatedIcon({
  animationData,
  size = 32,
  trigger = 'loop',
  loop,
  label,
  className,
}: AnimatedIconProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  const shouldLoop = loop !== undefined ? loop : trigger === 'loop';

  useEffect(() => {
    if (trigger === 'once') {
      lottieRef.current?.play();
    }
  }, [trigger]);

  const handleMouseEnter = () => {
    if (trigger === 'hover') lottieRef.current?.play();
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') lottieRef.current?.stop();
  };

  const handleClick = () => {
    if (trigger === 'click') {
      lottieRef.current?.stop();
      lottieRef.current?.play();
    }
  };

  return (
    <span
      role={label ? 'img' : 'presentation'}
      aria-label={label}
      className={bdsClass('bds-animated-icon', className)}
      style={{ width: size, height: size, display: 'inline-flex' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={shouldLoop}
        autoplay={trigger === 'loop' || trigger === 'once'}
        style={{ width: size, height: size }}
        aria-hidden
      />
    </span>
  );
}

export default AnimatedIcon;
