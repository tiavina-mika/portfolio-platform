import NextIcon from '@/components/NextIcon';
import Text from '@/components/typography/Text';
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Select as UISelect,
} from '@/components/ui/Select';
import { ISelectOption } from '@/types/app.type';
import { TextSizeType } from '@/types/component.type';
import { cn } from '@/utils/app.utils';

export type SelectProps = {
  className?: string;
  inputClassName?: string;
  label?: string;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  onChange?: (e: any) => void;
  options: ISelectOption[];
  value?: any;
  fullWidth?: boolean;
  labelSize?: TextSizeType;
  hideCaretIcon?: boolean;
  iconSize?: number;
};

const Select = ({
  label,
  placeholder,
  options,
  className,
  onChange,
  disabled,
  inputClassName,
  error,
  value,
  hideCaretIcon = false,
  labelSize = 'sm',
  fullWidth,
  iconSize = 12,
}: SelectProps) => {
  return (
    <div
      className={cn(fullWidth ? 'w-full' : `
        w-[175px]
        sm:w-[180px]
      `, className)}
    >
      {label && (
        <Text as="span" size={labelSize}>
          {label}
        </Text>
      )}
      <UISelect
        defaultValue={value}
        disabled={disabled}
        onValueChange={onChange}
      >
        <SelectTrigger
          className={cn('w-full', error ? 'border-red-500' : '', inputClassName)}
          hideCaretIcon={hideCaretIcon}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center">
                {option.icon && (
                  <NextIcon
                    alt={option.label}
                    className="mr-2"
                    size={iconSize}
                    src={option.icon as string}
                  />
                )}
                {option.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </UISelect>
    </div>
  );
};

export default Select;
