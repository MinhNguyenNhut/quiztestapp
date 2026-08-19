import { Typography, Card, CardContent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type {
  Control,
  FieldErrors,
  UseFormWatch,
  UseFormSetValue,
} from 'react-hook-form';

import type { QuizFormValues } from '../../../types/index.ts';
import { RichTextEditor } from '../../common/RichTextEditor/index.ts';

interface Props {
  control: Control<QuizFormValues>;
  errors: FieldErrors<QuizFormValues>;
  watch: UseFormWatch<QuizFormValues>;
  setValue: UseFormSetValue<QuizFormValues>;
  index: number;
}

export default function ExplanationSection({
  watch,
  setValue,
  index,
}: Props) {
  const { t } = useTranslation();

  const question = watch(`questions.${index}`);

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        overflow: 'unset',
      }}
    >
      <CardContent>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            mb: 0.5,
          }}
        >
          {t('questionBuilder.explanation')}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          {t('questionBuilder.explanationDescription')}
        </Typography>

        <RichTextEditor
          value={
            question?.explanation ?? {
              html: '',
              text: '',
            }
          }
          onChange={(content) => {
            setValue(
              `questions.${index}.explanation`,
              content,
              {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              }
            );
          }}
          placeholder={t(
            'questionBuilder.explanationEditorPlaceholder'
          )}
          minHeight={150}
          showToolbar
        />
      </CardContent>
    </Card>
  );
}
