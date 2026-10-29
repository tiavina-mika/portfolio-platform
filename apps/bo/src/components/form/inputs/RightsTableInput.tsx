
import { Checkbox } from '@mui/material';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { ChangeEvent, useEffect, useState } from 'react';


import { defaultRights } from '@/constants/user.constants';
import { IRights, IRightsItem } from '@/types/role.type';

type Props = {
  value: IRightsItem[];
  onChange: (options: IRightsItem[]) => void;
};

const RightsTableInput = ({
  value, onChange,
}: Props) => {
  const [options, setOptions] = useState<IRightsItem[]>([]);
  const [isCheckedAll, setIsCheckedAll] = useState<boolean>(false);

  useEffect(() => {
    setOptions(value);
  }, [value]);

  // on checked one checkbox
  const handleChecked = (type: string, key: keyof IRights) => (event: ChangeEvent<HTMLInputElement>) => {
    setIsCheckedAll(false);
    const newOptions = options.map((option) => {
      return {
        ...option,
        rights: {
          ...option.rights,
          [key]:
            type === option.className // if the current cell
              ? event.target.checked // use the checkbox value
              : (option as any).rights[key],
        }, // use the previous value
      };
    });

    // update the state
    onChange(newOptions);
  };

  // check all rights
  const onCheckedAll = () => {
    setIsCheckedAll(!isCheckedAll);

    const newOptions = options.map((option: IRightsItem) => {
      const newRights: Record<string, any> = {};

      Object.keys(option.rights).forEach((key: any) => {
        newRights[key] = !isCheckedAll;
      });

      return {
        ...option,
        rights: newRights, // use the previous value
      };
    });

    // update the state
    onChange(newOptions as any);
  };

  return (
    <TableContainer component={Paper}>
      <Table aria-label="simple table" sx={{ minWidth: 650 }}>
        {/* head */}
        <TableHead>
          <TableRow>
            <TableCell key="checkboxes">
              <Checkbox checked={isCheckedAll} onChange={onCheckedAll} />
            </TableCell>
            {options.map((option, index) => (
              <TableCell key={index}>{option.label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        {/* body */}
        <TableBody>
          {/* the number of row should be the number of rights (4 here) */}
          {Object.keys(defaultRights).map((key, rightIndex) => (
            <TableRow key={rightIndex} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell sx={{ textTransform: 'capitalize' }}>{key}</TableCell>
              {/* the number of remaining cells should be the number of column */}
              {/* (other than the first column) */}
              {options.map((option, index) => (
                <TableCell key={option.className + index}>
                  <Checkbox
                    checked={(option as any).rights[key]}
                    onChange={handleChecked(option.className, key as keyof IRights)}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RightsTableInput;
