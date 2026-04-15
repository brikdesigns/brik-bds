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
 */
export declare function AnimatedIcon({ animationData, size, trigger, loop, label, className, }: AnimatedIconProps): import("react/jsx-runtime").JSX.Element;
export default AnimatedIcon;
