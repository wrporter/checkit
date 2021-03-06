import React from 'react';
import Typography from '@material-ui/core/Typography';
import { TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import * as itemService from '../items/ItemService';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useAsync } from 'react-async';
import Item from '../items/Item';
import List from '@material-ui/core/List';
import Controls from './Controls';

const useStyles = makeStyles(theme => ({
    input: {
        marginTop: 12,
        marginBottom: 24,
    },
    controls: {
        position: 'fixed',
        '&.MuiSpeedDial-directionUp': {
            bottom: theme.spacing(4),
            right: theme.spacing(4),
        },
    },
}));

export default function Home() {
    const classes = useStyles();
    const [showCompleted, setShowCompleted] = React.useState(false);
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

    const handleShowCompletedChange = value => {
        setShowCompleted(value);
    };
    const handleDeleteCompleted = () => {
        const incompleteItems = items.filter(item => !item.dateCompleted);
        setItems(incompleteItems);
    };
    const handleItemChange = (itemId, dateCompleted) => {
        // TODO Clean this up. This logic of mutating a value within the items list is a hack.
        items.find(item => item.id === itemId).dateCompleted = dateCompleted;
        setItems(items);
    };

    return (
        <Box>
            <Typography variant="h4">Get stuff done!</Typography>
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

            <List>
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
                            showCompleted={showCompleted}
                            onChange={handleItemChange}
                        />
                    ))
                ) : null}
            </List>

            <Controls
                className={classes.controls}
                showCompleted={showCompleted}
                onShowCompletedChange={handleShowCompletedChange}
                onDeleteCompleted={handleDeleteCompleted}
            />
        </Box>
    );
}
