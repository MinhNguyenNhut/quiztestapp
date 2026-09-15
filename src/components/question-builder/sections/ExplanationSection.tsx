import { memo, useCallback, useMemo } from 'react';
import { Typography, Card, CardContent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { type Control, type UseFormSetValue, type UseFormGetValues } from 'react-hook-form';
import type { QuizFormValues, RichTextContent } from '../../../types/index.ts';
import { RichTextEditor } from '../../common/RichTextEditor/index.ts';

interface Props {
  control: Control<QuizFormValues>;
  setValue: UseFormSetValue<QuizFormValues>;
  getValues: UseFormGetValues<QuizFormValues>;
  index: number;
}

const EMPTY_CONTENT: RichTextContent = { html: '', text: '' };

function ExplanationSection({ setValue, getValues, index }: Props) {
  const { t } = useTranslation();
  const explanation = getValues(`questions.${index}.explanation`);
  const resolvedExplanation = useMemo(() => explanation ?? EMPTY_CONTENT, [explanation]);

  const handleChange = useCallback(
    (content: RichTextContent) =>
      setValue(`questions.${index}.explanation`, content, { shouldDirty: true, shouldTouch: true, shouldValidate: false }),
    [setValue, index],
  );

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'unset' }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
          {t('questionBuilder.explanation')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('questionBuilder.explanationDescription')}
        </Typography>
        <RichTextEditor
          value={resolvedExplanation}
          onChange={handleChange}
          placeholder={t('questionBuilder.explanationEditorPlaceholder')}
          minHeight={150}
          showToolbar
        />
      </CardContent>
    </Card>
  );
}

export default memo(ExplanationSection);