import React, { ChangeEventHandler } from 'react';
import Checkbox from '@mui/material/Checkbox';
import makeStyles from '@mui/styles/makeStyles';
import classNames from 'classnames';
import { ListItemButton, Snackbar } from '@mui/material';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Collapse from '@mui/material/Collapse';
import * as itemService from '../../services/ItemService';

const useStyles = makeStyles((theme) => ({
    checked: {
        textDecoration: 'line-through',
        backgroundColor: theme.palette.grey['300'],
        '&:hover': {
            textDecoration: 'line-through',
        },
    },
}));

interface ItemProps {
    id: string;
    text: string;
    dateCompleted?: string;
    showCompleted: boolean;
    onChange: (id: string, date?: string) => void;
}

export default function Item({
    id,
    text,
    dateCompleted,
    showCompleted,
    onChange,
}: ItemProps) {
    const classes = useStyles();
    const [checked, setChecked] = React.useState(!!dateCompleted);
    const [error, setError] = React.useState('');
    const labelId = `checkbox-item-label-${id}`;

    const handleToggle = (checked: boolean) => () => {
        setChecked(checked);
        itemService
            .updateItemStatus(id, checked ? 'Complete' : 'Incomplete')
            .then(() => {
                if (checked) {
                    onChange(id, new Date().toISOString());
                } else {
                    onChange(id);
                }
            })
            .catch((err) => {
                setChecked(!checked);
                setError(err.message);
            });
    };

    const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
        const { checked } = event.target;
        handleToggle(checked);
    };

    const handleErrorClose = () => {
        setError('');
    };

    return (
        <Collapse in={showCompleted || !checked}>
            <ListItem
                data-testid={`Home.Item.${id}`}
                data-checked={checked}
                className={classNames({
                    [classes.checked]: checked,
                })}
                disablePadding
            >
                <ListItemButton
                    role={undefined}
                    onClick={handleToggle(!checked)}
                >
                    <ListItemIcon>
                        <Checkbox
                            edge="start"
                            checked={checked}
                            onChange={handleChange}
                            tabIndex={-1}
                            disableRipple
                            inputProps={{ 'aria-labelledby': labelId }}
                        />
                    </ListItemIcon>
                    <ListItemText id={labelId} primary={text} />

                    <Snackbar
                        open={!!error}
                        message={error}
                        autoHideDuration={5000}
                        onClose={handleErrorClose}
                    />
                </ListItemButton>
            </ListItem>
        </Collapse>
    );
}
