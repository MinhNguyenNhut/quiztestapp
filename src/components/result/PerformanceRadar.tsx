import { Card, CardContent, Typography, Box, Stack } from '@mui/material';
import type { BreakdownStat } from '../../shared/utils/resultStats';

interface PerformanceRadarProps {
  difficulty: BreakdownStat[];
  topic: BreakdownStat[];
  accuracyOverall: number; // 0..1
  participation: number; // 0..1
}

interface AxisSpec {
  label: string;
  value: number; // 0..1
  color: string;
}

const SIZE = 260;
const RADIUS = 110;
const CENTER = SIZE / 2;
const AXES = 5;

const toCartesian = (i: number, value: number): { x: number; y: number } => {
  const angle = (Math.PI * 2 * i) / AXES - Math.PI / 2;
  return {
    x: CENTER + RADIUS * value * Math.cos(angle),
    y: CENTER + RADIUS * value * Math.sin(angle),
  };
};

const polygonPath = (axes: AxisSpec[]): string =>
  axes
    .map((axis, i) => {
      const { x, y } = toCartesian(i, axis.value);
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ')
    .concat(' Z');

export const PerformanceRadar = ({ difficulty, topic, accuracyOverall, participation }: PerformanceRadarProps) => {
  // Compose 5 axes: easy, medium, hard, accuracy, participation.
  const byDiff = (label: string) =>
    difficulty.find((d) => d.label.toLowerCase() === label)?.accuracy ?? 0;

  const axes: AxisSpec[] = [
    { label: 'Easy', value: byDiff('easy'), color: '#22c55e' },
    { label: 'Medium', value: byDiff('medium'), color: '#eab308' },
    { label: 'Hard', value: byDiff('hard'), color: '#ef4444' },
    { label: 'Accuracy', value: accuracyOverall, color: '#6366f1' },
    { label: 'Participation', value: participation, color: '#0ea5e9' },
  ];

  // If topic data is empty, hide the topic subtitle.
  const hasTopic = topic.length > 0;

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
      <CardContent>
        <Typography variant="overline" sx={{ fontWeight: 600, color: 'text.secondary' }}>
          Performance radar
        </Typography>
        <Stack sx={{ mt: 1, alignItems: "center" }}>
          <Box sx={{ width: SIZE, height: SIZE }}>
            <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
              {/* Gridlines */}
              {[0.25, 0.5, 0.75, 1].map((scale) => (
                <polygon
                  key={scale}
                  points={Array.from({ length: AXES })
                    .map((_, i) => {
                      const { x, y } = toCartesian(i, scale);
                      return `${x},${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth={1}
                />
              ))}
              {/* Axes */}
              {axes.map((axis, i) => {
                const { x, y } = toCartesian(i, 1);
                return (
                  <line
                    key={axis.label}
                    x1={CENTER}
                    y1={CENTER}
                    x2={x}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeWidth={1}
                  />
                );
              })}
              {/* Filled polygon */}
              <path d={polygonPath(axes)} fill="rgba(99,102,241,0.18)" stroke="#6366f1" strokeWidth={2} />
              {/* Vertex labels */}
              {axes.map((axis, i) => {
                const { x, y } = toCartesian(i, 1.18);
                return (
                  <text
                    key={axis.label}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={11}
                    fontWeight={600}
                    fill="#475569"
                  >
                    {axis.label}
                  </text>
                );
              })}
            </svg>
          </Box>
          {hasTopic && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
              {topic.length} topic{topic.length === 1 ? '' : 's'} covered in this quiz.
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
