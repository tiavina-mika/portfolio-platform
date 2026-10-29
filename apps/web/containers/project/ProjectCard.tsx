import { getTranslations } from 'next-intl/server';

import Button from '@/components/buttons/Button';
import TextLink from '@/components/typography/TextLink';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardImage,
  CardTitle,
} from '@/components/ui/Card';
import { Locale } from '@/i18n/config';
import { ROUTES } from '@/i18n/routes';
import { getImageByBreakpoint } from '@/server/responsive.server';
import { IProject } from '@/types/project.type';
import { getTranslatedField } from '@/utils/translation.utils';

type Props = {
  project: IProject;
  locale: Locale;
};

const Project = async ({ project, locale }: Props) => {
  const t = await getTranslations('Common');

  const responsiveImage = project.has('previewImage')
    ? await getImageByBreakpoint(project.get('previewImage')!)
    : project.get('image')?.url;

  return (
    <TextLink
      underline={false}
      useChildSpan={false}
      className={`
        group flex flex-col self-stretch
        first-line:flex
      `}
      href={ROUTES.projects.preview(
        getTranslatedField(project.get('translated'), locale, 'slug')
      )}
    >
      <Card className={`
        gap-5
        lg:gap-0
      `}
      >
        <CardHeader>
          {responsiveImage && (
            <CardImage
              alt={getTranslatedField(project.get('translated'), locale, 'title')}
              loading="lazy"
              objectSize="scale-down"
              src={responsiveImage}
            />
          )}
        </CardHeader>
        <CardContent>
          <CardTitle
            className="group-hover:text-info-light group-hover:underline"
            level={5}
          >
            {getTranslatedField(project.get('translated'), locale, 'name')}
          </CardTitle>
          <CardDescription size="md">
            {getTranslatedField(
              project.get('translated'),
              locale,
              'description'
            )}
          </CardDescription>
        </CardContent>
        <CardFooter className="flex flex-1 items-end self-stretch">
          <Button
            className="w-full"
            color="primary"
            size="md"
            variant="contained"
          >
            {t('seeMore')}
          </Button>
        </CardFooter>
      </Card>
    </TextLink>
  );
};

export default Project;
