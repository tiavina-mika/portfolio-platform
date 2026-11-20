'use client';

import { Paperclip } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ChangeEvent, useRef } from 'react';

import Button from '@/components/buttons/Button';
import { QUOTE_FILE_ACCEPT } from '@/utils/contact.constants';
import { formatFileSize } from '@/utils/contact.utils';

type Props = {
  files: File[];
  /**
   * The names of the files that were refused (format or size), told under the button
   */
  rejectedNames: string[];
  /**
   * @default false
   */
  disabled?: boolean;
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
};

/**
 * The attachments of the quote request: a button that opens the file picker, then the list of the files
 * picked, each one with its size and a button that removes it
 */
const ContactFiles = ({
  files, rejectedNames, disabled = false, onAdd, onRemove,
}: Props) => {
  const t = useTranslations('ContactPage');
  const tCommon = useTranslations('Common');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onAdd(Array.from(event.target.files ?? []));
    // the same file can be picked again after it was removed
    event.target.value = '';
  };

  return (
    <div className="grid gap-3">
      <span className="flex items-baseline gap-1 text-sm leading-[1.3] font-medium">
        {t('files')}
        <span className="text-[13px] font-normal text-muted-foreground">
          ({tCommon('optional').toLowerCase()})
        </span>
      </span>
      {/* the button below opens it: the input itself is out of the tab order */}
      <input
        multiple
        accept={QUOTE_FILE_ACCEPT}
        aria-label={t('files')}
        className="sr-only"
        onChange={handleChange}
        ref={inputRef}
        tabIndex={-1}
        type="file"
      />
      <Button
        className="justify-self-start"
        disabled={disabled}
        iconLeft={<Paperclip aria-hidden size={20} />}
        onClick={() => inputRef.current?.click()}
        variant="outline"
      >
        {t('addFiles')}
      </Button>
      <span className="text-[13px] leading-[1.45] text-muted-foreground">{t('filesHint')}</span>
      {rejectedNames.length > 0 && (
        <p className="m-0 text-sm leading-[1.4] font-medium text-destructive-text" role="alert">
          {t('fileRejected', { names: rejectedNames.join(', ') })}
        </p>
      )}
      <ul aria-live="polite" className="m-0 grid list-none gap-2 p-0">
        {files.map((file, index) => (
          <li
            key={`${file.name}-${file.size}`}
            className={`
              flex items-center justify-between gap-3 rounded-md border border-border bg-card py-2 pr-2 pl-3
            `}
          >
            <div className="grid min-w-0 gap-0.5">
              <b className={`
                text-[15px] leading-[1.3] font-medium
                [overflow-wrap:anywhere]
              `}
              >{file.name}</b>
              <span className="font-mono text-xs leading-[1.4] font-medium text-muted-foreground">
                {formatFileSize(file.size, { kb: t('unitKb'), mb: t('unitMb') })}
              </span>
            </div>
            <Button
              aria-label={t('removeFile', { name: file.name })}
              className="flex-none"
              disabled={disabled}
              onClick={() => onRemove(index)}
              variant="outline"
            >
              {t('remove')}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContactFiles;
