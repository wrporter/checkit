import React from 'react';
import Typography from '@material-ui/core/Typography';
import { TextField } from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import * as itemService from './ItemService';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useAsync } from 'react-async';

const useStyles = makeStyles(() => ({
    input: {
        marginTop: 12,
        marginBottom: 24,
    },
}));

export default function Home() {
    const classes = useStyles();
    const [value, setValue] = React.useState('');
    const { data = { items: [] }, setData, error, isPending } = useAsync({
        promiseFn: itemService.getItems,
    });
    const [saveError, setSaveError] = React.useState('');

    const handleKeyDown = e => {
        setSaveError('');
        if (e.key === 'Enter') {
            const item = { text: e.target.value };
            itemService
                .saveItem(item)
                .then(savedItem => {
                    setData({ items: [savedItem].concat(data.items) });
                    setValue('');
                })
                .catch(err => setSaveError(err.message));
        }
    };
    const handleChange = e => {
        setValue(e.target.value);
    };

    return (
        <Box>
            <Typography variant="h2">Get stuff done!</Typography>
            <TextField
                label="What do you want to do?"
                fullWidth
                inputProps={{ onKeyDown: handleKeyDown }}
                value={value}
                onChange={handleChange}
                className={classes.input}
            />
            {saveError ? (
                <Typography style={{ color: 'red' }}>{saveError}</Typography>
            ) : null}
            <Box>
                {isPending ? (
                    <CircularProgress />
                ) : error ? (
                    'Failed to load!'
                ) : data && data.items ? (
                    data.items.map(item => (
                        <FormControlLabel
                            key={item.id}
                            control={<Checkbox />}
                            label={item.text}
                            style={{ width: '100%' }}
                        />
                    ))
                ) : null}
            </Box>
        </Box>
    );
}
