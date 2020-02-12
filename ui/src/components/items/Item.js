import React from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import { makeStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import * as itemService from './ItemService';
import { Snackbar } from '@material-ui/core';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';

const useStyles = makeStyles(theme => ({
    checked: {
        textDecoration: 'line-through',
        backgroundColor: theme.palette.grey['300'],
        '&:hover': {
            textDecoration: 'line-through',
        },
    },
}));

export default function Item({
    id,
    text,
    dateCompleted,
    showCompleted,
    onChange,
}) {
    const classes = useStyles();
    const [checked, setChecked] = React.useState(!!dateCompleted);
    const [error, setError] = React.useState('');

    const handleChange = event => {
        const checked = event.target.checked;
        handleToggle(checked);
    };

    const handleToggle = checked => () => {
        setChecked(checked);
        itemService
            .updateItemStatus(id, checked ? 'Complete' : 'Incomplete')
            .then(() => {
                if (checked) {
                    onChange(new Date().toISOString());
                } else {
                    onChange();
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

    if (showCompleted || !checked) {
        return (
            <ListItem
                dense
                button
                onClick={handleToggle(!checked)}
                className={classNames(classes.root, {
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
        );
    }

    return null;
}
