import React, { ChangeEventHandler } from 'react';
import Checkbox from '@mui/material/Checkbox';
import makeStyles from '@mui/styles/makeStyles';
import classNames from 'classnames';
import * as itemService from './ItemService';
import { Snackbar } from '@mui/material';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Collapse from '@mui/material/Collapse';

const useStyles = makeStyles(theme => ({
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

    const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
        const checked = event.target.checked;
        handleToggle(checked);
    };

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
            .catch(err => {
                setChecked(!checked);
                setError(err.message);
            });
    };

    const handleErrorClose = () => {
        setError('');
    };

    return (
        <Collapse in={showCompleted || !checked}>
            <ListItem
                data-testid={`Home.Item.${id}`}
                data-checked={checked}
                dense
                button
                onClick={handleToggle(!checked)}
                className={classNames({
                    [classes.checked]: checked,
                })}
            >
                <ListItemIcon>
                    <Checkbox
                        color="primary"
                        edge="start"
                        checked={checked}
                        onChange={handleChange}
                    />
                </ListItemIcon>
                <ListItemText primary={text} />
                <Snackbar
                    open={!!error}
                    message={error}
                    autoHideDuration={5000}
                    onClose={handleErrorClose}
                />
            </ListItem>
        </Collapse>
    );
}
