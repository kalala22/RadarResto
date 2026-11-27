import { useImperativeHandle, useState } from 'react';
import { Pressable, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Path, Rect, Text as SvgText } from 'react-native-svg';

import { formatScore } from '@/lib/format';
import { colors } from '@/theme/colors';

import { ScorePin, UserDot } from './score-pin';
import type { RestaurantMapProps } from './types';

const KM_PER_DEGREE = 111;

/**
 * Version web : react-native-maps n'existe pas sur le web, on garde une carte
 * dessinée où les repères sont placés selon leurs vraies coordonnées.
 */
function MapBackground({ width, height }: { width: number; height: number }) {
  return (
    <Svg width={width} height={height} style={{ position: 'absolute', left: 0, top: 0 }}>
      <Rect width={width} height={height} fill={colors.carteSol} />
      <Path
        d={`M-20 ${height * 0.18} C ${width * 0.23} ${height * 0.14}, ${width * 0.41} ${height * 0.23}, ${width * 0.67} ${height * 0.17} S ${width} ${height * 0.11}, ${width + 30} ${height * 0.14} L ${width + 30} 0 L -20 0 Z`}
        fill={colors.carteEau}
      />
      <Path d={`M-10 ${height * 0.39} L ${width + 10} ${height * 0.3}`} stroke={colors.surface} strokeWidth={14} />
      <Path d={`M${width * 0.15} ${height * 0.21} L ${width * 0.36} ${height + 20}`} stroke={colors.surface} strokeWidth={10} />
      <Path d={`M${width * 0.64} ${height * 0.19} L ${width * 0.77} ${height + 20}`} stroke={colors.surface} strokeWidth={10} />
      <Path d={`M-10 ${height * 0.66} L ${width + 10} ${height * 0.59}`} stroke={colors.surface} strokeWidth={8} />
      <Rect x={width * 0.41} y={height * 0.45} width={70} height={60} rx={6} fill={colors.carteParc} />
      <SvgText x={40} y={height * 0.12} fontSize={12} fill="#4A6672" fontStyle="italic">
        Fleuve Congo
      </SvgText>
      <SvgText x={20} y={height * 0.56} fontSize={13} fill={colors.texteSecondaire} fontWeight="700" letterSpacing={2}>
        GOMBE
      </SvgText>
    </Svg>
  );
}

export function RestaurantMap({ ref, restaurants, center, radiusKm, selectedId, bestId, onSelect }: RestaurantMapProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useImperativeHandle(ref, () => ({ recenter: () => {} }), []);

  const origin = { x: size.width / 2, y: size.height / 2 };
  // Le rayon choisi occupe presque toute la plus petite dimension.
  const pxPerKm = (Math.min(size.width, size.height) / 2 - 24) / radiusKm;
  const project = (lat: number, lng: number) => ({
    x: origin.x + (lng - center.longitude) * KM_PER_DEGREE * pxPerKm,
    y: origin.y - (lat - center.latitude) * KM_PER_DEGREE * pxPerKm,
  });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ width, height });
  };

  return (
    <View className="flex-1 overflow-hidden bg-carte-sol" onLayout={onLayout}>
      {size.width > 0 ? (
        <>
          <MapBackground width={size.width} height={size.height} />
          <Svg width={size.width} height={size.height} style={{ position: 'absolute', left: 0, top: 0 }}>
            <Circle
              cx={origin.x}
              cy={origin.y}
              r={radiusKm * pxPerKm}
              stroke={colors.vertRadar}
              strokeWidth={1.5}
              fill="rgba(31, 122, 77, 0.06)"
            />
          </Svg>
          {restaurants.map((r) => {
            const p = project(r.latitude, r.longitude);
            return (
              <Pressable
                key={r.id}
                accessibilityRole="button"
                accessibilityLabel={`${r.name}, ${formatScore(r.score.total)}`}
                onPress={() => onSelect(r.id)}
                style={{ position: 'absolute', left: p.x - 24, top: p.y - 16, zIndex: r.id === selectedId ? 3 : 1 }}>
                <ScorePin restaurant={r} best={r.id === bestId} selected={r.id === selectedId} />
              </Pressable>
            );
          })}
          <View
            accessibilityLabel="Ma position"
            style={{ position: 'absolute', left: origin.x - 22, top: origin.y - 22 }}>
            <UserDot />
          </View>
        </>
      ) : null}
    </View>
  );
}
