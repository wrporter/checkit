import React from 'react';
import Typography from '@material-ui/core/Typography';
import { TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import * as itemService from '../items/ItemService';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useAsync } from 'react-async';
import Item from '../items/Item';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

const useStyles = makeStyles(() => ({
    input: {
        marginTop: 12,
        marginBottom: 24,
    },
}));

export default function Home() {
    const classes = useStyles();
    const [hideCompleted, setHideCompleted] = React.useState(true);
    const [value, setValue] = React.useState('');
    const [saveError, setSaveError] = React.useState('');
    const [items, setItems] = React.useState([]);
    const { error, isPending } = useAsync({
        promiseFn: itemService.getItems,
        onResolve: value => setItems(value.items),
    });

    const handleKeyDown = e => {
        setSaveError('');
        if (e.key === 'Enter') {
            const item = { text: e.target.value };
            itemService
                .saveItem(item)
                .then(savedItem => {
                    setItems([savedItem].concat(items));
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
            <FormControlLabel
                control={
                    <Switch
                        checked={hideCompleted}
                        onChange={e => setHideCompleted(e.target.checked)}
                    />
                }
                label="Hide completed items"
            />
            <Box>
                {isPending ? (
                    <CircularProgress />
                ) : error ? (
                    'Failed to load!'
                ) : items ? (
                    items.map(item => (
                        <Item
                            key={item.id}
                            id={item.id}
                            text={item.text}
                            dateCompleted={item.dateCompleted}
                            hideCompleted={hideCompleted}
                        />
                    ))
                ) : null}
            </Box>
        </Box>
    );
}
