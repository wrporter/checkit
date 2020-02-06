import React from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { makeStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import * as itemService from './ItemService';
import { Snackbar } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
    root: {
        paddingLeft: 8,
        paddingRight: 8,
        width: '100%',
        '&:hover': {
            backgroundColor: theme.palette.grey['200'],
        },
    },
    labelCompleted: {
        textDecoration: 'line-through',
    },
    checked: {
        backgroundColor: theme.palette.grey['300'],
    },
}));

export default function Item({ id, text, dateCompleted, hideCompleted }) {
    const classes = useStyles();
    const [checked, setChecked] = React.useState(!!dateCompleted);
    const [error, setError] = React.useState('');

    const handleChange = event => {
        const checked = event.target.checked;
        setChecked(checked);
        itemService
            .updateItemStatus(id, checked ? 'Complete' : 'Incomplete')
            .catch(err => {
                setChecked(!checked);
                setError(err.message);
            });
    };

    const handleErrorClose = () => {
        setError('');
    };

    return hideCompleted && checked ? null : (
        <>
            <FormControlLabel
                className={classNames(classes.root, {
                    [classes.checked]: checked,
                })}
                control={<Checkbox checked={checked} onChange={handleChange} />}
                label={
                    <span
                        className={classNames({
                            [classes.labelCompleted]: checked,
                        })}
                    >
                        {text}
                    </span>
                }
            />
            <Snackbar
                open={!!error}
                message={error}
                autoHideDuration={5000}
                onClose={handleErrorClose}
            />
        </>
    );
}
