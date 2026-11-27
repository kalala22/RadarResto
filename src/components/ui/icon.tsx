import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '@/theme/colors';

/** Icônes au trait 2 px, grille de 24 px, coins arrondis (charte graphique). */
export type IconName =
  | 'bell'
  | 'search'
  | 'ranking'
  | 'pin'
  | 'heart'
  | 'heart-filled'
  | 'user'
  | 'back'
  | 'chevron-right'
  | 'locate'
  | 'navigate'
  | 'phone'
  | 'shield-check'
  | 'camera'
  | 'star'
  | 'message'
  | 'settings'
  | 'close'
  | 'check'
  | 'lock'
  | 'award'
  | 'share'
  | 'sliders'
  | 'chevron-down'
  | 'clock'
  | 'history';

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function Icon({ name, size = 22, color = colors.encre, strokeWidth = 2 }: Props) {
  const common = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {renderIcon(name, common, color)}
    </Svg>
  );
}

function renderIcon(name: IconName, p: Record<string, unknown>, color: string) {
  switch (name) {
    case 'bell':
      return (
        <>
          <Path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8" {...p} />
          <Path d="M10 20a2 2 0 0 0 4 0" {...p} />
        </>
      );
    case 'search':
      return (
        <>
          <Circle cx={11} cy={11} r={7} {...p} />
          <Path d="m20 20-3.5-3.5" {...p} />
        </>
      );
    case 'ranking':
      return <Path d="M8 21V11M16 21V7M12 21V3M4 21v-6M20 21v-9" {...p} />;
    case 'pin':
      return (
        <>
          <Path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" {...p} />
          <Circle cx={12} cy={10} r={2.5} {...p} />
        </>
      );
    case 'heart':
      return <Path d="M12 20s-8-4.8-8-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5C20 15.2 12 20 12 20z" {...p} />;
    case 'heart-filled':
      return (
        <Path
          d="M12 20s-8-4.8-8-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5C20 15.2 12 20 12 20z"
          {...p}
          fill={color}
        />
      );
    case 'user':
      return (
        <>
          <Circle cx={12} cy={8} r={4} {...p} />
          <Path d="M4 21a8 8 0 0 1 16 0" {...p} />
        </>
      );
    case 'back':
      return <Path d="m15 18-6-6 6-6" {...p} />;
    case 'chevron-right':
      return <Path d="m9 18 6-6-6-6" {...p} />;
    case 'locate':
      return (
        <>
          <Circle cx={12} cy={12} r={4} {...p} />
          <Path d="M12 2v3M12 19v3M2 12h3M19 12h3" {...p} />
        </>
      );
    case 'navigate':
      return <Path d="m3 11 18-8-8 18-2-8z" {...p} />;
    case 'phone':
      return (
        <Path
          d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"
          {...p}
        />
      );
    case 'shield-check':
      return (
        <>
          <Path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6z" {...p} />
          <Path d="m9 12 2 2 4-4" {...p} />
        </>
      );
    case 'camera':
      return (
        <>
          <Path d="M4 8h3l2-3h6l2 3h3v11H4z" {...p} />
          <Circle cx={12} cy={13} r={3.5} {...p} />
        </>
      );
    case 'star':
      return (
        <Path
          d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z"
          fill={color}
          stroke="none"
        />
      );
    case 'message':
      return (
        <>
          <Path d="M21 12a9 9 0 0 1-13.2 8L3 21l1.1-4.6A9 9 0 1 1 21 12z" {...p} />
          <Path d="M9 11h.01M12 11h.01M15 11h.01" {...p} />
        </>
      );
    case 'settings':
      return (
        <>
          <Circle cx={12} cy={12} r={3} {...p} />
          <Path
            d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"
            {...p}
          />
        </>
      );
    case 'close':
      return <Path d="M18 6 6 18M6 6l12 12" {...p} />;
    case 'check':
      return <Path d="m5 12 5 5 9-10" {...p} />;
    case 'lock':
      return (
        <>
          <Path d="M6 11h12v10H6z" {...p} />
          <Path d="M8 11V7a4 4 0 0 1 8 0v4" {...p} />
        </>
      );
    case 'award':
      return (
        <>
          <Circle cx={12} cy={9} r={6} {...p} />
          <Path d="m8.5 14-1.5 8 5-3 5 3-1.5-8" {...p} />
        </>
      );
    case 'share':
      return (
        <>
          <Path d="M12 15V3M7 8l5-5 5 5" {...p} />
          <Path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" {...p} />
        </>
      );
    case 'sliders':
      return (
        <>
          <Path d="M4 7h10M18 7h2M4 17h4M12 17h8" {...p} />
          <Circle cx={16} cy={7} r={2} {...p} />
          <Circle cx={10} cy={17} r={2} {...p} />
        </>
      );
    case 'chevron-down':
      return <Path d="m6 9 6 6 6-6" {...p} />;
    case 'clock':
      return (
        <>
          <Circle cx={12} cy={12} r={9} {...p} />
          <Path d="M12 7v5l3 2" {...p} />
        </>
      );
    case 'history':
      return (
        <>
          <Path d="M3 12a9 9 0 1 0 3-6.7L3 8" {...p} />
          <Path d="M3 3v5h5M12 8v4l3 2" {...p} />
        </>
      );
  }
}
