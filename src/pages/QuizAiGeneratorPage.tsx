import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Controller, useForm, useWatch, type Resolver } from 'react-hook-form';
import { z } from 'zod/v4';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { v4 as uuidv4 } from 'uuid';
import type { QuestionFormValues, QuestionType, QuizFormValues } from '../types';
import { formValuesToQuiz, quizToFormValues } from '../utils/quizMappers';
import { useAppDispatch, useAppSelector } from '../features/store';
import {
  clearGeneratedQuiz,
  generateAiQuiz,
  removeGeneratedQuestion,
} from '../features/aiQuiz/aiQuizSlice';
import type { GenerateAiQuizRequest } from '../api/aiQuizApi';
import { getQuestionTypeLabel } from '../types/quiz';

const QUESTION_TYPES = [
  'single_choice',
  'multiple_choice',
  'true_false',
  'fill_in_blank',
  'matching',
  'reading_comprehension',
  'short_answer',
  'essay',
] as const satisfies readonly QuestionType[];
const MAX_SOURCE_LENGTH = 12000;

export default function QuizAiGeneratorPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const generated = useAppSelector((state) => state.aiQuiz.generated);
  const isGenerating = useAppSelector((state) => state.aiQuiz.isGenerating);
  const generationError = useAppSelector((state) => state.aiQuiz.error);

  const formSchema = useMemo(
    () =>
      z.object({
        prompt: z.string()
          .trim()
          .min(1, t('aiQuiz.requiredPrompt'))
          .max(2000, t('aiQuiz.promptTooLong')),
        questionCount: z.number().int()
          .min(1, t('aiQuiz.questionCountRange'))
          .max(30, t('aiQuiz.questionCountRange')),
        difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']),
        language: z.enum(['vi', 'en']),
        questionTypes: z.array(z.enum(QUESTION_TYPES)).min(1, t('aiQuiz.selectQuestionType')),
        sourceMaterial: z.string().max(MAX_SOURCE_LENGTH, t('aiQuiz.sourceTooLong')),
      }),
    [t],
  );
  type GeneratorFormValues = z.infer<typeof formSchema>;
  const {
    control,
    setValue,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<GeneratorFormValues>({
    resolver: zodResolver(formSchema) as Resolver<GeneratorFormValues>,
    defaultValues: {
      prompt: '',
      questionCount: 10,
      difficulty: 'mixed',
      language: 'en',
      questionTypes: ['multiple_choice', 'true_false'],
      sourceMaterial: '',
    },
    mode: 'onChange',
  });
  const prompt = useWatch({ control, name: 'prompt' });
  const sourceMaterial = useWatch({ control, name: 'sourceMaterial' });
  const [sourceError, setSourceError] = useState<string | null>(null);

  const canGenerate = isValid && !isGenerating;
  const generate = handleSubmit((values) => {
    const request: GenerateAiQuizRequest = {
      ...values,
      ...(values.sourceMaterial.trim()
        ? { sourceMaterial: values.sourceMaterial.trim() }
        : {}),
    };
    void dispatch(generateAiQuiz(request));
  });

  const handleTextFile = async (file: File | undefined) => {
    if (!file) return;
    setSourceError(null);
    if (file.size > MAX_SOURCE_LENGTH * 4) {
      setSourceError('tooLong');
      return;
    }
    try {
      const text = await file.text();
      if (text.length > MAX_SOURCE_LENGTH) {
        setSourceError('tooLong');
        return;
      }
      setValue('sourceMaterial', text, { shouldDirty: true, shouldValidate: true });
    } catch {
      setSourceError('readFailed');
    }
  };

  const handleOpenEditor = () => {
    if (!generated?.questions.length) return;
    const now = new Date().toISOString();
    const safeValues = sanitizeQuizText(generated);
    const mappedValues = quizToFormValues(
      formValuesToQuiz(safeValues, {
        id: uuidv4(),
        createdAt: now,
        updatedAt: now,
      }),
    );
    dispatch(clearGeneratedQuiz());
    navigate('/quiz/new', { state: { aiDraft: mappedValues } });
  };

  const displayError =
    generationError?.status === 429
      ? t('aiQuiz.rateLimit')
      : generationError
        ? t('aiQuiz.generationFailed')
        : null;

  return (
    <Box sx={{ mx: 'auto', pb: 4 }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 3 }}>
        <AutoAwesomeIcon color="primary" sx={{ fontSize: 32 }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {t('aiQuiz.title')}
          </Typography>
          <Typography color="text.secondary">{t('aiQuiz.subtitle')}</Typography>
        </Box>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant="outlined">
            <CardContent component="form" onSubmit={(event) => void generate(event)}>
              <Stack spacing={2.25}>
                <Controller
                  control={control}
                  name="prompt"
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('aiQuiz.promptLabel')}
                      placeholder={t('aiQuiz.promptPlaceholder')}
                      multiline
                      minRows={4}
                      maxRows={8}
                      required
                      slotProps={{ htmlInput: { maxLength: 2000 } }}
                      error={Boolean(errors.prompt)}
                      helperText={
                        errors.prompt?.message ??
                        t('aiQuiz.promptCharacterCount', { count: prompt.length })
                      }
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="questionCount"
                  render={({ field }) => (
                    <TextField
                      {...field}
                      value={Number.isNaN(field.value) ? '' : field.value}
                      onChange={(event) => {
                        const value = event.target.value;
                        field.onChange(value === '' ? Number.NaN : Number(value));
                      }}
                      label={t('aiQuiz.questionCount')}
                      type="number"
                      error={Boolean(errors.questionCount)}
                      helperText={errors.questionCount?.message ?? t('aiQuiz.questionCountRange')}
                      slotProps={{ htmlInput: { min: 1, max: 30, step: 1 } }}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel id="ai-quiz-difficulty-label">{t('aiQuiz.difficulty')}</InputLabel>
                      <Select {...field} labelId="ai-quiz-difficulty-label" label={t('aiQuiz.difficulty')}>
                        {(['easy', 'medium', 'hard', 'mixed'] as const).map((level) => (
                          <MenuItem key={level} value={level}>{t(`aiQuiz.${level}`)}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />

                <Controller
                  control={control}
                  name="language"
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel id="ai-quiz-language-label">{t('aiQuiz.language')}</InputLabel>
                      <Select {...field} labelId="ai-quiz-language-label" label={t('aiQuiz.language')}>
                        <MenuItem value="en">{t('aiQuiz.english')}</MenuItem>
                        <MenuItem value="vi">{t('aiQuiz.vietnamese')}</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {t('aiQuiz.questionTypes')}
                  </Typography>
                  <Controller
                    control={control}
                    name="questionTypes"
                    render={({ field }) => (
                      <FormGroup>
                        {QUESTION_TYPES.map((type) => (
                          <FormControlLabel
                            key={type}
                            control={
                              <Checkbox
                                checked={field.value.includes(type)}
                                onChange={(_, checked) => {
                                  const updated = checked
                                    ? [...field.value, type]
                                    : field.value.filter((selected) => selected !== type);
                                  field.onChange(updated);
                                }}
                              />
                            }
                            label={getQuestionTypeLabel(type, t)}
                          />
                        ))}
                      </FormGroup>
                    )}
                  />
                  {errors.questionTypes?.message && (
                    <FormHelperMessage>{errors.questionTypes.message}</FormHelperMessage>
                  )}
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    {t('aiQuiz.sourceMaterial')}
                  </Typography>
                  <Controller
                    control={control}
                    name="sourceMaterial"
                    render={({ field }) => (
                      <TextField
                        {...field}
                        onChange={(event) => {
                          field.onChange(event);
                          setSourceError(null);
                        }}
                        placeholder={t('aiQuiz.sourcePlaceholder')}
                        multiline
                        minRows={3}
                        fullWidth
                        error={Boolean(errors.sourceMaterial) || Boolean(sourceError)}
                        helperText={
                          sourceError === 'tooLong'
                            ? t('aiQuiz.sourceTooLong')
                            : sourceError === 'readFailed'
                              ? t('aiQuiz.fileReadFailed')
                              : errors.sourceMaterial?.message ??
                                t('aiQuiz.sourceCharacterCount', { count: sourceMaterial.length })
                        }
                        slotProps={{ htmlInput: { maxLength: MAX_SOURCE_LENGTH } }}
                      />
                    )}
                  />
                  <Button
                    component="label"
                    size="small"
                    startIcon={<DescriptionOutlinedIcon />}
                    sx={{ mt: 1 }}
                  >
                    {t('aiQuiz.uploadTextFile')}
                    <input
                      hidden
                      type="file"
                      accept=".txt,text/plain"
                      onChange={(event) => {
                        void handleTextFile(event.currentTarget.files?.[0]);
                        event.currentTarget.value = '';
                      }}
                    />
                  </Button>
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={isGenerating ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeIcon />}
                  disabled={!canGenerate}
                >
                  {isGenerating ? t('aiQuiz.generating') : generated ? t('aiQuiz.regenerate') : t('aiQuiz.generate')}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          {displayError && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={generate} disabled={!canGenerate}>
                  {t('aiQuiz.retry')}
                </Button>
              }
              sx={{ mb: 2 }}
            >
              {displayError}
            </Alert>
          )}

          {isGenerating ? (
            <Card variant="outlined">
              <CardContent sx={{ minHeight: 240, display: 'grid', placeItems: 'center' }}>
                <Stack spacing={2} sx={{ alignItems: 'center' }}>
                  <CircularProgress />
                  <Typography color="text.secondary">{t('aiQuiz.generating')}</Typography>
                </Stack>
              </CardContent>
            </Card>
          ) : generated ? (
            <Card variant="outlined">
              <CardContent>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.5}
                  sx={{ alignItems: { xs: 'stretch', sm: 'center' }, mb: 2 }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {generated.title}
                    </Typography>
                    {generated.description && (
                      <Typography variant="body2" color="text.secondary">
                        {generated.description}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      {t('aiQuiz.previewDescription')}
                    </Typography>
                  </Box>
                  <Chip label={t('quizList.questions', { count: generated.questions.length })} />
                </Stack>
                <Stack spacing={1.5}>
                  {generated.questions.map((question, index) => (
                    <QuestionPreview
                      key={question.id ?? `${question.type}-${index}`}
                      question={question}
                      index={index}
                      onRemove={() => dispatch(removeGeneratedQuestion(index))}
                    />
                  ))}
                  {generated.questions.length === 0 && (
                    <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                      {t('aiQuiz.noQuestions')}
                    </Typography>
                  )}
                </Stack>
                <Stack
                  direction={{ xs: 'column-reverse', sm: 'row' }}
                  spacing={1.5}
                  sx={{ justifyContent: 'flex-end', mt: 2.5 }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<AutoAwesomeIcon />}
                    onClick={generate}
                    disabled={!canGenerate}
                  >
                    {t('aiQuiz.regenerate')}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleOpenEditor}
                    disabled={generated.questions.length === 0}
                  >
                    {t('aiQuiz.openInEditor')}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ) : (
            <Card variant="outlined" sx={{ height: '100%', minHeight: 240 }}>
              <CardContent sx={{ height: '100%', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
                <Typography color="text.secondary">{t('aiQuiz.previewDescription')}</Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

function FormHelperMessage({ children }: { children: string }) {
  return <Typography variant="caption" color="error.main">{children}</Typography>;
}

function QuestionPreview({
  question,
  index,
  onRemove,
}: {
  question: QuestionFormValues;
  index: number;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {t('aiQuiz.questionNumber', { number: index + 1 })}
              </Typography>
              <Chip size="small" label={getQuestionTypeLabel(question.type, t)} />
            </Stack>
            <Typography sx={{ fontWeight: 600, mb: 0.5 }}>{question.title}</Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {question.content.text}
            </Typography>
            {question.options.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  {t('aiQuiz.options')}
                </Typography>
                <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                  {question.options.map((option, optionIndex) => (
                    <Stack
                      key={option.id ?? `${option.text}-${optionIndex}`}
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: 'center' }}
                    >
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {option.text}
                      </Typography>
                      {option.isCorrect && (
                        <Chip size="small" color="success" label={t('aiQuiz.correctAnswer')} />
                      )}
                    </Stack>
                  ))}
                </Stack>
              </Box>
            )}
            {question.blanks && question.blanks.length > 0 && (
              <PreviewDetails
                title={t('aiQuiz.blanks')}
                lines={question.blanks.map((blank) => `${blank.label}: ${blank.correctAnswer ?? ''}`)}
              />
            )}
            {question.matchingPairs && question.matchingPairs.length > 0 && (
              <PreviewDetails
                title={t('aiQuiz.matchingPairs')}
                lines={question.matchingPairs.map((pair) => `${pair.left} ↔ ${pair.right}`)}
              />
            )}
            {question.passage?.text && (
              <PreviewDetails title={t('aiQuiz.passage')} lines={[question.passage.text]} />
            )}
            {question.childQuestions && question.childQuestions.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  {t('aiQuiz.childQuestions')}
                </Typography>
                {question.childQuestions.map((child, childIndex) => (
                  <Box key={child.id ?? `${child.type}-${childIndex}`} sx={{ mt: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {childIndex + 1}. {child.title}
                    </Typography>
                    <Typography variant="body2">{child.content.text}</Typography>
                    {child.options.map((option, optionIndex) => (
                      <Typography key={option.id ?? `${option.text}-${optionIndex}`} variant="body2">
                        {option.text}{option.isCorrect ? ` — ${t('aiQuiz.correctAnswer')}` : ''}
                      </Typography>
                    ))}
                    {child.expectedAnswer && (
                      <Typography variant="body2" color="text.secondary">
                        {t('aiQuiz.expectedAnswer')}: {child.expectedAnswer}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            )}
            {question.expectedAnswer && (
              <PreviewDetails
                title={t('aiQuiz.expectedAnswer')}
                lines={[question.expectedAnswer]}
              />
            )}
            {(question.scoringGuide || question.rubric?.text) && (
              <PreviewDetails
                title={t('aiQuiz.scoringGuide')}
                lines={[question.scoringGuide || question.rubric?.text || '']}
              />
            )}
            {question.explanation?.text && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                <Box component="span" sx={{ fontWeight: 600 }}>
                  {t('aiQuiz.explanation')}:{' '}
                </Box>
                {question.explanation.text}
              </Typography>
            )}
          </Box>
          <IconButton
            aria-label={t('aiQuiz.removeQuestion', { number: index + 1 })}
            color="error"
            onClick={onRemove}
            size="small"
          >
            <DeleteOutlinedIcon />
          </IconButton>
        </Stack>
      </CardContent>
    </Card>
  );
}

function PreviewDetails({ title, lines }: { title: string; lines: string[] }) {
  return (
    <Box sx={{ mt: 1 }}>
      <Typography variant="caption" sx={{ fontWeight: 700 }}>{title}</Typography>
      {lines.map((line, index) => (
        <Typography key={`${index}-${line}`} variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
          {line}
        </Typography>
      ))}
    </Box>
  );
}

function sanitizeQuizText(values: QuizFormValues): QuizFormValues {
  return {
    ...values,
    questions: values.questions.map(sanitizeQuestionText),
  };
}

function sanitizeQuestionText(question: QuestionFormValues): QuestionFormValues {
  const safeRichText = (content: QuestionFormValues['content'] | undefined) =>
    content ? { ...content, html: escapeHtml(content.text) } : undefined;
  const content = safeRichText(question.content) ?? { html: '', text: '' };
  if (question.type === 'fill_in_blank' && question.blanks?.length) {
    let blankIndex = 0;
    content.html = escapeHtml(question.content.text).replace(/\[BLANK_\d+\]/g, () => {
      blankIndex += 1;
      const blank = question.blanks?.[blankIndex - 1];
      if (!blank) return '';
      return `<span contenteditable="false" class="blank-placeholder" data-blank-id="${escapeHtml(blank.id)}">[BLANK_${blankIndex}]</span>`;
    });
    content.blanks = question.blanks;
  }
  return {
    ...question,
    content,
    explanation: safeRichText(question.explanation),
    passage: safeRichText(question.passage),
    rubric: safeRichText(question.rubric),
    childQuestions: question.childQuestions?.map(sanitizeQuestionText),
  };
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character] ?? character;
  });
}
