import React from 'react';
import Typography from '@mui/material/Typography';
import { TextField } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import Box from '@mui/material/Box';
import * as itemService from '../items/ItemService';
import CircularProgress from '@mui/material/CircularProgress';
import { useAsync } from 'react-async';
import List from '@mui/material/List';
import Controls from './Controls';
import { Item as ItemType } from '../items/ItemService';
import Item from '../items/Item';

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
    const [items, setItems] = React.useState<ItemType[]>([]);
    const { error, isPending } = useAsync({
        promiseFn: itemService.getItems,
        onResolve: value => setItems(value.items),
    });

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        setSaveError('');
        if (e.key === 'Enter') {
            const item = { text: value };
            itemService
                .saveItem(item)
                .then(savedItem => {
                    setItems([savedItem].concat(items));
                    setValue('');
                })
                .catch(err => setSaveError(err.message));
        }
    };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    };

    const handleShowCompletedChange = (value: boolean) => {
        setShowCompleted(value);
    };
    const handleDeleteCompleted = () => {
        const incompleteItems = items.filter(item => !item.dateCompleted);
        setItems(incompleteItems);
    };
    const handleItemChange = (itemId: string, dateCompleted?: string) => {
        // TODO Clean this up. This logic of mutating a value within the items list is a hack.
        const item = items.find(item => item.id === itemId);
        if (item) {
            item.dateCompleted = dateCompleted;
        }
        setItems(items);
    };

    return (
        <Box>
            <Typography variant="h4">Get stuff done!</Typography>
            <TextField
                label="What do you want to do?"
                fullWidth
                inputProps={{
                    onKeyDown: handleKeyDown,
                    'data-testid': "Home.AddItemTextBox"
                }}
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
